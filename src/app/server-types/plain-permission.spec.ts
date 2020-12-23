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

import { PlainPermission } from './plain-permission';

describe('PlainPermission', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [],
    });
  });

  it('should create', () => {
    let uut = new PlainPermission(
      "321",
      new ConversationKeyId("aabbccddeeff"),
      new SymmetricKey(Encoding.fromBase64("99a47eCaRcfC0/0WiiiexgP0C8QwgGDSYWSA2vO380g=")),
      1,
      1000,
      "2018-01-01T00:00:00Z",
    );
    expect(uut).toBeTruthy();
  });

  it('should serialize', () => {
    let uut = new PlainPermission(
      "321",
      new ConversationKeyId("aabbccddeeff"),
      new SymmetricKey(Encoding.fromBase64("99a47eCaRcfC0/0WiiiexgP0C8QwgGDSYWSA2vO380g=")),
      1,
      1000,
      "2018-01-01T00:00:00.123Z",
    );
    expect(uut.serialized()).toEqual("321|aabbccddeeff|99a47eCaRcfC0/0WiiiexgP0C8QwgGDSYWSA2vO380g=|1|1000|2018-01-01T00:00:00.123Z");
  });

});
