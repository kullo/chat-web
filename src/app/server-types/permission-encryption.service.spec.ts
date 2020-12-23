/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { TestBed, inject, async } from '@angular/core/testing';
import { CryptoService, SymmetricKey, EncryptionPubkey, EncryptionPrivkey, EncryptionKeypair, EncryptedSymmetricKey } from '../crypto';
import { Encoding, Dates } from '../util';

import { PermissionEncryptionService } from './permission-encryption.service';

describe('PermissionEncryptionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PermissionEncryptionService,
        CryptoService,
      ],
    });
  });

  it('should be created', inject([PermissionEncryptionService], (service: PermissionEncryptionService) => {
    expect(service).toBeTruthy();
  }));

  it('can encrypt', async(inject([PermissionEncryptionService], (service: PermissionEncryptionService) => {
    let ownerPubkey = new EncryptionPubkey(Encoding.fromBase64("cDqTxCse7WLg81u8PUCnz79vFN0ou4NmD5yoBjvF9wI="));

    let plainConversationKey = new SymmetricKey(Encoding.fromHex("0000000000000000000000000000000000000000000000000000000000000000"));

    service.encrypt(plainConversationKey, ownerPubkey).then(encrypted => {
      expect(encrypted).toBeTruthy();
    });
  })));

  it('can decrypt', async(inject([PermissionEncryptionService], (service: PermissionEncryptionService) => {
    let ownerKeypair = new EncryptionKeypair(
      new EncryptionPubkey(Encoding.fromHex("f99117ce7c356350470557567eab7aad2798ed5629814a6693e7714dbd6d9313")),
      new EncryptionPrivkey(Encoding.fromHex("8069117c3428cc70cdf690992fc90d098f11bb696d8bcd8e7e705792f86e33fc"))
    );

    let encryptedConversationKey = new EncryptedSymmetricKey(Encoding.fromHex("5c99b1c83ccb51fc7c917625ddc13da4898ca0588ee69b62ae50752994aacd65727ed9576524871304f0bb9d5738f0fcbd1043cfe97ae2cfe123daa5e759bbd54502fe2cf83abce073c0287a9a313241"));

    service.decrypt(encryptedConversationKey, ownerKeypair).then(plainConversationKey => {
      expect(plainConversationKey).toBeTruthy();
      expect(plainConversationKey.data).toEqual(Encoding.toUtf8("0123456789acbdef0123456789acbdef"));
    });
  })));

  it('can encrypt and decrypt', async(inject([PermissionEncryptionService], (service: PermissionEncryptionService) => {
    let ownerKeypair = new EncryptionKeypair(
      new EncryptionPubkey(Encoding.fromBase64("cDqTxCse7WLg81u8PUCnz79vFN0ou4NmD5yoBjvF9wI=")),
      new EncryptionPrivkey(Encoding.fromBase64("mZI9KUlaCjIvN/byreTv87My337ZjMTmB0t3OKDiodQ=")),
    );

    let plainConversationKey = new SymmetricKey(Encoding.fromHex("0000000000000000000000000000000000000000000000000000000000000000"));

    service.encrypt(plainConversationKey, ownerKeypair.pubkey).then(encryptedConversationKey => {
      expect(encryptedConversationKey).toBeTruthy();

      service.decrypt(encryptedConversationKey, ownerKeypair).then(decrypted => {
        expect(decrypted).toBeTruthy();
        expect(decrypted.data).toEqual(plainConversationKey.data);
      });
    });
  })));
});
