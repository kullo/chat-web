/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CurrentDeviceService } from '../../current-device';
import { SymmetricKey, CryptoService } from '../../crypto';
import { ConversationKeyBundle, ConversationKeyId, PlainPermission, ServerConversation, ServerPermission, User, PermissionPackerService } from '../../server-types';
import { Assert, Encoding, Dates } from '../../util';

import { DevicesService } from '../devices/devices.service';
import { ServerCommunicationService } from '../socket/server-communication.service';
import { UsersService } from '../users/users.service';

interface ConversationPermissionsServiceInterface {
  latestKeyId(conversationId: string): Promise<ConversationKeyId>
  key(conversationKeyId: ConversationKeyId): Promise<ConversationKeyBundle>
  id(conversationKeyId: ConversationKeyId): Promise<string>
  fillCaches(serverPermissions: ServerPermission[]): Promise<void>
}

export class FakeConversationPermissionsService implements ConversationPermissionsServiceInterface {
  private readonly TESTING_KEY_IDS: Map<string, ConversationKeyId> = (() => {
    let out = new Map<string, ConversationKeyId>();
    out.set("42", new ConversationKeyId("961e57c49ac08a897349d862ccc3f2f2"));
    out.set("43", new ConversationKeyId("8d5d953872dc10b6a402e6ed91af2348"));
    out.set("44", new ConversationKeyId("8aeb0a33105d97c5663309374cca6ef4"));
    out.set("45", new ConversationKeyId("831dbf397c1faaccbe225eee491822df"));
    return out;
  })();

  private readonly TESTING_KEYS: ConversationKeyBundle[] = (() => {
    // Make id:
    // echo "99a47eCaRcfC0/0WiiiexgP0C8QwgGDSYWSA2vO380g=" | base64 -d |  ./b2sum -l 224 | cut -c1-32
    return [
      new ConversationKeyBundle(
        new ConversationKeyId("961e57c49ac08a897349d862ccc3f2f2"),
        new SymmetricKey(Encoding.fromBase64("99a47eCaRcfC0/0WiiiexgP0C8QwgGDSYWSA2vO380g="))),
      new ConversationKeyBundle(
        new ConversationKeyId("8d5d953872dc10b6a402e6ed91af2348"),
        new SymmetricKey(Encoding.fromBase64("j11kR4vE7Je5oW4GqWoz8FOkXSE5kbYJTaLeG1VvzZE="))),
      new ConversationKeyBundle(
        new ConversationKeyId("8aeb0a33105d97c5663309374cca6ef4"),
        new SymmetricKey(Encoding.fromBase64("I7ho9j0BjhcKtPZUgq5QUzL2AoCHnUTcCFIn+Na+hYg="))),
      new ConversationKeyBundle(
        new ConversationKeyId("831dbf397c1faaccbe225eee491822df"),
        new SymmetricKey(Encoding.fromBase64("gs8ejJpRx3zRpxtZpz+FpR2nGerv0YOMPUTszaD81Bc="))),
    ];
  })();

  latestKeyId(conversationId: string): Promise<ConversationKeyId> {
    return Promise.resolve(this.TESTING_KEY_IDS.get(conversationId)!);
  }

  key(conversationKeyId: ConversationKeyId): Promise<ConversationKeyBundle> {
    return Promise.resolve(this.TESTING_KEYS.find(key => key.id.equals(conversationKeyId))!);
  }

  id(conversationKeyId: ConversationKeyId): Promise<string> {
    this.TESTING_KEY_IDS.forEach((keyId, conversationId) => {
      if (keyId.equals(conversationKeyId)) return Promise.resolve(conversationId);
    });
    return Promise.reject("not found");
  }

  fillCaches(serverPermissions: ServerPermission[]): Promise<void> {
    return Promise.resolve();
  }
}

@Injectable()
export class ConversationPermissionsService implements ConversationPermissionsServiceInterface, OnDestroy {

  private latestKeyIdsCache = new Map<string, ConversationKeyId>() // append or override
  private keysCache = new Map<string, ConversationKeyBundle>() // append only
  private conversationIdsCache = new Map<string, string>() // append only

  private subscriptions = new Array<Subscription>();

