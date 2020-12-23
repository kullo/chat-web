/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Injectable } from '@angular/core';
import { CryptoService, Ed25519Privkey, Ed25519Pubkey, Ed25519Signature } from '../crypto';

import { PlainPermission } from './plain-permission';
import { Encoding } from '../util';

interface PermissionSignerServiceInterface {
  makeSignature(permission: PlainPermission, privkey: Ed25519Privkey): Promise<Ed25519Signature>;
  verifySignature(signature: Ed25519Signature, permission: PlainPermission, pubkey: Ed25519Pubkey): Promise<boolean>;
}

export class FakePermissionSignerService implements PermissionSignerServiceInterface {
  makeSignature(permission: PlainPermission, privkey: Ed25519Privkey): Promise<Ed25519Signature> {
    return Promise.resolve(new Ed25519Signature(Encoding.fromHex("00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000")));
  }
  verifySignature(signature: Ed25519Signature, permission: PlainPermission, pubkey: Ed25519Pubkey): Promise<boolean> {
    return Promise.resolve(true);
  }
}

@Injectable()
export class PermissionSignerService implements PermissionSignerServiceInterface {

  // no state here! PermissionSignerService is kept alive across multiple user sessions

  constructor(
    private crypto: CryptoService
  ) { }

  async makeSignature(permission: PlainPermission, privkey: Ed25519Privkey): Promise<Ed25519Signature> {
    let data = Encoding.toUtf8(permission.serialized());
    let signature = await this.crypto.makeEd25519Signature(data, privkey);
    return signature;
  }

  async verifySignature(signature: Ed25519Signature, permission: PlainPermission, pubkey: Ed25519Pubkey): Promise<boolean> {
    let data = Encoding.toUtf8(permission.serialized());
    let success = this.crypto.verifyEd25519Signature(signature, data, pubkey);
    return success;
  }
}
