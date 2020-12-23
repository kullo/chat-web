/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Assert } from '../util';

import { Context } from './context';

// a message with no ID and no timeSent
export class OutgoingMessage {
  private makeTypeIncompatible: void;

  constructor(
    public readonly context: Context,
    public readonly encryptedMessage: string | null, // base64 encoded
  ) {
  }

  toJson(): object {
    let out = {
      context: this.context.toJson(),
      encryptedMessage: this.encryptedMessage
    }
    return out
  }

  static fromJson(json: any): OutgoingMessage {
    Assert.isSet(json, "json must be set");

    let context = Context.fromJson(json.context)
    let encryptedMessage = json.encryptedMessage
    return new OutgoingMessage(context, encryptedMessage);
  }
}
