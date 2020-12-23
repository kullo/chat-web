/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Assert } from '../../util';

import { Attachment } from '../messages/attachment';

export class PlainMessage {

  constructor(
    public readonly type: string,
    public readonly content: string,
    public readonly attachments: Attachment[],
  ) {
    Assert.isSet(type, "type must be set");
    Assert.isSet(content, "content must be set");
    Assert.isSet(attachments, "attachments must be set");
  }

  toJson(): object {
    return {
      type: this.type,
      content: this.content,
      attachments: this.attachments.map(a => a.toJson()),
    }
  }

  static fromJson(json: any): PlainMessage {
    Assert.isSet(json, "json must be set");

    let attachments: Attachment[] = (json.attachments)
      ? json.attachments.map((object: any) => Attachment.fromJson(object))
      : [];

    return new PlainMessage(
      json.type,
      json.content,
      attachments,
    );
  }
}

// Convenience wrappers

export class TextPlainMessage extends PlainMessage {
  constructor(
    public readonly content: string,
    attachments?: Attachment[],
  ) {
    super("text", content, (attachments) ? attachments : []);
  }
}

export class ReactionPlainMessage extends PlainMessage {
  constructor(
    public readonly content: string,
  ) {
    super("reaction", content, []);
  }
}
