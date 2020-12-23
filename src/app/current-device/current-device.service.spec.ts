/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { TestBed, async, inject } from '@angular/core/testing';
import { CryptoService, Ed25519Pubkey, Ed25519Privkey, Ed25519Signature, EncryptionPubkey, EncryptionPrivkey, EncryptionKeypair, SymmetricKey } from '../crypto';
import { StorageService, FakeStorageService } from '../storage';
import { Encoding } from '../util';

import { CurrentDeviceService } from './current-device.service';

import { LocalDevice } from './local-device';

describe('CurrentDeviceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CryptoService,
        CurrentDeviceService,
        { provide: StorageService, useClass: FakeStorageService },
      ]
    });
  });

  it('should be created', inject([CurrentDeviceService], (service: CurrentDeviceService) => {
    expect(service).toBeTruthy();
  }));

  describe('Device', () => {
    it('should have no device by default', async(inject([CurrentDeviceService], (service: CurrentDeviceService) => {
      service.device()
        .then(result => {
          fail("must not resolve");
        })
        .catch(error => {
          expect(error).toMatch(/not found/)
        });
    })));

    it('should have a device when set', async(inject([CurrentDeviceService], (service: CurrentDeviceService) => {
      let pubkey = new Ed25519Pubkey(new Uint8Array([0xaa]));
      let privkey = new Ed25519Privkey(new Uint8Array([0xbb]));
      let idOwnerIdSignature = new Ed25519Signature(Encoding.fromHex("e5564300c360ac729086e2cc806e828a84877f1eb8e5d974d873e065224901555fb8821590a33bacc61e39701cf9b46bd25bf5f0595bbe24655141438e7a100b"));
      let originalDevice = new LocalDevice("aabbccdd", 22, pubkey, privkey, idOwnerIdSignature);

      service.setDevice(originalDevice);

      service.device().then(device => {
        expect(device).toBeTruthy();
        expect(device.id).toEqual("aabbccdd");
        expect(device.pubkey.data).toEqual(new Uint8Array([0xaa]));
        expect(device.privkey.data).toEqual(new Uint8Array([0xbb]));
        expect(device.ownerId).toEqual(22);
        expect(device.idOwnerIdSignature.data).toEqual(Encoding.fromHex("e5564300c360ac729086e2cc806e828a84877f1eb8e5d974d873e065224901555fb8821590a33bacc61e39701cf9b46bd25bf5f0595bbe24655141438e7a100b"));
      });
    })));

    it('device can be cleared', async(inject([CurrentDeviceService], (service: CurrentDeviceService) => {
      let pubkey = new Ed25519Pubkey(new Uint8Array([0xaa]));
      let privkey = new Ed25519Privkey(new Uint8Array([0xbb]));
      let idOwnerIdSignature = new Ed25519Signature(Encoding.fromHex("e5564300c360ac729086e2cc806e828a84877f1eb8e5d974d873e065224901555fb8821590a33bacc61e39701cf9b46bd25bf5f0595bbe24655141438e7a100b"));
      let originalDevice = new LocalDevice("aabbccdd", 22, pubkey, privkey, idOwnerIdSignature);
      service.setDevice(originalDevice);
      service.clearDevice();

      service.device()
        .then(result => {
          fail("Promise must not resolve. Result: " + result);
        })
        .catch(error => {
          expect(error).toMatch(/not found/)
        });
    })));
  });

  describe('LoginKey', () => {
    it('should have no LoginKey by default', async(inject([CurrentDeviceService], (service: CurrentDeviceService) => {
      service.loginKey()
        .then(result => {
          fail("must not resolve");
        })
        .catch(error => {
          expect(error).toMatch(/not found/)
        });
    })));

    it('should have a LoginKey when set', async(inject([CurrentDeviceService], (service: CurrentDeviceService) => {
      let originalLoginKey = new Uint8Array([0xcc]);

      service.setLoginKey(originalLoginKey);

      service.loginKey().then(loginKey => {
        expect(loginKey).toBeTruthy();
      });
    })));

    it('LoginKey can be cleared', async(inject([CurrentDeviceService], (service: CurrentDeviceService) => {
      let originalLoginKey = new Uint8Array([0xcc]);
      service.setLoginKey(originalLoginKey);
      service.clearLoginKey();

      service.loginKey()
        .then(result => {
          fail("Promise must not resolve. Result: " + result);
        })
        .catch(error => {
          expect(error).toMatch(/not found/)
        });
    })));
  });

  describe('EncryptionPrivkeyEncryptingKey', () => {
    it('should have no EncryptionPrivkeyEncryptingKey by default', async(inject([CurrentDeviceService], (service: CurrentDeviceService) => {
      service.encryptionPrivkeyEncryptingKey()
        .then(result => {
          fail("must not resolve");
        })
        .catch(error => {
          expect(error).toMatch(/not found/)
        });
    })));

    it('should have a EncryptionPrivkeyEncryptingKey when set', async(inject([CurrentDeviceService], (service: CurrentDeviceService) => {
      let originalEncryptionPrivkeyEncryptingKey = new SymmetricKey(new Uint8Array([0xcc]));

      service.setEncryptionPrivkeyEncryptingKey(originalEncryptionPrivkeyEncryptingKey);

      service.encryptionPrivkeyEncryptingKey().then(epek => {
        expect(epek).toBeTruthy();
      });
    })));

    it('EncryptionPrivkeyEncryptingKey can be cleared', async(inject([CurrentDeviceService], (service: CurrentDeviceService) => {
      let originalEncryptionPrivkeyEncryptingKey = new SymmetricKey(new Uint8Array([0xcc]));
      service.setEncryptionPrivkeyEncryptingKey(originalEncryptionPrivkeyEncryptingKey);
      service.clearEncryptionPrivkeyEncryptingKey();

      service.encryptionPrivkeyEncryptingKey()
        .then(result => {
          fail("Promise must not resolve. Result: " + result);
        })
        .catch(error => {
          expect(error).toMatch(/not found/)
        });
    })));
  });

  describe('EncryptionKeypair', () => {
    it('should have no EncryptionKeypair by default', async(inject([CurrentDeviceService], (service: CurrentDeviceService) => {
      service.encryptionKeypair()
        .then(result => {
          fail("must not resolve");
        })
        .catch(error => {
          expect(error).toMatch(/not found/)
        });
    })));

    it('should have a EncryptionKeypair when set', async(inject([CurrentDeviceService], (service: CurrentDeviceService) => {
      let originalEncryptionKeypair = new EncryptionKeypair(
        new EncryptionPubkey(new Uint8Array([0xcc])),
        new EncryptionPrivkey(new Uint8Array([0xdd]))
      );

      service.setEncryptionKeypair(originalEncryptionKeypair);

      service.encryptionKeypair().then(keypair => {
        expect(keypair).toBeTruthy();
        expect(keypair.pubkey.data).toEqual(new Uint8Array([0xcc]));
        expect(keypair.privkey.data).toEqual(new Uint8Array([0xdd]));
      });
    })));

    it('EncryptionKeypair can be cleared', async(inject([CurrentDeviceService], (service: CurrentDeviceService) => {
      let originalEncryptionKeypair = new EncryptionKeypair(
        new EncryptionPubkey(new Uint8Array([0xcc])),
        new EncryptionPrivkey(new Uint8Array([0xdd]))
      );
      service.setEncryptionKeypair(originalEncryptionKeypair);
      service.clearEncryptionKeypair();

      service.encryptionKeypair()
        .then(result => {
          fail("Promise must not resolve. Result: " + result);
        })
        .catch(error => {
          expect(error).toMatch(/not found/)
        });
    })));
  });
});
