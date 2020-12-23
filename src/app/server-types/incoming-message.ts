/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Assert, Dates } from '../util';

import { Context } from './context';

export class IncomingMessage {
  private makeTypeIncompatible: void;

  constructor(
    public readonly context: Context,
    public readonly encryptedMessage: string, // base64 encoded
    public readonly id: number,
    public readonly timeSent: Date,
  ) {
  }

  toJson(): object {
    let out = {
      context: this.context.toJson(),
      encryptedMessage: this.encryptedMessage,
      id: this.id,
      timeSent: this.timeSent.toISOString(),
    }
    return out
  }

  static fromJson(json: any): IncomingMessage {
    Assert.isSet(json, "json must be set");

    return new IncomingMessage(
      Context.fromJson(json.context),
      json.encryptedMessage,
      json.id,
      new Date(Dates.fromRfc3339(json.timeSent)),
    );
  }
}
