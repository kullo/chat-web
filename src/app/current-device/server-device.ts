/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Ed25519Pubkey, Ed25519Signature, SignatureBundle } from "../crypto";
import { Assert, Encoding, Optionals } from "../util";

export class ServerDevice {
  private makeTypeIncompatible: void;

  constructor(
    public readonly id: string,
    public readonly ownerId: number,
    public readonly pubkey: Ed25519Pubkey,
    public readonly state: string,
    public readonly blockTime: string | null,
    public readonly idOwnerIdSignature: SignatureBundle,
  ) {
    Assert.isSet(id, "id must be set");
    Assert.isSet(ownerId, "ownerId must be set");
    Assert.isSet(pubkey, "pubkey must be set");
    Assert.isSet(state, "state must be set");
    Assert.isDefined(blockTime, "blockTime must be defined");
    Assert.isSet(idOwnerIdSignature, "idOwnerIdSignature must be set");

    Assert.isEqual(id, idOwnerIdSignature.deviceId);
  }

  toJson(): object {
    return {
      id: this.id,
      ownerId: this.ownerId,
      pubkey: Encoding.toBase64(this.pubkey.data),
      state: this.state,
      blockTime: this.blockTime,
      idOwnerIdSignature: this.idOwnerIdSignature.toString(),
    }
  }

  static fromJson(json: any): ServerDevice {
    Assert.isSet(json, "json must be set");

    return new ServerDevice(
      json.id,
      json.ownerId,
      new Ed25519Pubkey(Encoding.fromBase64(json.pubkey)),
      json.state,
      Optionals.undefinedToNull(json.blockTime),
      SignatureBundle.fromString(json.idOwnerIdSignature),
    );
  }
}
