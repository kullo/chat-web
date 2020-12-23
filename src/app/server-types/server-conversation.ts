/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Assert, Encoding } from '../util';

export class ServerConversation {

  constructor(
    public readonly id: string,
    public readonly type: string,
    public title: string,
    public participantIds: number[],
  ) {
    Assert.isSet(id, "id must be set");
    Assert.isSet(type, "type must be set");
    Assert.isSet(title, "title must be set");
    Assert.isSet(participantIds, "participantIds must be set");

    this.participantIds.sort();
  }

  update(newConversation: ServerConversation) {
    Assert.isSet(newConversation, "newConversation must be set");
    Assert.isEqual(this.id, newConversation.id, "IDs must match");
    Assert.isEqual(this.type, newConversation.type, "type must match");

    this.title = newConversation.title;
    this.participantIds = newConversation.participantIds;
  }

  toJson(): object {
    let out = {
      id: this.id,
      type: this.type,
      title: this.title,
      participantIds: this.participantIds,
    }
    return out
  }

  static fromJson(json: any): ServerConversation {
    Assert.isSet(json, "json must be set");

    return new ServerConversation(
      json.id,
      json.type,
      json.title,
      json.participantIds
    );
  }
}
