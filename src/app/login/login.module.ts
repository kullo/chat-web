/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { LoginRoutingModule } from './login-routing.module';

import { ActivationPendingComponent } from './activation-pending/activation-pending.component';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { ProgressBarComponent } from './progress-bar/progress-bar.component';
import { RegistrationComponent } from './registration/registration.component';
import { LoginRequestsService } from './login-requests.service';
import { HeavyCryptoService } from './heavy-crypto.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    LoginRoutingModule,
  ],
  declarations: [
    ActivationPendingComponent,
    LoginComponent,
    LogoutComponent,
    ProgressBarComponent,
    RegistrationComponent,
  ],
  providers: [
    HeavyCryptoService,
    LoginRequestsService,
  ]
})
export class LoginModule { }
