/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Assert, Encoding } from '../util';

import { Ed25519Signature } from './ed25519-signature';

export class SignatureBundle {
  constructor(
    public readonly deviceId: string,
    public readonly signature: Ed25519Signature,
  ) {
    Assert.isSet(deviceId, "deviceId must be set");
    Assert.isSet(signature, "signature must be set");
  }

  toString(): string {
    return this.deviceId + "," + Encoding.toBase64(this.signature.data);
  }

  public static fromString(input: string): SignatureBundle {
    Assert.isSet(input, "input must be set");

    let parts = input.split(",");
    Assert.isEqual(parts.length, 2);
    return new SignatureBundle(
      parts[0],
      new Ed25519Signature(Encoding.fromBase64(parts[1])),
    );
  }
}