  constructor(
    private readonly crypto: CryptoService,
    private readonly currentDevice: CurrentDeviceService,
    private readonly devices: DevicesService,
    private readonly permissionPacker: PermissionPackerService,
    private readonly server: ServerCommunicationService,
    private readonly users: UsersService,
  ) {
    this.server.connection.then(connection => {
      this.subscriptions.push(
        connection
          .filter(event => {
            return event.type == 'conversation_permission.added'
          })
          .map(event => ServerPermission.fromJson(event.data))
          .subscribe(permission => this.fillCaches([permission]))
      );
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  async make(conversationId: string, owners: User[]): Promise<ServerPermission[]> {
    let currentUserDevice = await this.currentDevice.device();

    let conversationKeyBundle = new ConversationKeyBundle(
      new ConversationKeyId(await this.crypto.generateRandomId()),
      await this.crypto.generateSymmetricKey(),
    );

    let out = new Array<ServerPermission>();

    for (let owner of owners) {
      let plainPermission = new PlainPermission(
        conversationId,
        conversationKeyBundle.id,
        conversationKeyBundle.key,
        owner.id,
        currentUserDevice.ownerId,
        Dates.toRfc3339Utc(new Date()),
      );

      let serverPermission = await this.permissionPacker.pack(
        plainPermission,
        owner,
        currentUserDevice,
      );
      out.push(serverPermission);
    }

    return out;
  }

  async latestKeyId(conversationId: string): Promise<ConversationKeyId> {
    Assert.isSet(conversationId, "conversationId must be set");

    let out = this.latestKeyIdsCache.get(conversationId);
    if (!out) throw new Error("latest ConversationKeyId not found for conversation " + conversationId);
    return out;
  }

  async key(conversationKeyId: ConversationKeyId): Promise<ConversationKeyBundle> {
    Assert.isSet(conversationKeyId, "conversationKeyId must be set");

    if (!this.keysCache.has(conversationKeyId.data)) {
      await this.loadMissingPermission(conversationKeyId);
    }

    let out = this.keysCache.get(conversationKeyId.data);
    if (!out) throw new Error("ConversationKeyBundle not found for key ID " + conversationKeyId.data);
    return out;
  }

  async id(conversationKeyId: ConversationKeyId): Promise<string> {
    Assert.isSet(conversationKeyId, "conversationKeyId must be set");

    if (!this.conversationIdsCache.has(conversationKeyId.data)) {
      await this.loadMissingPermission(conversationKeyId);
    }

    let out = this.conversationIdsCache.get(conversationKeyId.data);
    if (!out) throw new Error("conversation ID not found for key ID " + conversationKeyId.data);
    return out;
  }

  async fillCaches(serverPermissions: ServerPermission[]): Promise<void> {
    let currentUserId = (await this.currentDevice.device()).ownerId;
    let currentUserEncryptionKeypair = await this.currentDevice.encryptionKeypair();

    serverPermissions = serverPermissions.filter(permission => permission.ownerId == currentUserId);

    let latestValidFromTimestamp = new Map<string, number>();
    let latestKeyId = new Map<string, ConversationKeyId>();

    for (let serverPermission of serverPermissions) {
      let signingDeviceId = serverPermission.signature.deviceId;
      let signingDevice = await this.devices.get(signingDeviceId);
      if (!signingDevice) return Promise.reject("Signing device not found: '" + signingDeviceId + "'");

      let permission = await this.permissionPacker.unpack(
        serverPermission,
        currentUserEncryptionKeypair,
        signingDevice.pubkey,
      );

      let conversationId = permission.conversationId;

      let keyBundle = new ConversationKeyBundle(
        permission.conversationKeyId,
        permission.conversationKey);
      this.keysCache.set(keyBundle.id.data, keyBundle);
      this.conversationIdsCache.set(keyBundle.id.data, conversationId);

      let validFromTimestamp = Dates.fromRfc3339(permission.validFrom).getTime();
      if (validFromTimestamp > (latestValidFromTimestamp.get(conversationId) || 0)) {
        latestValidFromTimestamp.set(conversationId, validFromTimestamp);
        latestKeyId.set(conversationId, keyBundle.id);
      }
    }

    latestKeyId.forEach((value, key) => {
      this.latestKeyIdsCache.set(key, value);
    });
  }

  private async loadMissingPermission(conversationKeyId: ConversationKeyId): Promise<void> {
    let serverPermission = await this.server.getConversationPermission(conversationKeyId);
    return this.fillCaches([serverPermission]);
  }
}
