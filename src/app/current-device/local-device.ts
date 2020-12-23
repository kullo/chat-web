/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Ed25519Pubkey, Ed25519Privkey, Ed25519Signature, SignatureBundle } from "../crypto";
import { Assert, Encoding } from "../util";

import { ServerDevice } from "./server-device";

export class LocalDevice {
  constructor(
    public readonly id: string,
    public readonly ownerId: number,
    public readonly pubkey: Ed25519Pubkey,
    public readonly privkey: Ed25519Privkey,
    public readonly idOwnerIdSignature: Ed25519Signature,
  ) {
    Assert.isSet(id, "id must be set");
    Assert.isSet(ownerId, "ownerId must be set");
    Assert.isSet(pubkey, "pubkey must be set");
    Assert.isSet(privkey, "privkey must be set");
    Assert.isSet(idOwnerIdSignature, "idOwnerIdSignature must be set");
  }

  toJson(): object {
    return {
      id: this.id,
      ownerId: this.ownerId,
      idOwnerIdSignature: Encoding.toBase64(this.idOwnerIdSignature.data),
      pubkey: Encoding.toBase64(this.pubkey.data),
      privkey: Encoding.toBase64(this.privkey.data),
    };
  }

  toServerDevice(state: string): ServerDevice {
    return new ServerDevice(
      this.id,
      this.ownerId,
      this.pubkey,
      state,
      null,
      new SignatureBundle(this.id, this.idOwnerIdSignature),
    )
  }

  static fromJson(json: any): LocalDevice {
    Assert.isSet(json, "json must be set");

    return new LocalDevice(
      json.id,
      json.ownerId,
      new Ed25519Pubkey(Encoding.fromBase64(json.pubkey)),
      new Ed25519Privkey(Encoding.fromBase64(json.privkey)),
      new Ed25519Signature(Encoding.fromBase64(json.idOwnerIdSignature)),
    )
  }
}
