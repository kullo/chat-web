/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { TestBed, inject, async } from '@angular/core/testing';
import { SymmetricKey, EncryptionPubkey, Ed25519Keypair, Ed25519Pubkey, Ed25519Privkey, Ed25519Signature, EncryptionKeypair, EncryptionPrivkey } from '../crypto';
import { LocalDevice } from '../current-device';
import { Encoding } from '../util';

import { ConversationKeyId } from './conversation-key-bundle';
import { PermissionEncryptionService, FakePermissionEncryptionService } from './permission-encryption.service';
import { PermissionSignerService, FakePermissionSignerService } from './permission-signer.service';
import { PlainPermission } from './plain-permission';
import { User } from './user';

import { PermissionPackerService } from './permission-packer.service';

describe('PermissionPackerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PermissionPackerService,
        { provide: PermissionEncryptionService, useClass: FakePermissionEncryptionService },
        { provide: PermissionSignerService, useClass: FakePermissionSignerService },
      ],
    });
  });

  it('should be created', inject([PermissionPackerService], (service: PermissionPackerService) => {
    expect(service).toBeTruthy();
  }));

  it('should pack', async(inject([PermissionPackerService], (service: PermissionPackerService) => {
    let owner = new User(8, "active", "Jutta", null,
      new EncryptionPubkey(Encoding.fromBase64("cDqTxCse7WLg81u8PUCnz79vFN0ou4NmD5yoBjvF9wI="))
    );

    let signingDevice = new LocalDevice(
      "ffddffddffddffddffddffdd",
      22,
      new Ed25519Pubkey(Encoding.fromBase64("L4zz/cUkpadU7n3Uif7OivHwkQYolklgZrs3jovJTW0=")),
      new Ed25519Privkey(Encoding.fromBase64("Rrb9Ga5HOgm+W3YbH0rBmJsv9DEoKpctQLolHDihug0vjPP9xSSlp1TufdSJ/s6K8fCRBiiWSWBmuzeOi8lNbQ==")),
      new Ed25519Signature(Encoding.fromHex("00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"))
    );

    let plainPermission = new PlainPermission(
      "aabbccdd",
      new ConversationKeyId("aabbccdd"),
      new SymmetricKey(Encoding.fromHex("00000000")),
      8,
      22,
      "2018-01-02T03:04:05.006Z",
    );

    service.pack(plainPermission, owner, signingDevice).then(packed => {
      expect(packed).toBeTruthy();
      expect(packed.signature.deviceId).toEqual(signingDevice.id);
    });
  })));

  it('should pack and unpack', async(inject([PermissionPackerService], (service: PermissionPackerService) => {
    let ownerKeypair = new EncryptionKeypair(
      new EncryptionPubkey(Encoding.fromBase64("VshVcmTrq8+b+19AW7nVND4Gyh07/IOgl/N/3uOzYCw=")),
      new EncryptionPrivkey(Encoding.fromBase64("vQUcyY4RYciAVCmviqTAp8sRiEWON0ZEhUKMGO3cULo=")),
    );
    let owner = new User(8, "active", "Jutta", null, ownerKeypair.pubkey);

    let signingDevice = new LocalDevice(
      "ffddffddffddffddffddffdd",
      22,
      new Ed25519Pubkey(Encoding.fromBase64("L4zz/cUkpadU7n3Uif7OivHwkQYolklgZrs3jovJTW0=")),
      new Ed25519Privkey(Encoding.fromBase64("Rrb9Ga5HOgm+W3YbH0rBmJsv9DEoKpctQLolHDihug0vjPP9xSSlp1TufdSJ/s6K8fCRBiiWSWBmuzeOi8lNbQ==")),
      new Ed25519Signature(Encoding.fromHex("00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"))
    );

    let plainPermission = new PlainPermission(
      "aabbccdd",
      new ConversationKeyId("aabbccdd"),
      new SymmetricKey(Encoding.fromHex("00000000")),
      8,
      22,
      "2018-01-02T03:04:05.006Z",
    );

    (async () => {
      let packed = await service.pack(plainPermission, owner, signingDevice);
      let unpacked = await service.unpack(packed, ownerKeypair, signingDevice.pubkey);
      expect(unpacked).toBeTruthy();
    })();
  })));
});
