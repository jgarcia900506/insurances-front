import { HttpInterceptorFn } from '@angular/common/http';
import {inject} from '@angular/core';
import {JwtHelperService} from '@auth0/angular-jwt';

export const jwtInterceptorInterceptor: HttpInterceptorFn = (req, next) => {
  const token : string | null = localStorage.getItem('token');
  if (token && !inject(JwtHelperService).isTokenExpired(token)) {

    const request = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(request);
  }

  return next(req);
};
