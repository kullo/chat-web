/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { TestBed } from '@angular/core/testing';

import { Encoding } from './encoding';

describe('Encoding', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('can encode base64', () => {
    expect(Encoding.toBase64(new Uint8Array([]))).toEqual('');
    expect(Encoding.toBase64(new Uint8Array([0x61]))).toEqual('YQ==');
    expect(Encoding.toBase64(new Uint8Array([0x61,0x62]))).toEqual('YWI=');
    expect(Encoding.toBase64(new Uint8Array([0x61,0x62,0x63]))).toEqual('YWJj');
    expect(Encoding.toBase64(new Uint8Array([0x61,0x62,0x63,0x64]))).toEqual('YWJjZA==');
    expect(Encoding.toBase64(new Uint8Array([0x61,0x62,0x63,0x64,0x65]))).toEqual('YWJjZGU=');
    expect(Encoding.toBase64(new Uint8Array([0x61,0x62,0x63,0x64,0x65,0x66]))).toEqual('YWJjZGVm');
    expect(Encoding.toBase64(new Uint8Array([0x61,0x62,0x63,0x64,0x65,0x66,0x67]))).toEqual('YWJjZGVmZw==');
  });

  it('can decode base64', () => {
    expect(Encoding.fromBase64('')).toEqual(new Uint8Array([]));
    expect(Encoding.fromBase64('YQ==')).toEqual(new Uint8Array([0x61]));
    expect(Encoding.fromBase64('YWI=')).toEqual(new Uint8Array([0x61,0x62]));
    expect(Encoding.fromBase64('YWJj')).toEqual(new Uint8Array([0x61,0x62,0x63]));
    expect(Encoding.fromBase64('YWJjZA==')).toEqual(new Uint8Array([0x61,0x62,0x63,0x64]));
    expect(Encoding.fromBase64('YWJjZGU=')).toEqual(new Uint8Array([0x61,0x62,0x63,0x64,0x65]));
    expect(Encoding.fromBase64('YWJjZGVm')).toEqual(new Uint8Array([0x61,0x62,0x63,0x64,0x65,0x66]));
    expect(Encoding.fromBase64('YWJjZGVmZw==')).toEqual(new Uint8Array([0x61,0x62,0x63,0x64,0x65,0x66,0x67]));

    // no padding
    expect(() => { Encoding.fromBase64('YWI') }).toThrow();

    // invalid chars
    expect(() => { Encoding.fromBase64('YQÄ=') }).toThrow();
    expect(() => { Encoding.fromBase64('YQ_=') }).toThrow();
    expect(() => { Encoding.fromBase64('YQ~=') }).toThrow();
    expect(() => { Encoding.fromBase64('YQ.=') }).toThrow();

    // whitespace
    expect(() => { Encoding.fromBase64(' ') }).toThrow();
    expect(() => { Encoding.fromBase64('\n') }).toThrow();
    expect(() => { Encoding.fromBase64('    ') }).toThrow();
    expect(() => { Encoding.fromBase64('YQ==    ') }).toThrow();
    expect(() => { Encoding.fromBase64('    YQ==') }).toThrow();
  });

  it('can decode hex', () => {
    expect(Encoding.fromHex('')).toEqual(new Uint8Array([]));
    expect(Encoding.fromHex('00')).toEqual(new Uint8Array([0x0]));
    expect(Encoding.fromHex('01')).toEqual(new Uint8Array([0x1]));
    expect(Encoding.fromHex('61')).toEqual(new Uint8Array([0x61]));
    expect(Encoding.fromHex('6162')).toEqual(new Uint8Array([0x61,0x62]));
    expect(Encoding.fromHex('616263')).toEqual(new Uint8Array([0x61,0x62,0x63]));
    expect(Encoding.fromHex('aaBB')).toEqual(new Uint8Array([0xAA,0xBB]));

    expect(() => { Encoding.fromHex('1') }).toThrow();
    expect(() => { Encoding.fromHex('-1') }).toThrow();
    expect(() => { Encoding.fromHex('+1') }).toThrow();
    expect(() => { Encoding.fromHex('-11') }).toThrow();
    expect(() => { Encoding.fromHex('+11') }).toThrow();
    expect(() => { Encoding.fromHex('1~') }).toThrow();
    expect(() => { Encoding.fromHex(' 10') }).toThrow();
    expect(() => { Encoding.fromHex('10 ') }).toThrow();
    expect(() => { Encoding.fromHex('1 0') }).toThrow();
    expect(() => { Encoding.fromHex('XX') }).toThrow();
    expect(() => { Encoding.fromHex('xx') }).toThrow();
  });

  it('can encode hex', () => {
    expect(Encoding.toHex(new Uint8Array([]))).toEqual('');
    expect(Encoding.toHex(new Uint8Array([0x0]))).toEqual('00');
    expect(Encoding.toHex(new Uint8Array([0x1]))).toEqual('01');
    expect(Encoding.toHex(new Uint8Array([0x61]))).toEqual('61');
    expect(Encoding.toHex(new Uint8Array([0x61,0x62]))).toEqual('6162');
    expect(Encoding.toHex(new Uint8Array([0x61,0x62,0x63]))).toEqual('616263');
    expect(Encoding.toHex(new Uint8Array([0xAA,0xBB]))).toEqual('aabb');
  });

  describe('utf8', () => {
    it('can decode', () => {
      expect(Encoding.fromUtf8(new Uint8Array([]))).toEqual('');

      // ASCII
      expect(Encoding.fromUtf8(new Uint8Array([0x61]))).toEqual('a');
      expect(Encoding.fromUtf8(new Uint8Array([0x61,0x62]))).toEqual('ab');
      expect(Encoding.fromUtf8(new Uint8Array([0x61,0x62,0x63]))).toEqual('abc');

      // special chars
      // echo -n ö | hexdump -C
      expect(Encoding.fromUtf8(new Uint8Array([0xC3,0xB6]))).toEqual('ö');

      // https://www.compart.com/de/unicode/U+1F69A
      expect(Encoding.fromUtf8(new Uint8Array([0xF0,0x9F,0x9A,0x9A]))).toEqual('🚚');
    });

    it('can encode', () => {
      expect(Encoding.toUtf8('')).toEqual(new Uint8Array([]));

      // ASCII
      expect(Encoding.toUtf8('a')).toEqual(new Uint8Array([0x61]));
      expect(Encoding.toUtf8('ab')).toEqual(new Uint8Array([0x61,0x62]));
      expect(Encoding.toUtf8('abc')).toEqual(new Uint8Array([0x61,0x62,0x63]));

      // special chars
      // echo -n ö | hexdump -C
      expect(Encoding.toUtf8('ö')).toEqual(new Uint8Array([0xC3,0xB6]));

      // https://www.compart.com/de/unicode/U+1F69A
      expect(Encoding.toUtf8('🚚')).toEqual(new Uint8Array([0xF0,0x9F,0x9A,0x9A]));
    });
  });

});
