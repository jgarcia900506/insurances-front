import { Injectable } from '@angular/core';
import {Observable, of} from 'rxjs';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommonsClientService {

  constructor(private _c: HttpClient) {
    // --
  }

  get<T>(method: string, params?: HttpParams): Observable<T> {
    return this._c.get<T>(`/api/${method}`, { params: params });
  }

  post<T>(method: string, payload: T): Observable<T> {
    return  this._c.post<T>(`/api/${method}`, payload);
  }

  patch<T>(method: string, payload?: T): Observable<T> {
    return this._c.patch<T>(`/api/${method}`, payload);
  }

  delete<T>(method: string, params?: HttpParams): Observable<T> {
    return this._c.delete<T>(`/api/${method}`, { params: params });
  }

  private _mkHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  private _mkApiUrl(method:string): string {
    const {host, port, path} = environment.server;
    const isDev: boolean = port !== 443;
    return `${isDev? 'http' : 'https'}://${host}${isDev? `:${port}` : ''}${path}${path.endsWith('/')? method : `/${method}`}`;
  }

}
