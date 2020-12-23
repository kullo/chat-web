/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { CryptoModule } from './crypto';
import { CurrentDeviceModule } from './current-device/current-device.module';
import { StorageModule } from './storage';
import { ServerTypesModule } from './server-types';

import { AppComponent } from './app/app.component';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    CryptoModule,
    CurrentDeviceModule,
    ServerTypesModule,
    StorageModule,
    HttpClientModule,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
