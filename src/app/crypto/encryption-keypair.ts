/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Assert } from '../util';

export class EncryptionPubkey {
  private makeTypeIncompatible: void;

  constructor(public readonly data: Uint8Array) {
  }
}

export class EncryptionPrivkey {
  private makeTypeIncompatible: void;

  constructor(public readonly data: Uint8Array) {
  }
}

export class EncryptionPrivkeyEncrypted {
  private makeTypeIncompatible: void;

  constructor(public readonly data: Uint8Array) {
  }
}

export class EncryptionKeypair {
  private makeTypeIncompatible: void;

  constructor(
    public readonly pubkey: EncryptionPubkey,
    public readonly privkey: EncryptionPrivkey,
  ) {
    Assert.isSet(this.pubkey);
    Assert.isSet(this.privkey);
  }

  static fromLibsodium(libsodiumKeyPair: any) {
    let pubkey = new EncryptionPubkey(libsodiumKeyPair.publicKey);
    let privkey = new EncryptionPrivkey(libsodiumKeyPair.privateKey);
    return new EncryptionKeypair(pubkey, privkey);
  }
}
