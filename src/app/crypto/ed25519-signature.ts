/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Assert } from "../util";

export class Ed25519Signature {
  private makeTypeIncompatible: void;

  constructor(public readonly data: Uint8Array) {
    Assert.isSet(data, "data must be set");
    Assert.isEqual(data.length, 64);
  }
}
