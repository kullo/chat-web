/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Injectable } from '@angular/core';
import { CryptoService } from '../../crypto';
import { CurrentDeviceService } from '../../current-device';
import { Assert, Arrays, Images } from '../../util';
import { Context } from '../../server-types';

import { ConversationPermissionsService } from '../conversations/conversation-permissions.service';
import { Attachment, Thumbnail } from '../messages/attachment';
import { BlobService } from '../messages/blob.service';
import { MessageEncoderService } from '../messages/message-encoder.service';
import { PlainMessage, TextPlainMessage, ReactionPlainMessage } from '../messages/plain-message';
import { ServerCommunicationService } from '../socket/server-communication.service';

interface SenderServiceInterface {
  sendText(text: string, conversationId: string, previousMessageId: number): Promise<void>
  sendReaction(content: string, conversationId: string, parentMessageId: number, previousMessageId: number): Promise<void>
  uploadFilesAndSend(files: File[], conversationId: string, previousMessageId: number): Promise<void>
}

export class FakeSenderService implements SenderServiceInterface {
  sendText(text: string, conversationId: string, previousMessageId: number): Promise<void> {
    return Promise.resolve();
  }
  sendReaction(content: string, conversationId: string, parentMessageId: number, previousMessageId: number): Promise<void> {
    return Promise.resolve();
  }
  uploadFilesAndSend(files: File[], conversationId: string, previousMessageId: number): Promise<void> {
    return Promise.resolve();
  }
}

@Injectable()
export class SenderService implements SenderServiceInterface {

  private readonly THUMBNAIL_WIDTH = 300;
  private readonly THUMBNAIL_HEIGHT = 200;

  constructor(
    private blob: BlobService,
    private crypto: CryptoService,
    private currentDevice: CurrentDeviceService,
    private conversationPermissions: ConversationPermissionsService,
    private messageEncoder: MessageEncoderService,
    private server: ServerCommunicationService,
  ) { }

  async sendText(text: string, conversationId: string, previousMessageId: number): Promise<void> {
    let message = new TextPlainMessage(text);
    let parentMessageId = 0; // sending text replys is not supported at the moment
    await this.send(message, conversationId, parentMessageId, previousMessageId);
  }

  async sendReaction(content: string, conversationId: string, parentMessageId: number, previousMessageId: number): Promise<void> {
    let message = new ReactionPlainMessage(content);
    await this.send(message, conversationId, parentMessageId, previousMessageId);
  }

  async uploadFilesAndSend(files: File[], conversationId: string, previousMessageId: number): Promise<void> {
    Assert.isSet(files, "files must be set");
    Assert.isTrue(files.length > 0, "files must not be empty");
    Assert.isSet(conversationId, "conversationId must be set");

    let uploadsCount = files.length + Arrays.sum(files, this.canCreateThumbnail);
    let serverAttachments = await this.server.getAttachmentUploadUrls(uploadsCount);

    let conversationKeyId = await this.conversationPermissions.latestKeyId(conversationId);

    let attachments: Attachment[] = []
    for (let file of files) {
      let fullServerAttachment = serverAttachments.shift()!
      let fileId = fullServerAttachment.id;
      let attachmentEncryptionAlgorithm = "chacha20poly1305-ietf-nonce12prefixed";
      let attachmentEncryptionKey = await this.crypto.generateSymmetricKey();
      await this.blob.encryptAndUploadFile(
        file,
        fullServerAttachment.uploadUrl,
        attachmentEncryptionAlgorithm,
        attachmentEncryptionKey);

      let attachmentThumb: Thumbnail | null = null
      if (this.canCreateThumbnail(file)) {
        let thumbnailBlob = await Images.resize(file, this.THUMBNAIL_WIDTH, this.THUMBNAIL_HEIGHT);

        let thumbServerAttachment = serverAttachments.shift()!
        let thumbEncryptionAlgorithm = "chacha20poly1305-ietf-nonce12prefixed";
        let thumbEncryptionKey = await this.crypto.generateSymmetricKey();
        attachmentThumb = new Thumbnail(
          thumbServerAttachment.id,
          thumbnailBlob.type,
          this.THUMBNAIL_WIDTH,
          this.THUMBNAIL_HEIGHT,
          thumbEncryptionAlgorithm,
          thumbEncryptionKey,
        );
        await this.blob.encryptAndUploadFile(
          thumbnailBlob,
          thumbServerAttachment.uploadUrl,
          thumbEncryptionAlgorithm,
          thumbEncryptionKey);
      }

      attachments.push(new Attachment(
        fileId,
        file.name,
        file.type,
        attachmentEncryptionAlgorithm,
        attachmentEncryptionKey,
        attachmentThumb));
    }

    let parentMessageId = 0; // sending attachment replys is not supported at the moment
    let message = new TextPlainMessage("", attachments);
    await this.send(message, conversationId, parentMessageId, previousMessageId);
  }

  private async send(
    message: PlainMessage,
    conversationId: string,
    parentMessageId: number,
    previousMessageId: number,
  ): Promise<void> {
    Assert.isSet(message, "message must be set");
    Assert.isSet(conversationId, "conversationId must be set");
    Assert.isSet(previousMessageId, "previousMessageId must be set");

    let conversationKeyId = await this.conversationPermissions.latestKeyId(conversationId);
    let conversationKey = await this.conversationPermissions.key(conversationKeyId);

    let privateKey = (await this.currentDevice.device()).privkey;
    let deviceKeyId = (await this.currentDevice.device()).id;
    let context = new Context(1, parentMessageId, previousMessageId, conversationKeyId, deviceKeyId)

    let outMessage = await this.messageEncoder.encode(context, message, privateKey, conversationKey);
    await this.server.send(outMessage);
  }

  private canCreateThumbnail(file: File): boolean {
    return (
      file.type == "image/png"
      || file.type == "image/jpeg"
      || file.type == "image/svg+xml"
    );
  }

}
