/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { EncryptedSymmetricKey, SignatureBundle } from '../crypto';
import { Assert, Encoding } from '../util';

import { ConversationKeyId } from './conversation-key-bundle';

export class ServerPermission {
  constructor(
    public readonly conversationId: string,
    public readonly conversationKeyId: ConversationKeyId,
    public readonly conversationKey: EncryptedSymmetricKey,
    public readonly ownerId: number,
    public readonly creatorId: number,
    public readonly validFrom: string,
    public readonly signature: SignatureBundle,
  ) {
    Assert.isSet(conversationId, "conversationId must be set");
    Assert.isSet(conversationKeyId, "conversationKeyId must be set");
    Assert.isSet(conversationKey, "conversationKey must be set");
    Assert.isSet(ownerId, "ownerId must be set");
    Assert.isSet(creatorId, "creatorId must be set");
    Assert.isSet(validFrom, "validFrom must be set");
    Assert.isSet(signature, "signature must be set");

    Assert.isOfType(conversationId, "string");
    Assert.isOfType(conversationKeyId, ConversationKeyId);
    Assert.isOfType(conversationKey, EncryptedSymmetricKey);
    Assert.isOfType(ownerId, "number");
    Assert.isOfType(creatorId, "number");
    Assert.isOfType(validFrom, "string");
    Assert.isOfType(signature, SignatureBundle);
  }

  toJson(): object {
    let out = {
      conversationId: this.conversationId,
      conversationKeyId: this.conversationKeyId.data,
      conversationKey: Encoding.toBase64(this.conversationKey.data),
      ownerId: this.ownerId,
      creatorId: this.creatorId,
      validFrom: this.validFrom,
      signature: this.signature.toString(),
    }
    return out
  }

  static fromJson(json: any): ServerPermission {
    Assert.isSet(json, "json must be set");

    return new ServerPermission(
      json.conversationId,
      new ConversationKeyId(json.conversationKeyId),
      new EncryptedSymmetricKey(Encoding.fromBase64(json.conversationKey)),
      json.ownerId,
      json.creatorId,
      json.validFrom,
      SignatureBundle.fromString(json.signature),
    )
  }

}
