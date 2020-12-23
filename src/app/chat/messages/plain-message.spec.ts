/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { TestBed } from '@angular/core/testing';
import { Encoding } from '../../util';

import { PlainMessage } from './plain-message';

describe('PlainMessage', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [],
    });
  });

  it('should create', () => {
    expect(new PlainMessage("text", "huhu", [])).toBeTruthy();
  });

  it('should create from json', () => {
    { // full example
      let json = {
        type: "text",
        content: "POSTED by me :)",
        attachments: [
          {
            id: "aabbccdd",
            name: "img1.png",
            mimeType: "image/png",
            encryption: {
                algorithm: "chacha20poly1305-ietf-nonce12prefixed",
                key: "B/lViSzth+5SybaOk6TvE6HGPdQMSCAQs1MMlg2S7AA=",
            },
          },
          {
            id: "eeffgghh",
            name: "img2.png",
            mimeType: "image/png",
            encryption: {
                algorithm: "chacha20poly1305-ietf-nonce12prefixed",
                key: "wa4WgcueHGJSZ20IACWfj8XVj6g5PWEBFch229l0BY4=",
            },
          },
        ],
      }
      let message = PlainMessage.fromJson(json)
      expect(message).toBeTruthy();
      expect(message.content).toEqual("POSTED by me :)");
      expect(message.attachments.length).toEqual(2);
      expect(message.attachments[0].id).toEqual("aabbccdd");
      expect(message.attachments[0].name).toEqual("img1.png");
      expect(message.attachments[0].encryptionAlgorithm).toEqual("chacha20poly1305-ietf-nonce12prefixed");
      expect(message.attachments[0].encryptionKey.data).toEqual(Encoding.fromBase64("B/lViSzth+5SybaOk6TvE6HGPdQMSCAQs1MMlg2S7AA="));
      expect(message.attachments[1].id).toEqual("eeffgghh");
      expect(message.attachments[1].name).toEqual("img2.png");
      expect(message.attachments[1].encryptionAlgorithm).toEqual("chacha20poly1305-ietf-nonce12prefixed");
      expect(message.attachments[1].encryptionKey.data).toEqual(Encoding.fromBase64("wa4WgcueHGJSZ20IACWfj8XVj6g5PWEBFch229l0BY4="));
    }

    { // attachments set to null
      let json = {
        type: "text",
        content: "POSTED by me :)",
        attachments: null,
      }
      let message = PlainMessage.fromJson(json)
      expect(message).toBeTruthy();
      expect(message.attachments.length).toEqual(0);
    }

    { // attachments not set
      let json = {
        type: "text",
        content: "POSTED by me :)",
      }
      let message = PlainMessage.fromJson(json)
      expect(message).toBeTruthy();
      expect(message.attachments.length).toEqual(0);
    }

    { // reaction
      let json = {
        type: "reaction",
        content: "😂",
      }
      let message = PlainMessage.fromJson(json)
      expect(message).toBeTruthy();
      expect(message.type).toEqual("reaction");
      expect(message.content).toEqual("\u{1F602}");
    }
  });

  it('should export to json', () => {
    let message = new PlainMessage("text", "Moie!", []);
    let expectedJson = {
      type: "text",
      content: "Moie!",
      attachments: [],
    }
    expect(message.toJson()).toEqual(expectedJson)
  });

});
