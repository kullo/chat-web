/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Assert } from "./assert";

import { TextEncoder as FallbackTextEncoder, TextDecoder as FallbackTextDecoder } from 'text-encoding';

export class Encoding {

  private static readonly base64Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split("");
  private static readonly base64AlphabetInverted = (() => {
    let out: Map<string, number> = new Map();
    for (var i = 0; i < Encoding.base64Alphabet.length; i++) {
      out.set(Encoding.base64Alphabet[i], i);
    }
    return out;
  })();

  static toBase64(data: Uint8Array): string {
    Assert.isSet(data, "data must be set");

    let out = "";

    let inputRemaining = data.length;
    let pos = 0;

    while (inputRemaining >= 3) {
      out += this.base64EncodeBlock(new DataView(data.buffer, pos, 3));
      pos += 3;
      inputRemaining -= 3;
    }

    if (inputRemaining) {
      // 1 or 2 bytes of input remaining
      let emptyBytes = 3 - inputRemaining // 1 or 2 empty bytes
      let remainder = new Uint8Array([0x00, 0x00, 0x00])
      for (let i = 0; i < inputRemaining; ++i) {
        remainder[i] = data[pos+i];
      }
      let encodedBlock = this.base64EncodeBlock(new DataView(remainder.buffer));

      out += encodedBlock.substr(0, 4 - emptyBytes); // 2 or 3 chars from the block
      out += "==".substr(0, emptyBytes); // 1 or 2 padding chars
    }

    return out;
  }

  private static base64EncodeBlock(block: DataView): string {
    let out = "";
    // these three bytes become one 24-bit number
    let n: number = (block.getUint8(0) << 16) + (block.getUint8(1) << 8) + block.getUint8(2);
    let fourDigits = [(n >>> 18) & 63, (n >>> 12) & 63, (n >>> 6) & 63, n & 63];
    out += Encoding.base64Alphabet[fourDigits[0]]
    out += Encoding.base64Alphabet[fourDigits[1]]
    out += Encoding.base64Alphabet[fourDigits[2]]
    out += Encoding.base64Alphabet[fourDigits[3]]
    return out;
  }

  static fromBase64(str: string): Uint8Array {
    Assert.isSet(str, "str must be set");
    Assert.isDivisible(str.length, 4);

    let out = new Uint8Array((str.length / 4) * 3);
    let outPos = 0;

    // replace any incoming padding with a zero pad (the 'A' character is zero)
    var padding = ""
    if (str.charAt(str.length-1) == '=') padding += "A";
    if (str.charAt(str.length-2) == '=') padding += "A";
    str = str.substr(0, str.length - padding.length) + padding;
    let truncateBytes = padding.length;

    for (var pos = 0; pos < str.length; pos += 4) {
      var n = (this.base64AlphabetInvertedGetOrThrow(str.charAt(pos)) << 18)
        + (this.base64AlphabetInvertedGetOrThrow(str.charAt(pos+1)) << 12)
        + (this.base64AlphabetInvertedGetOrThrow(str.charAt(pos+2)) << 6)
        + this.base64AlphabetInvertedGetOrThrow(str.charAt(pos+3));

      // split the 24-bit number into the original three bytes
      let block = new Uint8Array([(n >>> 16) & 255, (n >>> 8) & 255, n & 255]);
      out[outPos+0] = block[0];
      out[outPos+1] = block[1];
      out[outPos+2] = block[2];
      outPos += 3;
    }

    if (truncateBytes) {
      return out.subarray(0, out.length - truncateBytes)
    } else {
      return out;
    }
  }

  private static base64AlphabetInvertedGetOrThrow(char: string): number {
    let value = this.base64AlphabetInverted.get(char);
    if (value === undefined) {
      throw new Error("Invalid character in base64 string");
    }
    return value;
  }

  static fromHex(input: string): Uint8Array {
    Assert.isSet(input, "input must be set");
    Assert.isEven(input.length);

    let out = new Uint8Array(input.length / 2);
    for (let outPos = 0; outPos < out.length; ++outPos) {
      let block = input.substr(outPos * 2, 2)
      if (/^([0-9a-fA-F]{2})$/.test(block)) {
        out[outPos] = parseInt(block, 16);
      } else {
        throw "Invalid hex sequence found: '" + block + "'";
      }
    }
    return out;
  }

  static toHex(input: Uint8Array): string {
    Assert.isSet(input, "input must be set");
    let out = new Array<string>();
    input.forEach(byte => {
      out.push(('0' + (byte & 0xFF).toString(16)).slice(-2));
    });
    return out.join('');
  }

  static toUtf8(input: string): Uint8Array {
    Assert.isSet(input, "input must be set");
    return this.utf8Encoder.encode(input);
  }

  static fromUtf8(input: Uint8Array): string {
    Assert.isSet(input, "input must be set");
    return this.utf8Decoder.decode(input);
  }

  private static readonly utf8Encoder = (() => {
    let w: any = window;
    if (w && w.TextEncoder && w.TextEncoder.prototype) {
      return new w.TextEncoder();
    } else {
      return new FallbackTextEncoder();
    }
  })();

  private static readonly utf8Decoder = (() => {
    let w: any = window;
    if (w && w.TextDecoder && w.TextDecoder.prototype) {
      return new w.TextDecoder();
    } else {
      return new FallbackTextDecoder();
    }
  })();
}
