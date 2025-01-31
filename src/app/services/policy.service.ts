import {Injectable} from '@angular/core';
import {firstValueFrom, of, tap} from 'rxjs';
import * as _ from 'underscore';

import {Policy} from './models/policy.model';
import {CommonsClientService} from './commons-client.service';
import {Client} from './models/client.model';

@Injectable({
  providedIn: 'root'
})
export class PolicyService {

  private _backup: Map<number, Array<Policy>> = new Map<number, Array<Policy>>();

  constructor(private _service: CommonsClientService) { }

  fetchAllFor(id: number): Promise<Array<Policy>> {
    if(_.isUndefined(id)) {
      return firstValueFrom(of([]));
    }

    const mem: Array<Policy> | undefined = this._backup.get(id);

    return !_.isUndefined(mem)? firstValueFrom(of(mem)) : firstValueFrom(this._service.get<Array<Policy>>(`policies/user/${id}`).pipe(
      tap((data: Policy[]) => {
        if(_.isUndefined(this._backup.get(id)) && !_.isEmpty(data)) {
          this._backup.set(id, data);
        }
      }),
    ));
  }

  merge(change: Policy, client: Client): void {
    let isNew: boolean = !change.id;
    if(client.id) {
      if(client.id && (!change.clientId || change.clientId === 0)) {
        change.clientId = client.id;
      }

      if(change.id === 0){
        change.id = undefined;
        Object.assign(change, {status: true});
      } else {
        const mem = this._backup.get(change.clientId);
        if(!_.isUndefined(mem)) {
          const stored: Policy | undefined = _.findWhere(mem, {id: change.id});
          Object.assign(change, {status: stored?.status});
        }
      }

      this._service.post<Policy>('policies', change).subscribe((result) => {
        if(client.id) {
          this.updateBackup(result, client.id, isNew);
        }
      });
    }

  }

  disableOne(id: number, clientId: number): void {
    this._service.patch<Policy>(`policies/${id}/status`).subscribe((result) => {
      this.updateBackup(result, clientId, false);
    });
  }

  removeOne(id: number): void {
    firstValueFrom(this._service.delete<Policy>(`policies/${id}`).pipe(
      tap((result) => {
        if(result.clientId) {
          const dummy: Policy = Object.assign({});
          this.updateBackup(dummy, result.clientId, false);
        }
      })
    ));
  }

  filter(filter: string): Array<Policy> {
    return [];
  }

  private updateBackup(policy: Policy, clientId: number, isNew: boolean): void {
    let mem: Array<Policy> | undefined = this._backup.get(clientId);
    if(!mem) {
      mem = new Array<Policy>();
    }

    if(!isNew) {
      mem = _.reject(mem, {"id": policy.id});
    }

    if(_.keys(policy).length >0 ){
      mem.push(policy);
    }
    this._backup.delete(clientId);
    this._backup.set(clientId, mem);
  }

  useBackup(id: number): Array<Policy> | undefined {
    const mem: Array<Policy> | undefined = this._backup.get(id);
    return (mem)? mem : [];
  }

}
