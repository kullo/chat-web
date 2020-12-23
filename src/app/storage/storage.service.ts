/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Injectable } from '@angular/core';
import { Encoding } from '../util';

interface StorageServiceInterface {
  getString(prefix: string, key: string): string | undefined
  setString(prefix: string, key: string, value: string): void
  getBinary(prefix: string, key: string): Uint8Array | undefined
  setBinary(prefix: string, key: string, value: Uint8Array): void
  delete(prefix: string, key: string): void
}

export class FakeStorageService implements StorageServiceInterface {
  private storage = new Map<string, any>()

  getString(prefix: string, key: string): string | undefined {
    return this.storage.get(prefix + "_" + key);
  }

  setString(prefix: string, key: string, value: string): void {
    this.storage.set(prefix + "_" + key, value);
  }

  getBinary(prefix: string, key: string): Uint8Array | undefined {
    return this.storage.get(prefix + "_" + key);
  }

  setBinary(prefix: string, key: string, value: Uint8Array): void {
    this.storage.set(prefix + "_" + key, value);
  }

  delete(prefix: string, key: string): void {
    this.storage.delete(prefix + "_" + key);
  }
}

@Injectable()
export class StorageService implements StorageServiceInterface {

  private storage: Storage;

  constructor() {
    this.storage = localStorage;
  }

  getString(prefix: string, key: string): string | undefined {
    let strValue = this.storage.getItem(this.fullStorageKey(prefix, key));
    if (strValue == null) return undefined;
    return strValue;
  }

  setString(prefix: string, key: string, value: string): void {
    this.storage.setItem(this.fullStorageKey(prefix, key), value);
  }

  getBinary(prefix: string, key: string): Uint8Array | undefined {
    let strValue = this.getString(prefix, key);
    if (strValue == undefined) return undefined;
    return Encoding.fromBase64(strValue);
  }

  setBinary(prefix: string, key: string, value: Uint8Array): void {
    let strValue = Encoding.toBase64(value);
    this.setString(prefix, key, strValue);
  }

  delete(prefix: string, key: string): void {
    this.storage.removeItem(this.fullStorageKey(prefix, key));
  }

  private fullStorageKey(prefix: string, key: string): string {
    return prefix + "_" + key;
  }
}
