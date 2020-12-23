/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { TestBed } from '@angular/core/testing';
import { Encoding } from '../util';

import { Ed25519Signature } from './ed25519-signature';

import { SignatureBundle } from './signature-bundle';

describe('SignatureBundle', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [],
    });
  });

  it('should create', () => {
    let uut = new SignatureBundle(
      "619f0a18d1406396e3ffbb105a5c0b09",
      new Ed25519Signature(Encoding.fromBase64("a9jUKa/taw0Z6i/gwo5GAa7HaOOc1mStL3F3V8RfIeqC1w5slMdezG5JeEFVAzJHBICbeYiwie3fciQPXWke0g=="))
    )
    expect(uut).toBeTruthy();
  });

  it('should create from string', () => {
    let str = "619f0a18d1406396e3ffbb105a5c0b09,a9jUKa/taw0Z6i/gwo5GAa7HaOOc1mStL3F3V8RfIeqC1w5slMdezG5JeEFVAzJHBICbeYiwie3fciQPXWke0g==";
    let uut = SignatureBundle.fromString(str);
    expect(uut.deviceId).toEqual("619f0a18d1406396e3ffbb105a5c0b09");
    expect(uut.signature.data).toEqual(Encoding.fromBase64("a9jUKa/taw0Z6i/gwo5GAa7HaOOc1mStL3F3V8RfIeqC1w5slMdezG5JeEFVAzJHBICbeYiwie3fciQPXWke0g=="));
  });

  it('should export to string', () => {
    let uut = new SignatureBundle(
      "619f0a18d1406396e3ffbb105a5c0b09",
      new Ed25519Signature(Encoding.fromBase64("a9jUKa/taw0Z6i/gwo5GAa7HaOOc1mStL3F3V8RfIeqC1w5slMdezG5JeEFVAzJHBICbeYiwie3fciQPXWke0g=="))
    )
    expect(uut.toString()).toEqual("619f0a18d1406396e3ffbb105a5c0b09,a9jUKa/taw0Z6i/gwo5GAa7HaOOc1mStL3F3V8RfIeqC1w5slMdezG5JeEFVAzJHBICbeYiwie3fciQPXWke0g==");
  });
});
