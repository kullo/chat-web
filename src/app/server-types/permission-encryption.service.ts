/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Injectable } from '@angular/core';
import { CryptoService, SymmetricKey, EncryptionKeypair, EncryptedSymmetricKey, EncryptionPubkey } from '../crypto';
import { Assert, Encoding } from '../util';

import { User } from './user';

interface PermissionEncryptionServiceInterface {
  encrypt(conversationKey: SymmetricKey, ownerPubkey: EncryptionPubkey): Promise<EncryptedSymmetricKey>;
  decrypt(encryptedConversationKey: EncryptedSymmetricKey, ownerKeypair: EncryptionKeypair): Promise<SymmetricKey>;
}

export class FakePermissionEncryptionService implements PermissionEncryptionServiceInterface {
  encrypt(conversationKey: SymmetricKey, ownerPubkey: EncryptionPubkey): Promise<EncryptedSymmetricKey> {
    return Promise.resolve(new EncryptedSymmetricKey(Encoding.fromHex("00000000")));
  }
  decrypt(encryptedConversationKey: EncryptedSymmetricKey, ownerKeypair: EncryptionKeypair): Promise<SymmetricKey> {
    return Promise.resolve(new SymmetricKey(Encoding.fromHex("00000000")));
  }
}

@Injectable()
export class PermissionEncryptionService implements PermissionEncryptionServiceInterface {

  // no state here! PermissionEncryptionService is kept alive across multiple user sessions

  constructor(
    private crypto: CryptoService,
  ) { }

  async encrypt(conversationKey: SymmetricKey, ownerPubkey: EncryptionPubkey): Promise<EncryptedSymmetricKey> {
    Assert.isSet(conversationKey, "conversationKey must be set");
    Assert.isSet(ownerPubkey, "ownerPubkey must be set");

    return new EncryptedSymmetricKey(
      await this.crypto.encryptWithPubkey(
        conversationKey.data,
        ownerPubkey
      )
    );
  }

  async decrypt(encryptedConversationKey: EncryptedSymmetricKey, ownerKeypair: EncryptionKeypair): Promise<SymmetricKey> {
    Assert.isSet(encryptedConversationKey, "encryptedConversationKey must be set");
    Assert.isSet(ownerKeypair, "ownerKeypair must be set");

    return new SymmetricKey(
      await this.crypto.decryptWithPrivkey(
        encryptedConversationKey.data,
        ownerKeypair
      )
    );
  }

}
