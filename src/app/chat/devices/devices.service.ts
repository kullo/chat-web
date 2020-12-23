/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Injectable } from '@angular/core';
import { CryptoService, Ed25519Pubkey, Ed25519Signature, SignatureBundle } from '../../crypto';
import { ServerDevice } from '../../current-device';
import { Encoding, Assert } from '../../util';

import { ServerCommunicationService } from '../socket/server-communication.service';

interface DevicesServiceInterface {
  get(id: string): Promise<ServerDevice | undefined>
}

export class FakeDevicesService implements DevicesServiceInterface {
  get(id: string): Promise<ServerDevice | undefined> {
    return Promise.resolve(new ServerDevice(
      id,
      300,
      // privkey: AekuP15E/KNQn2/sdg8h6pmmTrntemkPDq/vPzCnd8mH2P70khhxGeaFpss9zM8tJhA236Y92NAiCsHmArVMdg==
      new Ed25519Pubkey(Encoding.fromBase64("h9j+9JIYcRnmhabLPczPLSYQNt+mPdjQIgrB5gK1THY=")),
      "active",
      null,
      new SignatureBundle(
        id,
        new Ed25519Signature(Encoding.fromHex("aabbaabbaabbaabbaabbaabbaabbaabbaabbaabbaabbaabbaabbaabbaabbaabbaabbaabbaabbaabbaabbaabbaabbaabbaabbaabbaabbaabbaabbaabbaabbaabb")),
      ),
    ));
  }
}

@Injectable()
export class DevicesService implements DevicesServiceInterface {

  private cache = new Map<string, ServerDevice>()

  constructor(
    private crypto: CryptoService,
    private server: ServerCommunicationService,
  ) { }

  async get(id: string): Promise<ServerDevice | undefined> {
    if (!this.cache.has(id)) {
      let device = await this.server.getDevice(id);
      if (device) {
        await this.verifyKey(id, device.pubkey);
        await this.verifyIdOwnerIdSignature(device);
        this.cache.set(id, device);
      }
    }

    return this.cache.get(id);
  }

  private async verifyKey(deviceId: string, pubkey: Ed25519Pubkey) {
    let generatedId = await this.crypto.makeFingerprint(pubkey.data);
    if (deviceId != generatedId) {
      throw Error("Pubkey does not match key id");
    }
  }

  private async verifyIdOwnerIdSignature(device: ServerDevice): Promise<void> {
    Assert.isSet(device, "device must be set");
    let ok = await this.crypto.verifyEd25519Signature(
      device.idOwnerIdSignature.signature,
      Encoding.toUtf8(device.id + "|" + device.ownerId),
      device.pubkey);
    if (!ok) return Promise.reject("Verfification failed");
    else return Promise.resolve();
  }
}
