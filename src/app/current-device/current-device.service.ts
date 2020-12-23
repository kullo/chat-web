/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Injectable } from '@angular/core';
import { CryptoService, Ed25519Pubkey, Ed25519Privkey, Ed25519Signature, EncryptionKeypair, EncryptionPubkey, EncryptionPrivkey, SymmetricKey } from '../crypto';
import { StorageService } from '../storage';
import { Config, Encoding } from '../util';

import { LocalDevice } from './local-device';

interface CurrentDeviceServiceInterface {
  device(): Promise<LocalDevice>
  setDevice(device: LocalDevice): void
  clearDevice(): void

  loginKey(): Promise<Uint8Array>
  setLoginKey(loginKey: Uint8Array): void
  clearLoginKey(): void

  encryptionPrivkeyEncryptingKey(): Promise<SymmetricKey>
  setEncryptionPrivkeyEncryptingKey(encryptionPrivkeyEncryptingKey: SymmetricKey): void
  clearEncryptionPrivkeyEncryptingKey(): void

  encryptionKeypair(): Promise<EncryptionKeypair>
  setEncryptionKeypair(keypair: EncryptionKeypair): void
  clearEncryptionKeypair(): void
}

export class FakeCurrentDeviceService implements CurrentDeviceServiceInterface {
  device(): Promise<LocalDevice> {
    return Promise.resolve(new LocalDevice(
      "aabbccdd",
      4444,
      new Ed25519Pubkey(Encoding.fromBase64("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=")),
      new Ed25519Privkey(Encoding.fromBase64("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==")),
      new Ed25519Signature(Encoding.fromHex("e5564300c360ac729086e2cc806e828a84877f1eb8e5d974d873e065224901555fb8821590a33bacc61e39701cf9b46bd25bf5f0595bbe24655141438e7a100b")),
    ))
  }
  setDevice(device: LocalDevice) {}
  clearDevice() {}

  loginKey() { return Promise.resolve(Encoding.fromBase64("AAAAAAAA")); }
  setLoginKey(loginKey: Uint8Array) {}
  clearLoginKey() {}

  encryptionPrivkeyEncryptingKey(): Promise<SymmetricKey> {
    return Promise.resolve(new SymmetricKey(Encoding.fromBase64("bCtaa/znxB5OBCZJkfaRYMFmpZvp4qIhNHQkDMnulCg=")));
  }
  setEncryptionPrivkeyEncryptingKey(encryptionPrivkeyEncryptingKey: SymmetricKey): void {}
  clearEncryptionPrivkeyEncryptingKey(): void {}

  encryptionKeypair(): Promise<EncryptionKeypair> {
    return Promise.resolve(new EncryptionKeypair(
      // pub: f99117ce7c356350470557567eab7aad2798ed5629814a6693e7714dbd6d9313
      // priv: 8069117c3428cc70cdf690992fc90d098f11bb696d8bcd8e7e705792f86e33fc
      new EncryptionPubkey(Encoding.fromHex("f99117ce7c356350470557567eab7aad2798ed5629814a6693e7714dbd6d9313")),
      new EncryptionPrivkey(Encoding.fromHex("8069117c3428cc70cdf690992fc90d098f11bb696d8bcd8e7e705792f86e33fc"))
    ));
  }
  setEncryptionKeypair(keypair: EncryptionKeypair) {}
  clearEncryptionKeypair() {}
}

@Injectable()
export class CurrentDeviceService implements CurrentDeviceServiceInterface {

  private STORAGE_PREFIX = "user1";
  private deviceCache: LocalDevice | undefined;
  private loginKeyCache: Uint8Array | undefined;
  private encryptionPrivkeyEncryptingKeyCache: SymmetricKey | undefined;
  private encryptionKeypairCache: EncryptionKeypair | undefined;

  constructor(
    private storage: StorageService,
  ) {
  }

  async device(): Promise<LocalDevice> {
    if (!this.deviceCache) {
       let storedDeviceJsonString = this.storage.getString(this.STORAGE_PREFIX, "device");
       if (!storedDeviceJsonString) {
         return Promise.reject("device not found, please log in.");
       }
       this.deviceCache = LocalDevice.fromJson(JSON.parse(storedDeviceJsonString));
    }

    return this.deviceCache;
  }

