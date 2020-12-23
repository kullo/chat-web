/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { TestBed, async, inject } from '@angular/core/testing';
import { CryptoService, EncryptedSymmetricKey, Ed25519Signature, SignatureBundle } from '../../crypto';
import { CurrentDeviceService, FakeCurrentDeviceService } from '../../current-device';
import { ConversationKeyId, ServerPermission, PermissionPackerService, FakePermissionPackerService } from '../../server-types';
import { Encoding, Dates } from '../../util';

import { DevicesService, FakeDevicesService } from '../devices/devices.service';
import { ServerCommunicationService, FakeServerCommunicationService } from '../socket/server-communication.service';
import { UsersService, FakeUsersService } from '../users/users.service';

import { ConversationPermissionsService } from './conversation-permissions.service';

describe('ConversationPermissionsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ConversationPermissionsService,
        CryptoService,
        { provide: DevicesService, useClass: FakeDevicesService },
        { provide: PermissionPackerService, useClass: FakePermissionPackerService },
        { provide: CurrentDeviceService, useClass: FakeCurrentDeviceService },
        { provide: ServerCommunicationService, useClass: FakeServerCommunicationService },
        { provide: UsersService, useClass: FakeUsersService },
      ]
    });
  });

  function fill(service: ConversationPermissionsService): Promise<any> {
    return service.fillCaches([
      new ServerPermission(
        "123",
        new ConversationKeyId("aabbccdd"),
        new EncryptedSymmetricKey(Encoding.fromHex("5c99b1c83ccb51fc7c917625ddc13da4898ca0588ee69b62ae50752994aacd65727ed9576524871304f0bb9d5738f0fcbd1043cfe97ae2cfe123daa5e759bbd54502fe2cf83abce073c0287a9a313241")),
        4444, 33,
        "2018-01-01 00:00:00Z",
        new SignatureBundle("aabbccdd", new Ed25519Signature(Encoding.fromHex("00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"))),
      ),
      new ServerPermission(
        "124",
        new ConversationKeyId("eeddeeddeeddeedd"),
        new EncryptedSymmetricKey(Encoding.fromHex("5c99b1c83ccb51fc7c917625ddc13da4898ca0588ee69b62ae50752994aacd65727ed9576524871304f0bb9d5738f0fcbd1043cfe97ae2cfe123daa5e759bbd54502fe2cf83abce073c0287a9a313241")),
        4444, 33,
        "2018-01-01 00:00:00Z",
        new SignatureBundle("aabbccdd", new Ed25519Signature(Encoding.fromHex("00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"))),
      ),
      // after key rotation: two permissions for the same conversation and owner
      new ServerPermission(
        "42",
        new ConversationKeyId("961e57c49ac08a897349d862ccc3f2f2"),
        new EncryptedSymmetricKey(Encoding.fromHex("5c99b1c83ccb51fc7c917625ddc13da4898ca0588ee69b62ae50752994aacd65727ed9576524871304f0bb9d5738f0fcbd1043cfe97ae2cfe123daa5e759bbd54502fe2cf83abce073c0287a9a313241")),
        4444, 100,
        "2018-01-01 00:00:00Z",
        new SignatureBundle("aabbccdd", new Ed25519Signature(Encoding.fromHex("00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"))),
      ),
      new ServerPermission(
        "42",
        new ConversationKeyId("ef0a99b55a599f09e4f8663ee15864ac"),
        new EncryptedSymmetricKey(Encoding.fromHex("5c99b1c83ccb51fc7c917625ddc13da4898ca0588ee69b62ae50752994aacd65727ed9576524871304f0bb9d5738f0fcbd1043cfe97ae2cfe123daa5e759bbd54502fe2cf83abce073c0287a9a313241")),
        4444, 100,
        "2018-02-01 00:00:00Z",
        new SignatureBundle("aabbccdd", new Ed25519Signature(Encoding.fromHex("00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"))),
      ),
    ]);
  }

  it('should be created', inject([ConversationPermissionsService], (service: ConversationPermissionsService) => {
    expect(service).toBeTruthy();
  }));

  it('should have a latest key for a given conversation ID', async(inject([ConversationPermissionsService], (service: ConversationPermissionsService) => {
    (async () => {
      await fill(service);

      let conversationId = "42";
      service.latestKeyId(conversationId).then(keyId => {
        expect(keyId).toBeTruthy();
        expect(keyId.data).toMatch(/^[0-9a-f]{32}$/ /* 128 bit */);
        expect(keyId.data).toEqual("ef0a99b55a599f09e4f8663ee15864ac");
      });
    })();
  })));

  it('should have the conversation ID for a key', async(inject([ConversationPermissionsService], (service: ConversationPermissionsService) => {
    (async () => {
      await fill(service);

      { // Old key
        let conversationKeyId = new ConversationKeyId("961e57c49ac08a897349d862ccc3f2f2");
        service.id(conversationKeyId).then(conversationId => {
          expect(conversationId).toEqual("42");
        });
      }

      { // New key
        let conversationKeyId = new ConversationKeyId("ef0a99b55a599f09e4f8663ee15864ac");
        service.id(conversationKeyId).then(conversationId => {
          expect(conversationId).toEqual("42");
        });
      }
    })();
  })));

  it('should have conversation key', async(inject([ConversationPermissionsService], (service: ConversationPermissionsService) => {
    (async () => {
      await fill(service);

      { // Old key
        let conversationKeyId = new ConversationKeyId("961e57c49ac08a897349d862ccc3f2f2");
        service.key(conversationKeyId).then(conversationKey => {
          expect(conversationKey).toBeTruthy();
          expect(conversationKey.key.data.length).toBeGreaterThanOrEqual(32 /* 256 bit */);
        });
      }

      { // New key
        let conversationKeyId = new ConversationKeyId("ef0a99b55a599f09e4f8663ee15864ac");
        service.key(conversationKeyId).then(conversationKey => {
          expect(conversationKey).toBeTruthy();
          expect(conversationKey.key.data.length).toBeGreaterThanOrEqual(32 /* 256 bit */);
        });
      }
    })();
  })));
});
