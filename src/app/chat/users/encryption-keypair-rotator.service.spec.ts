/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { TestBed, inject, async } from '@angular/core/testing';
import { EncryptedSymmetricKey, SignatureBundle, Ed25519Signature, EncryptionKeypair, EncryptionPubkey, EncryptionPrivkey, CryptoService } from '../../crypto';
import { CurrentDeviceService, FakeCurrentDeviceService } from '../../current-device';
import { ServerPermission, ConversationKeyId, PermissionEncryptionService, FakePermissionEncryptionService, RestApiService, FakeRestApiService } from '../../server-types';
import { Encoding } from '../../util';

import { ConversationsService, FakeConversationsService } from '../conversations/conversations.service';

import { EncryptionKeypairRotatorService } from './encryption-keypair-rotator.service';

describe('EncryptionKeypairRotatorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EncryptionKeypairRotatorService,
        CryptoService,
        { provide: PermissionEncryptionService, useClass: FakePermissionEncryptionService },
        { provide: CurrentDeviceService, useClass: FakeCurrentDeviceService },
        { provide: ConversationsService, useClass: FakeConversationsService },
        { provide: RestApiService, useClass: FakeRestApiService },
      ],
    });
  });

  it('should be created', inject([EncryptionKeypairRotatorService], (service: EncryptionKeypairRotatorService) => {
    expect(service).toBeTruthy();
  }));

  it('can rotate single permission', async(inject([EncryptionKeypairRotatorService], (service: EncryptionKeypairRotatorService) => {
    let oldKeypair = new EncryptionKeypair(
      new EncryptionPubkey(Encoding.fromHex("58eac4e9d3724de1e25889125e7c953022398cd603fd6384aff667bd81ce3420")),
      new EncryptionPrivkey(Encoding.fromHex("aa2bc558a603ccf15bc086ad5d5fb603048c3592d4ef9bb7603b595e13778672")),
    );

    let newKeypair = new EncryptionKeypair(
      new EncryptionPubkey(Encoding.fromHex("ab59dd2f84b27705826fec8177073365c63fcf8b16dddc308c511d1dbfc66360")),
      new EncryptionPrivkey(Encoding.fromHex("0d6f8523b2183ad8cf4cf163f97179a3bb1663aebf2e7a66c3dc9beabce42bf2")),
    );

    let original = new ServerPermission(
      "aabbccdd",
      new ConversationKeyId("eeff"),
      // FakePermissionEncryptionService does not care about properly encrypted data
      new EncryptedSymmetricKey(Encoding.fromHex("00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000")),
      33,
      1,
      "2018-01-02T03:04:05Z",
      new SignatureBundle("aaaaaaaaaaaaaaaa", new Ed25519Signature(Encoding.fromHex("00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"))),
    );

    (async () => {
      let rotated = await service.rotatePermission(original, oldKeypair, newKeypair);
      expect(rotated).toBeTruthy();
      expect(rotated.conversationId).toEqual(original.conversationId);
      expect(rotated.conversationKeyId.data).toEqual(original.conversationKeyId.data);
      expect(rotated.ownerId).toEqual(original.ownerId);
      expect(rotated.creatorId).toEqual(original.creatorId);
      expect(rotated.validFrom).toEqual(original.validFrom);
      expect(rotated.signature.deviceId).toEqual(original.signature.deviceId);
      expect(rotated.signature.signature.data).toEqual(original.signature.signature.data);
    })();
  })));

  it('can rotate', async(inject([EncryptionKeypairRotatorService], (service: EncryptionKeypairRotatorService) => {
    expect(service).toBeTruthy();
    service.rotate();
  })));
});
