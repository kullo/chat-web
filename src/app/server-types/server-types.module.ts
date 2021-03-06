/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { NgModule } from '@angular/core';

import { PermissionEncryptionService } from './permission-encryption.service';
import { PermissionPackerService } from './permission-packer.service';
import { PermissionSignerService } from './permission-signer.service';
import { RestApiService } from './rest-api.service';

@NgModule({
  imports: [],
  declarations: [],
  providers: [
    PermissionEncryptionService,
    PermissionPackerService,
    PermissionSignerService,
    RestApiService,
  ],
})
export class ServerTypesModule { }
