/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Assert } from "../util";

export class MasterKey {
  private makeTypeIncompatible: void;

  constructor(public readonly data: Uint8Array) {
    Assert.isSet(data, "data must be set");
    Assert.isEqual(data.length, 32, "data must have 256 bit / 32 bytes");
  }
}

// values must not exceed 0x7FFFFFFF (see https://github.com/jedisct1/libsodium.js/issues/135)
export enum Subkey {
  loginKey = 0x01,
  passwordVerificationKey = 0x02,
  encryptionPrivkeyEncryptingKey = 0x03,
}
