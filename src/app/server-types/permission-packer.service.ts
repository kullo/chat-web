/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Injectable } from '@angular/core';
import { EncryptedSymmetricKey, SymmetricKey, EncryptionKeypair, Ed25519Signature, Ed25519Pubkey, SignatureBundle } from '../crypto';
import { LocalDevice } from '../current-device';
import { Assert, Encoding } from '../util';

import { PlainPermission } from './plain-permission';
import { ServerPermission } from './server-permission';
import { PermissionEncryptionService } from './permission-encryption.service';
import { PermissionSignerService } from './permission-signer.service';
import { User } from './user';

interface PermissionPackerServiceInterface {
  pack(plain: PlainPermission, owner: User, creatorDevice: LocalDevice): Promise<ServerPermission>;
  unpack(server: ServerPermission, ownerKeypair: EncryptionKeypair, creatorPubkey: Ed25519Pubkey): Promise<PlainPermission>;
}

export class FakePermissionPackerService implements PermissionPackerServiceInterface {
  pack(plain: PlainPermission, owner: User, creatorDevice: LocalDevice): Promise<ServerPermission> {
    return Promise.resolve(new ServerPermission(
      plain.conversationId,
      plain.conversationKeyId,
      new EncryptedSymmetricKey(Encoding.fromHex("aabbaabbaabbaabbaabbaabbaabbaabbaabbaabbaabbaabbaabbaabbaabbaabb")),
      plain.ownerId,
      plain.creatorId,
      plain.validFrom,
      new SignatureBundle("aabbccdd", new Ed25519Signature(Encoding.fromHex("00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"))),
    ));
  }

  unpack(server: ServerPermission, ownerKeypair: EncryptionKeypair, creatorPubkey: Ed25519Pubkey): Promise<PlainPermission> {
    return Promise.resolve(new PlainPermission(
      server.conversationId,
      server.conversationKeyId,
      new SymmetricKey(Encoding.fromHex("0000000000000000000000000000000000000000000000000000000000000000")),
      server.ownerId,
      server.creatorId,
      server.validFrom,
    ));
  }
}

@Injectable()
export class PermissionPackerService implements PermissionPackerServiceInterface {

  // no state here! PermissionPackerService is kept alive across multiple user sessions

  constructor(
    private encryption: PermissionEncryptionService,
    private signer: PermissionSignerService,
  ) { }

  async pack(plain: PlainPermission, owner: User, creatorDevice: LocalDevice): Promise<ServerPermission> {
    Assert.isSet(plain, "plain must be set");
    Assert.isSet(owner, "owner must be set");
    Assert.isSet(creatorDevice, "creatorDevice must be set");

    Assert.isEqual(plain.ownerId, owner.id, "owner must match");

    let signature = await this.signer.makeSignature(plain, creatorDevice.privkey);

    let signatureBundle = new SignatureBundle(creatorDevice.id, signature);

    let encryptedConversationKey = await this.encryption.encrypt(
      plain.conversationKey,
      owner.encryptionPubkey,
    );

    return new ServerPermission(
      plain.conversationId,
      plain.conversationKeyId,
      encryptedConversationKey,
      plain.ownerId,
      plain.creatorId,
      plain.validFrom,
      signatureBundle,
    );
  }

  async unpack(server: ServerPermission, ownerKeypair: EncryptionKeypair, signingDevicePubkey: Ed25519Pubkey): Promise<PlainPermission> {
    Assert.isSet(server, "server must be set");
    Assert.isSet(ownerKeypair, "ownerKeypair must be set");
    Assert.isSet(signingDevicePubkey, "signingDevicePubkey must be set");

    let decryptedConversationKey = await this.encryption.decrypt(
      server.conversationKey,
      ownerKeypair,
    );

    let plain = new PlainPermission(
      server.conversationId,
      server.conversationKeyId,
      decryptedConversationKey,
      server.ownerId,
      server.creatorId,
      server.validFrom,
    );

    let signatureOk = this.signer.verifySignature(
      server.signature.signature,
      plain,
      signingDevicePubkey,
    );

    if (!signatureOk) {
      throw new Error("Verification failed");
    }

    return plain;
  }
}
