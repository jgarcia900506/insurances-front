import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import * as _ from 'underscore';

import {SessionService} from '../../services/session.service';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, OnDestroy {

  loginForm: FormGroup;

  private sessionSubscription: Subscription;

  constructor(private _s: SessionService, private _r: Router, private _fd: FormBuilder) {
    this.loginForm = this._fd.group({
      username: ['', [Validators.required, Validators.email, Validators.minLength(15)]],
      password: ['', [Validators.required, Validators.minLength(10)]]
    });

    this.sessionSubscription = this._s.isLogged.subscribe((_e: boolean) => {
      _e && this._r.navigate(['/'], { replaceUrl: true });
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if(this.loginForm.valid) {
      this._s.authenticate(this.loginForm.value);
    }
  }

  ngOnDestroy(): void {
    _.each([this.sessionSubscription], (_s) => {
      _s.unsubscribe();
    });
  }
}
