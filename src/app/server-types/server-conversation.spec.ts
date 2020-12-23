/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { TestBed } from '@angular/core/testing';
import { SymmetricKey } from '../crypto';
import { Encoding, Dates } from '../util';

import { ConversationKeyId } from './conversation-key-bundle';
import { ServerPermission } from './server-permission';

import { ServerConversation } from './server-conversation';

describe('ServerConversation', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [],
    });
  });

  it('should create', () => {
    let uut = new ServerConversation(
      "22",
      "channel",
      "main",
      [12, 23],
    )
    expect(uut).toBeTruthy();
  });

  it('should create without permissions', () => {
    let uut = new ServerConversation(
      "22",
      "channel",
      "main",
      [12, 23],
    )
    expect(uut).toBeTruthy();
  });

  it('should update', () => {
    let uut = new ServerConversation(
      "22",
      "channel",
      "main",
      [12, 23],
    );
    uut.update(new ServerConversation("22", "channel", "new main", [12, 23, 24]));
    expect(uut).toBeTruthy();
    expect(uut.title).toEqual("new main");
    expect(uut.participantIds).toEqual([12, 23, 24]);
  });

  it('should create from json', () => {
    let json = {
      id: "8899",
      type: "channel",
      title: "hello",
      participantIds: [1, 2],
    }
    let uut = ServerConversation.fromJson(json);
    expect(uut).toBeTruthy();
    expect(uut.id).toEqual("8899");
    expect(uut.type).toEqual("channel");
    expect(uut.title).toEqual("hello");
    expect(uut.participantIds).toEqual([1, 2]);
  });

  it('should export to json', () => {
    let uut = new ServerConversation("22", "channel", "main", [33, 44]);

    let expectedJson = {
      id: "22",
      type: "channel",
      title: "main",
      participantIds: [33, 44],
    }
    expect(uut.toJson()).toEqual(expectedJson)
  });

  it('participants list is normalized', () => {
    let conv1 = new ServerConversation("22", "channel", "main", [33, 44]);
    let conv2 = new ServerConversation("22", "channel", "main", [44, 33]);
    expect(conv1.participantIds).toEqual(conv2.participantIds);
  });

});
