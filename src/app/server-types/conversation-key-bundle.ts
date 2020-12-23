/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { SymmetricKey } from '../crypto';
import { Assert, Encoding } from '../util';

// fingerprint of the symmetric key
export class ConversationKeyId {
  private makeTypeIncompatible: void;

  constructor(public readonly data: string) {
    Assert.isSet(data, "data must be set");
  }

  equals(other: ConversationKeyId): boolean {
    Assert.isSet(other, "other must be set");

    return this.data == other.data;
  }
}

export class ConversationKeyBundle {
  constructor(
    public readonly id: ConversationKeyId,
    public readonly key: SymmetricKey,
  ) {
    Assert.isSet(id, "id must be set");
    Assert.isSet(key, "key must be set");
  }
}
