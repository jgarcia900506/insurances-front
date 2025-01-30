import {Injectable} from '@angular/core';
import {CommonsClientService} from './commons-client.service';
import { firstValueFrom, tap} from 'rxjs';
import * as _ from 'underscore';

import {Client} from './models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  private _backup: Array<Client> = [];

  constructor(private _service: CommonsClientService) { }

  fetchAll(): Promise<Array<Client>> {
    return firstValueFrom(this._service.get<Array<Client>>('clients').pipe(
      tap((data: Client[]) => {
        this._backup = data
      }),
    ));
  }

  merge(change: Client): void {
    let isNew: boolean = false;
    const stored: Client | undefined = _.findWhere(this._backup, {id: change.id});
    if(!_.isUndefined(stored)) {
      let payload = {
          user: {
            id: _.propertyOf(_.propertyOf(stored)('user'))('id'),
            authorities: _.map(_.propertyOf(_.propertyOf(stored)('user'))('authorities'), (element) => {
              return { id: element.id }
            })
         }
      };

      if (stored.email != change.email) {
        Object.assign(payload.user,  { username: change.email });
      }
      Object.assign(change, payload);
      isNew = true;
    }

    if(change.id === 0) {
      change.id = undefined;
    }

    this._service.post(`clients`, change).subscribe((result) => {
      if(!isNew) {
        this._backup = _.reject(this._backup, {"id": result.id});
      }

      this._backup.push(result);
    });
  }

  removeOne(id: number): void {
    firstValueFrom(this._service.delete<Client>(`clients/${id}`).pipe(
      tap((result) => {
        this._backup = _.reject(this._backup, {"id": result.id});
      })
    ));
  }

  filter(filter: string): Array<Client> {
    return _.filter(this._backup, (element) => {
      const props: Array<string> = _.keys(element);
      return  _.some(props, (key) => {
        const value: unknown = _.propertyOf(element)(key);

        if(!value || _.isNull(value) || _.isUndefined(value)) {
          return false;
        }
        return _.isString(value)? value.includes(filter) : _.isNumber(value)? value.toString().includes(filter) : false;
      });
    });
  }

  useBackup(): Array<Client> {
    return this._backup;
  }

}
