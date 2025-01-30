import { Routes } from '@angular/router';
import {DashboardComponent} from './components/dashboard/dashboard.component';
import {LoginComponent} from './components/login/login.component';
import {sessionGuard} from './services/guards/session.guard';

export const routes: Routes = [{
  path: '',
  component: DashboardComponent,
  canActivate: [sessionGuard]
}, {
  path: 'login',
  component: LoginComponent
}];
