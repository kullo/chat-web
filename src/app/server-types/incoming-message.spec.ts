/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { TestBed } from '@angular/core/testing';

import { ConversationKeyId } from './conversation-key-bundle';
import { Context } from './context';

import { IncomingMessage } from './incoming-message';

describe('IncomingMessage', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [],
    });
  });

  it('should create', () => {
    let signature = "ABABAB0000DDD"
    let context = new Context(1, 0, 33, new ConversationKeyId("aabbccaa"), "ddeeff")
    let uut = new IncomingMessage(context, "eyJhIjogImJjIn0=", 123, new Date());
    expect(uut).toBeTruthy();
  });

  it('should create from json', () => {
    let json = {
      context: {
        version: 4,
        parentMessageId: 6,
        previousMessageId: 33,
        conversationKeyId: "aabbccaa",
        deviceKeyId: "ccddee",
      },
      encryptedMessage: "eyJhIjogImJjIn0=",
      id: 8899,
      timeSent: "2018-01-29T11:19:50.910Z",
    }
    let uut = IncomingMessage.fromJson(json)
    expect(uut).toBeTruthy();
    expect(uut.id).toEqual(8899);
    expect(uut.timeSent).toEqual(new Date(Date.UTC(2018, 0 /* 0-based month */, 29, 11, 19, 50, 910)));
    expect(uut.context.version).toEqual(4);
    expect(uut.context.parentMessageId).toEqual(6);
    expect(uut.context.previousMessageId).toEqual(33);
    expect(uut.context.conversationKeyId.data).toEqual("aabbccaa");
    expect(uut.context.deviceKeyId).toEqual("ccddee");
    expect(uut.encryptedMessage).toEqual("eyJhIjogImJjIn0=");
  });

  it('should export to json', () => {
    let signature = "ABABAB0000DDD";
    let context = new Context(6, 7, 33, new ConversationKeyId("aabbccaa"), "ccddee");
    let timeSent = new Date(Date.UTC(2018, 0 /* 0-based month */, 29, 11, 19, 50, 910));
    let uut = new IncomingMessage(context, "eyJhIjogImJjIn0=", 445566, timeSent);

    let expectedJson = {
      context: {
        version: 6,
        parentMessageId: 7,
        previousMessageId: 33,
        conversationKeyId: "aabbccaa",
        deviceKeyId: "ccddee",
      },
      encryptedMessage: "eyJhIjogImJjIn0=",
      id: 445566,
      timeSent: "2018-01-29T11:19:50.910Z",
    }
    expect(uut.toJson()).toEqual(expectedJson)
  });

});
