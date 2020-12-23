/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Encoding, Config, Assert } from '../util';

import { LocalDevice } from './local-device';
import { ServerDevice } from './server-device';

interface DevicePublisherServiceInterface {
  publish(localDevice: LocalDevice, email: string, passwordVerificationKey: Uint8Array): Promise<ServerDevice>
}

export class FakeDevicePublisherService implements DevicePublisherServiceInterface {
  publish(localDevice: LocalDevice, email: string, passwordVerificationKey: Uint8Array): Promise<ServerDevice> {
    return Promise.reject("not implemented");
  }
}

@Injectable()
export class DevicePublisherService implements DevicePublisherServiceInterface {

  constructor(
    private http: HttpClient,
  ) { }

  async publish(localDevice: LocalDevice, email: string, passwordVerificationKey: Uint8Array): Promise<ServerDevice> {
    Assert.isSet(localDevice, "localDevice must be set");
    Assert.isSet(email, "email must be set");
    Assert.isSet(passwordVerificationKey, "passwordVerificationKey must be set");

    let device = localDevice.toServerDevice("pending");

    let data = {
      email: email,
      passwordVerificationKey: Encoding.toBase64(passwordVerificationKey),
      device: device.toJson(),
    }
    console.log("Sending device via REST", data)
    let responseBody = await this.http
      .post(Config.API_BASE_URL + '/devices', data)
      .toPromise()
    console.log("REST response", responseBody);
    return ServerDevice.fromJson(responseBody);
  }

}
