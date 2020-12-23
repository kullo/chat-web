/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Injectable } from '@angular/core';
import { CryptoService, Ed25519Pubkey, Ed25519Privkey, Ed25519Signature } from '../crypto';
import { Assert, Encoding } from '../util';

import { LocalDevice } from './local-device';

interface DeviceGeneratorServiceInterface {
  generate(ownerId: number): Promise<LocalDevice>
}

export class FakeDeviceGeneratorService implements DeviceGeneratorServiceInterface {
  generate(ownerId: number): Promise<LocalDevice> {
    return Promise.resolve(new LocalDevice(
      "aabbccdd",
      1,
      new Ed25519Pubkey(new Uint8Array([0xAA])),
      new Ed25519Privkey(new Uint8Array([0xBB])),
      new Ed25519Signature(Encoding.fromHex("e5564300c360ac729086e2cc806e828a84877f1eb8e5d974d873e065224901555fb8821590a33bacc61e39701cf9b46bd25bf5f0595bbe24655141438e7a100b")),
    ));
  }
}

@Injectable()
export class DeviceGeneratorService implements DeviceGeneratorServiceInterface {

  constructor(
    private crypto: CryptoService,
  ) { }

  async generate(ownerId: number): Promise<LocalDevice> {
    Assert.isSet(ownerId, "ownerId must be set");

    let generatedKeypair = await this.crypto.generateEd25519Keypair();
    let id = await this.crypto.makeFingerprint(generatedKeypair.pubkey.data);
    let idOwnerId = Encoding.toUtf8(id + "|" + ownerId);
    let idOwnerIdSignature = await this.crypto.makeEd25519Signature(idOwnerId, generatedKeypair.privkey);

    return new LocalDevice(
      id,
      ownerId,
      generatedKeypair.pubkey,
      generatedKeypair.privkey,
      idOwnerIdSignature,
    );
  }

}
