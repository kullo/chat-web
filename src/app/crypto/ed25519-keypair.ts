/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Assert } from '../util';

export class Ed25519Pubkey {
  private makeTypeIncompatible: void;

  constructor(public readonly data: Uint8Array) {
  }
}

export class Ed25519Privkey {
  private makeTypeIncompatible: void;

  constructor(public readonly data: Uint8Array) {
  }
}

export class Ed25519Keypair {
  private makeTypeIncompatible: void;

  constructor(
    public readonly pubkey: Ed25519Pubkey,
    public readonly privkey: Ed25519Privkey,
  ) {
    Assert.isSet(this.pubkey);
    Assert.isSet(this.privkey);
  }

  static fromLibsodium(libsodiumKeyPair: any) {
    let pubkey = new Ed25519Pubkey(libsodiumKeyPair.publicKey);
    let privkey = new Ed25519Privkey(libsodiumKeyPair.privateKey);
    return new Ed25519Keypair(pubkey, privkey);
  }
}
