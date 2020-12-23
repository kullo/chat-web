/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as bip39 from 'bip39';
import { CryptoService } from '../../crypto';
import { CurrentDeviceService, ServerDevice } from '../../current-device';
import { Encoding } from '../../util';
import { RestApiService } from '../../server-types';

@Component({
  selector: 'app-activation-pending',
  templateUrl: './activation-pending.component.html',
  styleUrls: ['./activation-pending.component.less']
})
export class ActivationPendingComponent implements OnInit {

  fingerprint: string

  constructor(
    private crypto: CryptoService,
    private currentDevice: CurrentDeviceService,
    private restApi: RestApiService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.currentDevice.device().then(async device => {
       let fingerprintAsHex = await this.crypto.makeFingerprint(device.pubkey.data);
       this.fingerprint = bip39.entropyToMnemonic(fingerprintAsHex);
    })

    this.startActivatedWatcher();
  }

  private async startActivatedWatcher(): Promise<void> {
    while ((await this.checkActivated()) !== true) {
      await this.sleep(2500);
    }

    this.router.navigate(["/chat"]);
  }

  private async sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async checkActivated(): Promise<boolean> {
    return this.restApi.getConversations()
      .then(conversations => {
        return true;
      })
      .catch(error => {
        if (error && error.status && error.status == 401) {
          return false;
        } else {
          console.log("Unexpected error:", error);
          throw Error("Unexpected error: " + error);
        }
      });
  }
}
