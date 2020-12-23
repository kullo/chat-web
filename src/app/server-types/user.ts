/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { EncryptionPubkey } from "../crypto";
import { Assert, Optionals, Encoding } from "../util";

// TODO: Split into PlainUser and ServerUser to avoid having to deal with crypto in UI code
export class User {
  constructor(
    public readonly id: number,
    public readonly state: string,
    public readonly name: string,
    public readonly picture: string | null,
    public readonly encryptionPubkey: EncryptionPubkey,
  ) {
    Assert.isSet(id, "id must be set");
    Assert.isSet(state, "state must be set");
    Assert.isSet(name, "name must be set");
    Assert.isDefined(picture, "picture must be defined");
    Assert.isSet(encryptionPubkey, "encryptionPubkey must be set");
  }

  toJson(): object {
    return {
      id: this.id,
      state: this.state,
      name: this.name,
      picture: this.picture,
      encryptionPubkey: Encoding.toBase64(this.encryptionPubkey.data),
    }
  }

  static fromJson(json: any): User {
    Assert.isSet(json, "json must be set");
    return new User(
      json.id,
      json.state,
      json.name,
      Optionals.undefinedToNull(json.picture),
      new EncryptionPubkey(Encoding.fromBase64(json.encryptionPubkey)),
    );
  }
}
