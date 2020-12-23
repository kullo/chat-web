/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ActivationPendingComponent } from './activation-pending/activation-pending.component';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { RegistrationComponent } from './registration/registration.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'logout', component: LogoutComponent },
  { path: 'register', component: RegistrationComponent },
  { path: 'activation_pending', component: ActivationPendingComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginRoutingModule { }
