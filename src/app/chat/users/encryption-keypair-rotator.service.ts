/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Injectable } from '@angular/core';
import { EncryptionKeypair, EncryptedSymmetricKey, CryptoService, EncryptionPrivkeyEncrypted } from '../../crypto';
import { CurrentDeviceService } from '../../current-device';
import { PermissionEncryptionService, ServerPermission, RestApiService } from '../../server-types';
import { Encoding, Assert } from '../../util';

import { ConversationsService } from '../conversations/conversations.service';

interface EncryptionKeypairRotatorServiceInterface {
  rotate(): Promise<void>
  rotatePermission(permission: ServerPermission, oldKeypair: EncryptionKeypair, newKeypair: EncryptionKeypair): Promise<ServerPermission>;
}

export class FakeEncryptionKeypairRotatorService implements EncryptionKeypairRotatorServiceInterface {
  rotate(): Promise<void> {
    return Promise.resolve();
  }
  rotatePermission(permission: ServerPermission, oldKeypair: EncryptionKeypair, newKeypair: EncryptionKeypair): Promise<ServerPermission> {
    return Promise.resolve(permission);
  }
}

@Injectable()
export class EncryptionKeypairRotatorService implements EncryptionKeypairRotatorServiceInterface {

  constructor(
    // external
    private encryption: PermissionEncryptionService,
    private currentDevice: CurrentDeviceService,
    private crypto: CryptoService,
    private restApi: RestApiService,
    // internal
    private conversations: ConversationsService,
  ) { }

  async rotate(): Promise<void> {
    let currentUserId = (await this.currentDevice.device()).ownerId;
    let encryptionPrivkeyEncryptingKey = await this.currentDevice.encryptionPrivkeyEncryptingKey();

    let oldKeypair = await this.currentDevice.encryptionKeypair();
    let newKeypair = await this.crypto.generateEncryptionKeypair();

    //await this.conversations.reload();
    let permissions = this.conversations.items.value.permissions;

    let newPermissions = new Array<ServerPermission>();
    for (let permission of permissions) {
      Assert.isEqual(currentUserId, permission.ownerId, "permission owner must be current user");
      newPermissions.push(await this.rotatePermission(permission, oldKeypair, newKeypair));
    }

    let encryptionPrivkeyEncrypted = new EncryptionPrivkeyEncrypted(
      await this.crypto.encryptWithSymmetricKey(newKeypair.privkey.data, encryptionPrivkeyEncryptingKey)
    );

    let body = {
      user: {
        encryptionPubkey: Encoding.toBase64(newKeypair.pubkey.data),
        encryptionPrivkey: Encoding.toBase64(encryptionPrivkeyEncrypted.data),
      },
      permissions: newPermissions.map(p => p.toJson()),
    };
    await this.restApi.updateUser(currentUserId, body);
    this.currentDevice.setEncryptionKeypair(newKeypair);
  }

  async rotatePermission(permission: ServerPermission, oldKeypair: EncryptionKeypair, newKeypair: EncryptionKeypair): Promise<ServerPermission> {
    return new ServerPermission(
      permission.conversationId,
      permission.conversationKeyId,
      await this.rotateConversationKey(permission.conversationKey, oldKeypair, newKeypair),
      permission.ownerId,
      permission.creatorId,
      permission.validFrom,
      permission.signature,
    );
  }

  private async rotateConversationKey(
    conversationKey: EncryptedSymmetricKey,
    oldKeypair: EncryptionKeypair,
    newKeypair: EncryptionKeypair,
  ): Promise<EncryptedSymmetricKey> {
    let decrypted = await this.encryption.decrypt(conversationKey, oldKeypair);
    let reEncrypted = await this.encryption.encrypt(decrypted, newKeypair.pubkey);
    return reEncrypted;
  }

}
