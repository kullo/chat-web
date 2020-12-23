/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminComponent } from './admin/admin.component';
import { DevicesComponent } from './devices/devices.component';
import { UsersComponent } from './users/users.component';

const routes: Routes = [
  { path: '', redirectTo: 'users', pathMatch: 'full' },
  {
    path: '',
    component: AdminComponent,
    children: [
      { path: 'users', component: UsersComponent },
      { path: 'devices', component: DevicesComponent },
    ],
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
