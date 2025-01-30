import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {SessionService} from '../session.service';
import {JwtHelperService} from '@auth0/angular-jwt';

export const sessionGuard: CanActivateFn = (route, state) => {
  const _service: SessionService = inject(SessionService);
  const _validSession: boolean = _service.isSessionValid();

  return !_validSession? inject(Router).createUrlTree(['/login']) : true;
};
