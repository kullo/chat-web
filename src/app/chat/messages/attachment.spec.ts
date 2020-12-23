/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { TestBed } from '@angular/core/testing';
import { SymmetricKey } from '../../crypto';
import { Encoding } from '../../util';

import { Attachment, Thumbnail } from './attachment';

describe('Attachment', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [],
    });
  });

  it('should create', () => {
    let uut = new Attachment(
      "974g9734g5gt3",
      "image.png",
      "image/png",
      "chacha20poly1305-ietf-nonce12prefixed",
      new SymmetricKey(Encoding.fromBase64("AAAA")),
      null,
    );
    expect(uut).toBeTruthy();
  });

  it('should export to json', () => {
    { // without thumbnail
      let uut = new Attachment(
        "974g9734g5gt3",
        "image.png",
        "image/png",
        "chacha20poly1305-ietf-nonce12prefixed",
        new SymmetricKey(Encoding.fromBase64("AAAA")),
        null,
      );
      let expectedJson = {
        id: "974g9734g5gt3",
        name: "image.png",
        mimeType: "image/png",
        encryption: {
          algorithm: "chacha20poly1305-ietf-nonce12prefixed",
          key: "AAAA",
        },
        thumbnail: null,
      }
      expect(uut.toJson()).toEqual(expectedJson)
    }

    { // with thumbnail
      let thumbnail = new Thumbnail(
        "76669967f",
        "image/jpeg",
        200, 100,
        "chacha20poly1305-ietf-nonce12prefixed",
        new SymmetricKey(Encoding.fromBase64("BBBB")),
      );
      let uut = new Attachment(
        "974g9734g5gt3",
        "image.png",
        "image/png",
        "chacha20poly1305-ietf-nonce12prefixed",
        new SymmetricKey(Encoding.fromBase64("AAAA")),
        thumbnail,
      );
      let expectedJson = {
        id: "974g9734g5gt3",
        name: "image.png",
        mimeType: "image/png",
        encryption: {
          algorithm: "chacha20poly1305-ietf-nonce12prefixed",
          key: "AAAA",
        },
        thumbnail: {
          id: "76669967f",
          mimeType: "image/jpeg",
          width: 200,
          height: 100,
          encryption: {
            algorithm: "chacha20poly1305-ietf-nonce12prefixed",
            key: "BBBB",
          },
        },
      }
      expect(uut.toJson()).toEqual(expectedJson)
    }
  });

  it('should create from json', () => {
    let json = {
      id: "974g9734g5gt3",
      name: "image.png",
      mimeType: "image/png",
      encryption: {
        algorithm: "chacha20poly1305-ietf-nonce12prefixed",
        key: "AAAA",
      },
      thumbnail: {
        id: "bf04ugb90u34bg",
        mimeType: "image/jpeg",
        width: 200,
        height: 100,
        encryption: {
          algorithm: "chacha20poly1305-ietf-nonce12prefixed",
          key: "BBBB",
        },
      }
    }
    let uut = Attachment.fromJson(json)
    expect(uut).toBeTruthy();
    expect(uut.id).toEqual("974g9734g5gt3");
    expect(uut.name).toEqual("image.png");
    expect(uut.mimeType).toEqual("image/png");
    expect(uut.encryptionAlgorithm).toEqual("chacha20poly1305-ietf-nonce12prefixed");
    expect(uut.encryptionKey.data).toEqual(Encoding.fromBase64("AAAA"));
    expect(uut.thumbnail).toBeTruthy();
    expect(uut.thumbnail!.id).toEqual("bf04ugb90u34bg");
    expect(uut.thumbnail!.mimeType).toEqual("image/jpeg");
    expect(uut.thumbnail!.width).toEqual(200);
    expect(uut.thumbnail!.height).toEqual(100);
    expect(uut.thumbnail!.encryptionAlgorithm).toEqual("chacha20poly1305-ietf-nonce12prefixed");
    expect(uut.thumbnail!.encryptionKey.data).toEqual(Encoding.fromBase64("BBBB"));
  });
});
