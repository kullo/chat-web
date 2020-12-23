/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { SymmetricKey } from '../crypto';
import { Assert, Encoding } from '../util';

import { ConversationKeyId } from './conversation-key-bundle';

export class PlainPermission {
  constructor(
    public readonly conversationId: string,
    public readonly conversationKeyId: ConversationKeyId,
    public readonly conversationKey: SymmetricKey, // unencrypted
    public readonly ownerId: number,
    public readonly creatorId: number,
    public readonly validFrom: string,
  ) {
    Assert.isSet(conversationId, "conversationId must be set");
    Assert.isSet(conversationKeyId, "conversationKeyId must be set");
    Assert.isSet(conversationKey, "conversationKey must be set");
    Assert.isSet(ownerId, "ownerId must be set");
    Assert.isSet(creatorId, "creatorId must be set");
    Assert.isSet(validFrom, "validFrom must be set");
  }

  serialized(): string {
    return this.conversationId
      + "|" + this.conversationKeyId.data
      + "|" + Encoding.toBase64(this.conversationKey.data)
      + "|" + this.ownerId
      + "|" + this.creatorId
      + "|" + this.validFrom;
  }
}
