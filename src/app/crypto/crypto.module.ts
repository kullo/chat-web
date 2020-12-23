/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { NgModule } from '@angular/core';

import { CryptoService } from './crypto.service';

@NgModule({
  providers: [
    CryptoService,
  ],
})
export class CryptoModule { }
