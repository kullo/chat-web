/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { TestBed, inject, async } from '@angular/core/testing';
import { SymmetricKey, Ed25519Keypair, Ed25519Pubkey, Ed25519Privkey, CryptoService, Ed25519Signature } from '../crypto';
import { Encoding } from '../util';

import { PlainPermission } from './plain-permission';
import { ConversationKeyId } from './conversation-key-bundle';

import { PermissionSignerService } from './permission-signer.service';

describe('PermissionSignerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PermissionSignerService,
        CryptoService,
      ],
    });
  });

  it('should be created', inject([PermissionSignerService], (service: PermissionSignerService) => {
    expect(service).toBeTruthy();
  }));

  it('can sign', async(inject([PermissionSignerService], (service: PermissionSignerService) => {
    let keypair = new Ed25519Keypair(
      new Ed25519Pubkey(Encoding.fromBase64("L4zz/cUkpadU7n3Uif7OivHwkQYolklgZrs3jovJTW0=")),
      new Ed25519Privkey(Encoding.fromBase64("Rrb9Ga5HOgm+W3YbH0rBmJsv9DEoKpctQLolHDihug0vjPP9xSSlp1TufdSJ/s6K8fCRBiiWSWBmuzeOi8lNbQ==")),
    );

    let plain = new PlainPermission(
      "aabbccdd",
      new ConversationKeyId("eeff0011"),
      new SymmetricKey(Encoding.fromHex("0011AABB")),
      56,
      10,
      "2018-01-01T12:13:14Z",
    );

    service.makeSignature(plain, keypair.privkey).then(signature => {
      expect(signature).toBeTruthy();
    });
  })));

  it('can sign and verify', async(inject([PermissionSignerService], (service: PermissionSignerService) => {
    let keypair = new Ed25519Keypair(
      new Ed25519Pubkey(Encoding.fromBase64("L4zz/cUkpadU7n3Uif7OivHwkQYolklgZrs3jovJTW0=")),
      new Ed25519Privkey(Encoding.fromBase64("Rrb9Ga5HOgm+W3YbH0rBmJsv9DEoKpctQLolHDihug0vjPP9xSSlp1TufdSJ/s6K8fCRBiiWSWBmuzeOi8lNbQ==")),
    );

    let plain = new PlainPermission(
      "aabbccdd",
      new ConversationKeyId("eeff0011"),
      new SymmetricKey(Encoding.fromHex("0011AABB")),
      56,
      10,
      "2018-01-01T12:13:14Z",
    );

    (async () => {
      let ok: boolean;

      let signature = await service.makeSignature(plain, keypair.privkey);
      ok = await service.verifySignature(signature, plain, keypair.pubkey);
      expect(ok).toEqual(true);

      let brokenSignature = new Ed25519Signature(signature.data);
      brokenSignature.data[0] ^= 0x01;
      ok = await service.verifySignature(signature, plain, keypair.pubkey);
      expect(ok).toEqual(false);
    })();
  })));

  it('can detect permission changes', async(inject([PermissionSignerService], (service: PermissionSignerService) => {
    let keypair = new Ed25519Keypair(
      new Ed25519Pubkey(Encoding.fromBase64("L4zz/cUkpadU7n3Uif7OivHwkQYolklgZrs3jovJTW0=")),
      new Ed25519Privkey(Encoding.fromBase64("Rrb9Ga5HOgm+W3YbH0rBmJsv9DEoKpctQLolHDihug0vjPP9xSSlp1TufdSJ/s6K8fCRBiiWSWBmuzeOi8lNbQ==")),
    );

    let plain = new PlainPermission(
      "aabbccdd",
      new ConversationKeyId("eeff0011"),
      new SymmetricKey(Encoding.fromHex("0011AABB")),
      56,
      10,
      "2018-01-01T12:13:14Z",
    );

    (async () => {
      let ok: boolean;

      let signature = await service.makeSignature(plain, keypair.privkey);

      // id changed
      ok = await service.verifySignature(signature, new PlainPermission(
        "aabbccdd1",
        new ConversationKeyId("eeff0011"),
        new SymmetricKey(Encoding.fromHex("0011AABB")),
        56,
        10,
        "2018-01-01T12:13:14Z",
      ), keypair.pubkey);
      expect(ok).toEqual(false);

      // key id changed
      ok = await service.verifySignature(signature, new PlainPermission(
        "aabbccdd",
        new ConversationKeyId("eeff0022"),
        new SymmetricKey(Encoding.fromHex("0011AABB")),
        56,
        10,
        "2018-01-01T12:13:14Z",
      ), keypair.pubkey);
      expect(ok).toEqual(false);

      // key changed
      ok = await service.verifySignature(signature, new PlainPermission(
        "aabbccdd",
        new ConversationKeyId("eeff0011"),
        new SymmetricKey(Encoding.fromHex("0011AACC")),
        56,
        10,
        "2018-01-01T12:13:14Z",
      ), keypair.pubkey);
      expect(ok).toEqual(false);

      // owner changed
      ok = await service.verifySignature(signature, new PlainPermission(
        "aabbccdd",
        new ConversationKeyId("eeff0011"),
        new SymmetricKey(Encoding.fromHex("0011AABB")),
        57,
        10,
        "2018-01-01T12:13:14Z",
      ), keypair.pubkey);
      expect(ok).toEqual(false);

      // creator changed
      ok = await service.verifySignature(signature, new PlainPermission(
        "aabbccdd",
        new ConversationKeyId("eeff0011"),
        new SymmetricKey(Encoding.fromHex("0011AABB")),
        56,
        11,
        "2018-01-01T12:13:14Z",
      ), keypair.pubkey);
      expect(ok).toEqual(false);

      // date changed
      ok = await service.verifySignature(signature, new PlainPermission(
        "aabbccdd",
        new ConversationKeyId("eeff0011"),
        new SymmetricKey(Encoding.fromHex("0011AABB")),
        56,
        10,
        "2018-01-01 12:13:14Z",
      ), keypair.pubkey);
      expect(ok).toEqual(false);
    })();
  })));
});
