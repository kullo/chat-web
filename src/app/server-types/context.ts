/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Assert } from '../util';

import { ConversationKeyId } from './conversation-key-bundle';

export class Context {
  constructor(
    public version: number,
    public parentMessageId: number,
    public previousMessageId: number,
    public conversationKeyId: ConversationKeyId,
    public deviceKeyId: string,
  ) {
    Assert.isSet(version, "version must be set")
    Assert.isSet(parentMessageId, "parentMessageId must be set")
    Assert.isSet(previousMessageId, "previousMessageId must be set")
    Assert.isSet(conversationKeyId, "conversationKeyId must be set")
    Assert.isSet(deviceKeyId, "deviceKeyId must be set")
  }

  equals(other: Context): boolean {
    return this.version == other.version
      && this.parentMessageId == other.parentMessageId
      && this.previousMessageId == other.previousMessageId
      && this.conversationKeyId.data == other.conversationKeyId.data
      && this.deviceKeyId == other.deviceKeyId
  }

  toJson(): object {
    return {
      version: this.version,
      parentMessageId: this.parentMessageId,
      previousMessageId: this.previousMessageId,
      conversationKeyId: this.conversationKeyId.data,
      deviceKeyId: this.deviceKeyId
    }
  }

  static fromJson(json: any): Context {
    Assert.isSet(json, "json must be set");

    return new Context(
      json.version,
      json.parentMessageId,
      json.previousMessageId,
      new ConversationKeyId(json.conversationKeyId),
      json.deviceKeyId,
    );
  }
}
