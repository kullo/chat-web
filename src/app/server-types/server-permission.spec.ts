/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { TestBed } from '@angular/core/testing';
import { EncryptedSymmetricKey, Ed25519Signature, SignatureBundle } from '../crypto';
import { Encoding, Dates } from '../util';

import { ConversationKeyId } from './conversation-key-bundle';

import { ServerPermission } from './server-permission';

describe('ServerPermission', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [],
    });
  });

  it('should create', () => {
    let uut = new ServerPermission(
      "321",
      new ConversationKeyId("aabbccddeeff"),
      new EncryptedSymmetricKey(Encoding.fromBase64("99a47eCaRcfC0/0WiiiexgP0C8QwgGDSYWSA2vO380g=")),
      1,
      1000,
      "2018-01-01T00:00:00Z",
      new SignatureBundle("aabbccdd", new Ed25519Signature(Encoding.fromHex("00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"))),
    )
    expect(uut).toBeTruthy();
  });

  it('can be exported to JSON', () => {
    let permission = new ServerPermission(
      "321",
      new ConversationKeyId("aabbccddeeff"),
      new EncryptedSymmetricKey(Encoding.fromBase64("99a47eCaRcfC0/0WiiiexgP0C8QwgGDSYWSA2vO380g=")),
      1,
      1000,
      "2018-01-01T00:00:00Z",
      new SignatureBundle("aabbccdd", new Ed25519Signature(Encoding.fromBase64("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="))),
    );

    let expectedJson = {
      conversationId: "321",
      conversationKeyId: "aabbccddeeff",
      conversationKey: "99a47eCaRcfC0/0WiiiexgP0C8QwgGDSYWSA2vO380g=",
      ownerId: 1,
      creatorId: 1000,
      validFrom: "2018-01-01T00:00:00Z",
      signature: "aabbccdd,AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==",
    };

    expect(permission.toJson()).toEqual(expectedJson);
  });

  it('can be imported from JSON', () => {
    let json = {
      conversationId: "321",
      conversationKeyId: "aabbccddeeff",
      conversationKey: "99a47eCaRcfC0/0WiiiexgP0C8QwgGDSYWSA2vO380g=",
      ownerId: 1,
      creatorId: 1000,
      validFrom: "2018-01-01T00:00:00Z",
      signature: "aabbccdd,AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==",
    };

    let uut = ServerPermission.fromJson(json);
    expect(uut).toBeTruthy();
    expect(uut.conversationId).toEqual("321");
    expect(uut.conversationKeyId.data).toEqual("aabbccddeeff");
    expect(uut.conversationKey.data).toEqual(Encoding.fromBase64("99a47eCaRcfC0/0WiiiexgP0C8QwgGDSYWSA2vO380g="));
    expect(uut.ownerId).toEqual(1);
    expect(uut.creatorId).toEqual(1000);
    expect(uut.validFrom).toEqual("2018-01-01T00:00:00Z");
    expect(uut.signature.deviceId).toEqual("aabbccdd");
    expect(uut.signature.signature.data).toEqual(Encoding.fromBase64("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="));
  });
});