  setDevice(device: LocalDevice): void {
    this.storage.setString(this.STORAGE_PREFIX, "device", JSON.stringify(device.toJson()));
    this.deviceCache = device;
  }

  clearDevice(): void {
    this.storage.delete(this.STORAGE_PREFIX, "device");
    this.deviceCache = undefined;
  }

  loginKey(): Promise<Uint8Array> {
    if (!this.loginKeyCache) {
      let storedLoginKey = this.storage.getBinary(this.STORAGE_PREFIX, "loginKey");
      if (!storedLoginKey) return Promise.reject("loginKey not found, please log in.");
      this.loginKeyCache = storedLoginKey;
    }

    return Promise.resolve(this.loginKeyCache);
  }

  setLoginKey(loginKey: Uint8Array): void {
    this.storage.setBinary(this.STORAGE_PREFIX, "loginKey", loginKey);
    this.loginKeyCache = loginKey;
  }

  clearLoginKey(): void {
    this.storage.delete(this.STORAGE_PREFIX, "loginKey");
    this.loginKeyCache = undefined;
  }

  async encryptionPrivkeyEncryptingKey(): Promise<SymmetricKey> {
    if (!this.encryptionPrivkeyEncryptingKeyCache) {
      let storedEncryptionPrivkeyEncryptingKey = this.storage.getBinary(this.STORAGE_PREFIX, "encryptionPrivkeyEncryptingKey");
      if (!storedEncryptionPrivkeyEncryptingKey) return Promise.reject("encryptionPrivkeyEncryptingKey not found, please log in.");
      this.encryptionPrivkeyEncryptingKeyCache = new SymmetricKey(storedEncryptionPrivkeyEncryptingKey);
    }

    return Promise.resolve(this.encryptionPrivkeyEncryptingKeyCache);
  }

  setEncryptionPrivkeyEncryptingKey(encryptionPrivkeyEncryptingKey: SymmetricKey): void {
    this.storage.setBinary(this.STORAGE_PREFIX, "encryptionPrivkeyEncryptingKey", encryptionPrivkeyEncryptingKey.data);
    this.encryptionPrivkeyEncryptingKeyCache = encryptionPrivkeyEncryptingKey;
  }

  clearEncryptionPrivkeyEncryptingKey(): void {
    this.storage.delete(this.STORAGE_PREFIX, "encryptionPrivkeyEncryptingKey");
    this.encryptionPrivkeyEncryptingKeyCache = undefined;
  }

  encryptionKeypair(): Promise<EncryptionKeypair> {
    if (!this.encryptionKeypairCache) {
      let storedEncryptionPubkey = this.storage.getBinary(this.STORAGE_PREFIX, "encryptionPubkey");
      if (!storedEncryptionPubkey) return Promise.reject("encryptionPubkey not found, please log in.");
      let storedEncryptionPrivkey = this.storage.getBinary(this.STORAGE_PREFIX, "encryptionPrivkey");
      if (!storedEncryptionPrivkey) return Promise.reject("encryptionPrivkey not found, please log in.");
      this.encryptionKeypairCache = new EncryptionKeypair(
        new EncryptionPubkey(storedEncryptionPubkey),
        new EncryptionPrivkey(storedEncryptionPrivkey)
      );
    }

    return Promise.resolve(this.encryptionKeypairCache);
  }

  setEncryptionKeypair(keypair: EncryptionKeypair): void {
    this.storage.setBinary(this.STORAGE_PREFIX, "encryptionPubkey", keypair.pubkey.data);
    this.storage.setBinary(this.STORAGE_PREFIX, "encryptionPrivkey", keypair.privkey.data);
    this.encryptionKeypairCache = keypair;
  }

  clearEncryptionKeypair(): void {
    this.storage.delete(this.STORAGE_PREFIX, "encryptionPubkey");
    this.storage.delete(this.STORAGE_PREFIX, "encryptionPrivkey");
    this.encryptionKeypairCache = undefined;
  }
}
