import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {CredentialModel} from './models/credential.model';
import {CommonsClientService} from './commons-client.service';
import { map, BehaviorSubject} from 'rxjs';
import * as _ from 'underscore';

import {JwtHelperService} from '@auth0/angular-jwt';
import {AuthorityModel} from './models/authority.model';
import {isPlatformBrowser} from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class SessionService {

  isLogged: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isAdmin:  BehaviorSubject<boolean> = new BehaviorSubject(false);

  private _storage!: Storage

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private _c: CommonsClientService, private _s: JwtHelperService) {
    if(isPlatformBrowser(this.platformId)) {
      this._storage = localStorage;
    }
  }

  authenticate(credential: CredentialModel): void {
    this._c.post<CredentialModel>('login', credential).pipe(
      map((result) => {
        if(result && _.isObject(result) && _.property('token')(result)) {
          _.each(['token', 'user'], (_key: string) => {
            const _val: string | null = this._storage.getItem(_key);

            if(_.isNull(_val)) {

              const _object: string | object = _.propertyOf(result)(_key);
              if(_.isObject(_object)) {

                if(_.property('authorities')(_object)) {
                  const _authority: AuthorityModel | null = _.first(_.propertyOf(_object)('authorities'));
                  if(_authority && _authority.name === 'administrator') {
                    this.isAdmin.next(true);
                  }
                }

                this._storage.setItem(_key, JSON.stringify(_object));
                this.isLogged.next(true);
              } else if(!_.isNull(_object)) {
                this._storage.setItem(_key, `${_object}`);
              }

            }
          });
        }
      })
    ).subscribe(result => {});
  }

  isSessionValid(): boolean {
    const token: string | null = (this._storage)? this._storage.getItem('token') : null;
    return !_.isNull(token) && !this._s.isTokenExpired(token);
  }

}
