/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Injectable } from '@angular/core';
import { CryptoService, Ed25519Pubkey, Ed25519Privkey, SymmetricKey } from '../../crypto';
import { Assert, Encoding } from '../../util';
import { Context, ConversationKeyBundle, IncomingMessage, OutgoingMessage } from '../../server-types';

import { PlainMessage } from '../messages/plain-message';

interface MessageEncoderServiceInterface {
  encode(context: Context, plainMessage: PlainMessage, signaturePrivkey: Ed25519Privkey, encryptionKey: ConversationKeyBundle): Promise<OutgoingMessage>
  decode(serverMessage: IncomingMessage, signaturePubkey: Ed25519Pubkey, encryptionKey: ConversationKeyBundle): Promise<PlainMessage>
}

export class FakeMessageEncoderService implements MessageEncoderServiceInterface {
  encode(
    context: Context,
    plainMessage: PlainMessage,
    signaturePrivkey: Ed25519Privkey,
    encryptionKey: ConversationKeyBundle,
  ): Promise<OutgoingMessage> {
    return Promise.reject("not implemented");
  }

  decode(
    serverMessage: IncomingMessage,
    signaturePubkey: Ed25519Pubkey,
    encryptionKey: ConversationKeyBundle,
  ): Promise<PlainMessage> {
    return Promise.reject("not implemented");
  }
}

@Injectable()
export class MessageEncoderService implements MessageEncoderServiceInterface {

  constructor(private crypto: CryptoService) {
  }

  async encode(
    context: Context,
    plainMessage: PlainMessage,
    signaturePrivkey: Ed25519Privkey,
    encryptionKey: ConversationKeyBundle,
  ): Promise<OutgoingMessage> {
    Assert.isSet(context, "context must be set")
    Assert.isSet(plainMessage, "plainMessage must be set")
    Assert.isSet(signaturePrivkey, "signaturePrivkey must be set")
    Assert.isSet(encryptionKey, "encryptionKey must be set")

    let payload = {
      context: context.toJson(),
      plainMessage: plainMessage.toJson(),
    }
    let binaryPayload = Encoding.toUtf8(JSON.stringify(payload));

    let messageWithSignature = await this.crypto.signEd25519(binaryPayload, signaturePrivkey);
    let encryptedMessage = await this.crypto.encryptWithSymmetricKey(messageWithSignature, encryptionKey.key);
    let encryptedMessageB64 = await this.crypto.base64Encode(encryptedMessage);
    return new OutgoingMessage(context, encryptedMessageB64);
  }

  async decode(
    serverMessage: IncomingMessage,
    signaturePubkey: Ed25519Pubkey,
    encryptionKey: ConversationKeyBundle,
  ): Promise<PlainMessage> {
    Assert.isSet(serverMessage, "serverMessage must be set")
    Assert.isSet(signaturePubkey, "signaturePubkey must be set")
    Assert.isSet(encryptionKey, "encryptionKey must be set")

    let encryptedMessage = await this.crypto.base64Decode(serverMessage.encryptedMessage);
    let signedMessage = await this.crypto.decryptWithSymmetricKey(encryptedMessage, encryptionKey.key);
    let verifiedRawMessage = await this.crypto.verifyEd25519(signedMessage, signaturePubkey);

    if (!verifiedRawMessage) return Promise.reject("Verfification failed")

    let json = JSON.parse(Encoding.fromUtf8(verifiedRawMessage))
    let innerContext = Context.fromJson(json.context)

    if (!innerContext.equals(serverMessage.context)) {
      console.log(innerContext)
      console.log(serverMessage.context)
      return Promise.reject("Invalid context")
    }

    return PlainMessage.fromJson(json.plainMessage);
  }

}
