/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { TestBed, async, inject } from '@angular/core/testing';
import { CryptoService } from '../../crypto';
import { Context, ConversationKeyId, ConversationKeyBundle, IncomingMessage } from '../../server-types';

import { PlainMessage, TextPlainMessage } from '../messages/plain-message';

import { MessageEncoderService } from './message-encoder.service';

describe('MessageEncoderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CryptoService,
        MessageEncoderService,
      ]
    });
  });

  it('should be created', inject([MessageEncoderService], (service: MessageEncoderService) => {
    expect(service).toBeTruthy();
  }));

  it('can encode plain message', async(inject([MessageEncoderService, CryptoService], (service: MessageEncoderService, crypto: CryptoService) => {

    let originalPlain = new TextPlainMessage("huhu");

    (async () => {
      let deviceKeypair = await crypto.generateEd25519Keypair();
      let deviceKeyId = await crypto.makeFingerprint(deviceKeypair.pubkey.data);

      let conversationKeyId = new ConversationKeyId(await crypto.generateRandomId());
      let conversationKey = await crypto.generateSymmetricKey();
      let conversationKeyBundle = new ConversationKeyBundle(conversationKeyId, conversationKey)

      let context = new Context(1, 0, 333, new ConversationKeyId("abababa"), deviceKeyId);

      let outMessage = await service.encode(context, originalPlain, deviceKeypair.privkey, conversationKeyBundle);
      expect(outMessage).toBeTruthy();
      // console.log(serverMessage)

      let serverMessage = new IncomingMessage(outMessage.context, outMessage.encryptedMessage!, 2, new Date());
      let plain = await service.decode(serverMessage, deviceKeypair.pubkey, conversationKeyBundle);
      expect(plain).toBeTruthy();
      expect(plain.content).toEqual("huhu");
      // console.log(plain)
    })()
  })));
});
