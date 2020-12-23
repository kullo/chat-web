/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CryptoService, EncryptionPubkey, EncryptionPrivkeyEncrypted, EncryptionKeypair, SymmetricKey, EncryptionPrivkey, Subkey, MasterKey } from '../../crypto';
import { CurrentDeviceService, DeviceGeneratorService, DevicePublisherService } from '../../current-device';
import { User } from '../../server-types';
import { Encoding } from '../../util';

import { LoginRequestsService } from '../login-requests.service';
import { HeavyCryptoService } from '../heavy-crypto.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less']
})
export class LoginComponent implements OnInit {

  email: string
  password: string
  loadingVisible: boolean = false
  passwordHashingProgress: number

  private pkdfStep1TimeEstimation: Promise<number>

  constructor(
    private crypto: CryptoService,
    private currentDevice: CurrentDeviceService,
    private heavyCrypto: HeavyCryptoService,
    private deviceGenerator: DeviceGeneratorService,
    private devicePublisher: DevicePublisherService,
    private loginRequests: LoginRequestsService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.pkdfStep1TimeEstimation = new Promise<number>((resolve, reject) => {
      setTimeout(async () => {
        let estimation = await this.heavyCrypto.estimatePkdfStep1Time();
        resolve(estimation);
      }, 500);
    });

    this.pkdfStep1TimeEstimation.then(estimation => console.log("Estimated pkdf time:", estimation));
  }

  async onSubmit() {
    console.log("Login submitted. This may take up to 10 seconds, please wait.")
    const pkdfStep1TimeEstimation = await this.pkdfStep1TimeEstimation;

    this.passwordHashingProgress = 0;
    this.loadingVisible = true;

    let email = this.email;
    let password = this.password;

    let start = Date.now();
    let interval = setInterval(() => {
      const timeElapsed = (Date.now() - start) / 1000;
      const ratio = timeElapsed / pkdfStep1TimeEstimation;
      this.passwordHashingProgress = ratio;
    }, 50);

    let masterKey = new MasterKey(await this.heavyCrypto.pkdfStep1(password));
    let passwordHashingTime = (Date.now()-start) / 1000;
    console.log(
      "Password hashing time (seconds):", passwordHashingTime,
      "runtime/estimation:", (100*passwordHashingTime/pkdfStep1TimeEstimation).toFixed(2), "%");

    clearInterval(interval);

    let loginKey = await this.crypto.kdf(Subkey.loginKey, masterKey);
    let passwordVerificationKey = await this.crypto.kdf(Subkey.passwordVerificationKey, masterKey);
    let encryptionPrivkeyEncryptingKey = new SymmetricKey(await this.crypto.kdf(Subkey.encryptionPrivkeyEncryptingKey, masterKey));

    console.log(
      "LoginKey:", Encoding.toHex(loginKey),
      "PasswordVerificationKey:", Encoding.toHex(passwordVerificationKey),
      "EncryptionPrivkeyEncryptingKey:", Encoding.toHex(encryptionPrivkeyEncryptingKey.data),
    );

    let getMeBody = await this.loginRequests.getMe(email, passwordVerificationKey).catch(error => {
      // TODO: show error in UI
    });
    if (!getMeBody) return;
    let user = User.fromJson(getMeBody["user"]);
    let encryptionKeypair = await (async () => {
      let encryptionPrivkeyEncrypted = new EncryptionPrivkeyEncrypted(Encoding.fromBase64(getMeBody["encryptionPrivkey"]));
      let encryptionPrivkey = new EncryptionPrivkey(await this.crypto.decryptWithSymmetricKey(encryptionPrivkeyEncrypted.data, encryptionPrivkeyEncryptingKey));
      return new EncryptionKeypair(user.encryptionPubkey, encryptionPrivkey);
    })();

    let device = await this.deviceGenerator.generate(user.id);
    await this.devicePublisher.publish(device, email, passwordVerificationKey);

    this.currentDevice.setDevice(device);
    this.currentDevice.setLoginKey(loginKey);
    this.currentDevice.setEncryptionPrivkeyEncryptingKey(encryptionPrivkeyEncryptingKey);
    this.currentDevice.setEncryptionKeypair(encryptionKeypair);

    this.router.navigate(["activation_pending"], { relativeTo: this.route });
  }
}
