/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CryptoService, EncryptionPrivkeyEncrypted, SymmetricKey, MasterKey, Subkey } from '../../crypto';
import { CurrentDeviceService, DeviceGeneratorService, DevicePublisherService } from '../../current-device';
import { User } from '../../server-types';
import { Assert } from '../../util';

import { LoginRequestsService } from '../login-requests.service';
import { HeavyCryptoService } from '../heavy-crypto.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.less']
})
export class RegistrationComponent implements OnInit {

  name: string
  email: string
  password1: string
  password2: string
  loadingVisible: boolean = false
  passwordHashingProgress: number

  private pkdfStep1TimeEstimation: Promise<number>

  constructor(
    private crypto: CryptoService,
    private currentDevice: CurrentDeviceService,
    private deviceGenerator: DeviceGeneratorService,
    private devicePublisher: DevicePublisherService,
    private heavyCrypto: HeavyCryptoService,
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
    const pkdfStep1TimeEstimation = await this.pkdfStep1TimeEstimation;

    this.passwordHashingProgress = 0;
    this.loadingVisible = true;

    Assert.isEqual(this.password1, this.password2); // TODO: Move to form validation
    let name = this.name
    let email = this.email;
    let password = this.password1;

    console.log("Register", name, email, password);

    let start = Date.now();
    let interval = setInterval(() => {
      const timeElapsed = (Date.now() - start) / 1000;
      const ratio = timeElapsed / pkdfStep1TimeEstimation;
      this.passwordHashingProgress = ratio;
    }, 50);

    let masterKey = new MasterKey(await this.heavyCrypto.pkdfStep1(password));
    let loginKey = await this.crypto.kdf(Subkey.loginKey, masterKey);
    let passwordVerificationKey = await this.crypto.kdf(Subkey.passwordVerificationKey, masterKey);
    let encryptionPrivkeyEncryptingKey = new SymmetricKey(await this.crypto.kdf(Subkey.encryptionPrivkeyEncryptingKey, masterKey));
    let passwordHashingTime = (Date.now()-start) / 1000;
    console.log(
      "Password hashing time (seconds):", passwordHashingTime,
      "runtime/estimation:", (100*passwordHashingTime/pkdfStep1TimeEstimation).toFixed(2), "%");

    clearInterval(interval);

    let encryptionKeypair = await this.crypto.generateEncryptionKeypair();
    let encryptionPrivkeyEncrypted = new EncryptionPrivkeyEncrypted(
      await this.crypto.encryptWithSymmetricKey(encryptionKeypair.privkey.data, encryptionPrivkeyEncryptingKey)
    );

    this.loginRequests.register(
      name,
      email,
      loginKey,
      passwordVerificationKey,
      encryptionKeypair.pubkey,
      encryptionPrivkeyEncrypted,
    )
    .then(async response => {
      console.log("Registration ok:", response);
      let user = User.fromJson(response["user"]);

      let device = await this.deviceGenerator.generate(user.id);
      let serverDevice = await this.devicePublisher.publish(device, email, passwordVerificationKey);

      this.currentDevice.setDevice(device);
      this.currentDevice.setLoginKey(loginKey);
      this.currentDevice.setEncryptionPrivkeyEncryptingKey(encryptionPrivkeyEncryptingKey);
      this.currentDevice.setEncryptionKeypair(encryptionKeypair);

      if (serverDevice.state == "active") {
        this.router.navigate(["/chat"]);
      } else {
        this.router.navigate(['..', "activation_pending"], { relativeTo: this.route });
      }
    })
    .catch(error => {
      console.error("Error during registration:", error);
    })
  }

}
