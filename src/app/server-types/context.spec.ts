/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { TestBed } from '@angular/core/testing';

import { ConversationKeyId } from './conversation-key-bundle';

import { Context } from './context';

describe('Context', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [],
    });
  });

  it('should create', () => {
    let uut = new Context(1, 0, 33, new ConversationKeyId("aabbccaa"), "ccddee")
    expect(uut).toBeTruthy();
    expect(uut.version).toEqual(1);
    expect(uut.parentMessageId).toEqual(0);
    expect(uut.previousMessageId).toEqual(33);
    expect(uut.conversationKeyId.data).toEqual("aabbccaa");
  });

  it('equality works', () => {
    let context1 = new Context(1, 0, 33, new ConversationKeyId("aabbccaa"), "ccddee")
    let context2 = new Context(1, 0, 33, new ConversationKeyId("aabbccaa"), "ccddee")
    expect(context1).not.toBe(context2);
    expect(context1).toEqual(context2); // how is that implemented?
    expect(context1.equals(context2)).toBeTruthy();
  });

  it('inequality works', () => {
    { // wrong version
      let context1 = new Context(1, 0, 33, new ConversationKeyId("aabbccaa"), "ccddee")
      let context2 = new Context(0, 0, 33, new ConversationKeyId("aabbccaa"), "ccddee")
      expect(context1.equals(context2)).toBeFalsy();
    }
    { // wrong parentMessageId
      let context1 = new Context(1, 0, 33, new ConversationKeyId("aabbccaa"), "ccddee")
      let context2 = new Context(1, 8, 33, new ConversationKeyId("aabbccaa"), "ccddee")
      expect(context1.equals(context2)).toBeFalsy();
    }
    { // wrong previousMessageId
      let context1 = new Context(1, 0, 33, new ConversationKeyId("aabbccaa"), "ccddee")
      let context2 = new Context(1, 0, 34, new ConversationKeyId("aabbccaa"), "ccddee")
      expect(context1.equals(context2)).toBeFalsy();
    }
    { // wrong conversationKeyId
      let context1 = new Context(1, 0, 33, new ConversationKeyId("aabbccaa"), "ccddee")
      let context2 = new Context(1, 0, 33, new ConversationKeyId("aabbcc00"), "ccddee")
      expect(context1.equals(context2)).toBeFalsy();
    }
    { // wrong deviceKeyId
      let context1 = new Context(1, 0, 33, new ConversationKeyId("aabbccaa"), "ccddee")
      let context2 = new Context(1, 0, 33, new ConversationKeyId("aabbccaa"), "ccdd00")
      expect(context1.equals(context2)).toBeFalsy();
    }
  });
});
