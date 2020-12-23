/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { TestBed } from '@angular/core/testing';
import { SymmetricKey } from '../crypto';
import { Encoding } from '../util';

import { ConversationKeyId, ConversationKeyBundle } from "./conversation-key-bundle";

describe('ConversationKeyBundle', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [],
    });
  });

  it('should create', () => {
    let id = new ConversationKeyId("aabbccdd")
    let uut = new ConversationKeyBundle(id, new SymmetricKey(Encoding.fromBase64("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=")));
    expect(uut).toBeTruthy();
  });
});
