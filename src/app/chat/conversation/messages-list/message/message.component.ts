/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Component, Directive, Input, OnInit, OnDestroy, ElementRef, Output, EventEmitter } from '@angular/core';

import { Attachment, Thumbnail } from '../../../messages/attachment';
import { BlobService } from '../../../messages/blob.service';
import { MessagesElement } from '../../messages-list/messages-list.service';
import { UserPictureComponentData } from '../../../users/user-picture/user-picture.component';

export class ReactionEvent {
  constructor(
    public readonly parentMessageId: number,
    public readonly previousMessageId: number,
    public readonly content: string,
  ) { }
}

@Directive({selector: '[thumbnail]'})
export class ThumbnailDirective implements OnInit, OnDestroy {

  @Input()
  thumbnail: Thumbnail

  constructor(
    private el: ElementRef,
    private blob: BlobService,
  ) { }

  private dataUrl: string;

  ngOnInit() {
    this.downloadThumbnailIntoElement();
  }

  ngOnDestroy() {
    URL.revokeObjectURL(this.dataUrl);
  }

  async downloadThumbnailIntoElement() {
    let blob = await this.blob.downloadAndDecryptFile(
      this.thumbnail.id,
      this.thumbnail.mimeType,
      this.thumbnail.encryptionAlgorithm,
      this.thumbnail.encryptionKey);
    this.dataUrl = URL.createObjectURL(blob);
    this.el.nativeElement.src = this.dataUrl;
  }
}

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.less']
})
export class MessageComponent implements OnInit {

  constructor(
    private blob: BlobService,
  ) { }

  ngOnInit() {
  }

  @Output()
  reactionAdded: EventEmitter<ReactionEvent> = new EventEmitter<ReactionEvent>()

  @Input()
  data: MessagesElement

  @Input()
  conversationId: number

  newReactionPopupVisible = false;

  authorPictureDataFromMessage(message: MessagesElement): UserPictureComponentData | undefined {
    return {
      userId: message.author.id,
      user: message.author
    };
  }

  fancyTime(): string {
    let timeSent = this.data.timeSent
    if (timeSent) {
      let timeOptions = { hour: '2-digit', minute: '2-digit', second: undefined };
      return timeSent.toLocaleTimeString('de-DE', timeOptions);
    } else {
      return "";
    }
  }

  shortFilename(name: string): string {
    if (name.length >= 25) {
      let startCount = 15;
      let endCount = 8;
      return name.substr(0, startCount) + "…" + name.substr(-endCount, endCount);
    } else {
      return name;
    }
  }

  thumbnailAttachments(): Attachment[] {
    return this.data.message.attachments.filter(a => a.thumbnail != null);
  }

  nonThumbnailAttachments(): Attachment[] {
    return this.data.message.attachments.filter(a => a.thumbnail == null);
  }

  async downloadAndSaveAttachment(attachment: Attachment) {
    console.log("Time download and save", attachment.id);
    let blob = await this.blob.downloadAndDecryptFile(
      attachment.id,
      attachment.mimeType,
      attachment.encryptionAlgorithm,
      attachment.encryptionKey);
    this.saveData(blob, attachment.name);
  }

  saveData(blob: Blob, fileName: string) {
    let a = document.createElement("a");

    let url = URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  react(emojiIdentifier: string): void {
    let emojiContent: string
    switch(emojiIdentifier) {
      case 'heart': emojiContent = '\u{2764}\u{FE0F}'; break;
      case 'thumbs-up': emojiContent = '\u{1F44D}'; break;
      case 'thumbs-down': emojiContent = '\u{1F44E}'; break;
      case 'grinning-face': emojiContent = '\u{1F600}'; break;
      case 'confused-face': emojiContent = '\u{1F615}'; break;
      case 'face-with-open-mouth': emojiContent = '\u{1F62E}'; break;
      default: throw new Error("Unknown emoji identifier");
    }

    let previousMessageId = (this.data.replies.length)
      ? this.data.replies[this.data.replies.length-1].id
      : 0
    let reaction = new ReactionEvent(this.data.id, previousMessageId, emojiContent);
    this.reactionAdded.emit(reaction);
    this.newReactionPopupVisible = false;
  }
}
