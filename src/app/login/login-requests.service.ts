/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Encoding, Config, Assert } from '../util';
import { EncryptionPubkey, EncryptionPrivkey, EncryptionPrivkeyEncrypted } from '../crypto';

interface LoginRequestsServiceInterface {
  register(
    name: string,
    email: string,
    loginKey: Uint8Array,
    passwordVerificationKey: Uint8Array,
    encryptionPubkey: EncryptionPubkey,
    encryptionPrivkey: EncryptionPrivkeyEncrypted,
  ): Promise<any>
  getMe(email: string, passwordVerificationKey: Uint8Array): Promise<any>
}

export class FakeLoginRequestsService implements LoginRequestsServiceInterface {
  register(
    name: string,
    email: string,
    loginKey: Uint8Array,
    passwordVerificationKey: Uint8Array,
    encryptionPubkey: EncryptionPubkey,
    encryptionPrivkey: EncryptionPrivkeyEncrypted,
  ): Promise<any> {
    return Promise.resolve({});
  }
  getMe(email: string, passwordVerificationKey: Uint8Array): Promise<any> {
    return Promise.resolve({});
  }
}

@Injectable()
export class LoginRequestsService implements LoginRequestsServiceInterface {

  constructor(
    private http: HttpClient,
  ) { }

  async register(
    name: string,
    email: string,
    loginKey: Uint8Array,
    passwordVerificationKey: Uint8Array,
    encryptionPubkey: EncryptionPubkey,
    encryptionPrivkey: EncryptionPrivkeyEncrypted,
  ): Promise<any> {
    Assert.isSet(name, "name is set");
    Assert.isSet(email, "email is set");
    Assert.isSet(loginKey, "loginKey is set");
    Assert.isSet(passwordVerificationKey, "passwordVerificationKey is set");
    Assert.isSet(encryptionPubkey, "encryptionPubkey is set");
    Assert.isSet(encryptionPrivkey, "encryptionPrivkey is set");

    let requestBody = {
      name: name,
      email: email,
      loginKey: Encoding.toBase64(loginKey),
      passwordVerificationKey: Encoding.toBase64(passwordVerificationKey),
      encryptionPubkey: Encoding.toBase64(encryptionPubkey.data),
      encryptionPrivkey: Encoding.toBase64(encryptionPrivkey.data),
    }
    let response = await this.http
      .post(Config.API_BASE_URL + "/users", requestBody)
      .toPromise();
    return response;
  }

  async getMe(email: string, passwordVerificationKey: Uint8Array): Promise<any> {
    let requestBody = {
      email: email,
      passwordVerificationKey: Encoding.toBase64(passwordVerificationKey),
    }
    let response = await this.http
      .post(Config.API_BASE_URL + "/users/get_me", requestBody)
      .toPromise();
    console.log("get_me result:", response);
    return response;
  }

}
