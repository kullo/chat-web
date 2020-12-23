/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Injectable } from '@angular/core';
import { EncryptionPubkey } from '../../../crypto';
import { RestApiService, User } from '../../../server-types';
import { Assert, Encoding } from '../../../util';

import { ConversationPermissionsService } from '../../conversations/conversation-permissions.service';
import { DevicesService } from '../../devices/devices.service';
import { PlainMessage, TextPlainMessage } from '../../messages/plain-message';
import { MessageEncoderService } from '../../messages/message-encoder.service';
import { ServerCommunicationService } from '../../socket/server-communication.service';
import { UsersService } from '../../users/users.service';

export class MessagesElement {
  constructor(
    public message: PlainMessage,
    public author: User,
    public isContinuation: boolean,
    public id: number,
    public timeSent: Date,
    public replies: Reply[], // sorted by reply ID
  ) {}
}

export interface Reply {
  id: number
  message: PlainMessage
  author: User
}

interface UpdateJob {
  plainMessage?: PlainMessage;
  timeSent?: Date;
  replies?: Reply[];
}

export class SeparatorElement {
  constructor(
    public date: Date,
  ) {}
}

interface MessagesListServiceInterface {
  readonly items: (MessagesElement|SeparatorElement)[]
  readonly messages: MessagesElement[]
  conversation(): string
  setConversation(conversationId: string): void
  addOrUpdateTopMessage(plainMessage: PlainMessage, author: User, id: number, timeSent: Date): void
  lastMessageId(): number
}

export class FakeMessagesListService implements MessagesListServiceInterface {
  constructor() {}

  private author1 = new User(
    1, "active", "Max Muster", "https://www.kullo.de/2/images/customer01.jpg",
    new EncryptionPubkey(Encoding.fromBase64("AAAA")),
  );
  private author2 = new User(
    2, "active", "John Doe", "https://www.kullo.de/2/images/customer02.jpg",
    new EncryptionPubkey(Encoding.fromBase64("AAAA")),
  );

  messages: MessagesElement[] = [
    new MessagesElement(
      new TextPlainMessage('Hello, world'), this.author1,
      false, 1, new Date('2017-01-01T00:00:00Z'), []),
    new MessagesElement(
      new TextPlainMessage('Happy new year, everyone!'), this.author2,
      false, 2, new Date('2017-01-01T00:01:00Z'), []),
    new MessagesElement(
      new TextPlainMessage('drie'), this.author1,
      false, 3, new Date('2017-01-01T00:02:00Z'), []),
    new MessagesElement(
      new TextPlainMessage('drei*'), this.author1,
      false, 4, new Date('2017-01-01T00:02:50Z'), []),
  ]

  items: (MessagesElement|SeparatorElement)[] = this.messages

  conversation(): string {
    return "42";
  }

  setConversation(conversationId: string): void {}

  addOrUpdateTopMessage(plainMessage: PlainMessage, author: User, id: number, timeSent: Date): void {
    this.items.push(new MessagesElement(plainMessage, author, false, id, timeSent, []))
  }

  lastMessageId(): number {
    return this.messages[this.messages.length-1].id;
  }
}

@Injectable()
export class MessagesListService implements MessagesListServiceInterface {

  constructor (
    private conversationPermissions: ConversationPermissionsService,
    private devices: DevicesService,
    private messageEncoder: MessageEncoderService,
    private restApi: RestApiService,
    private users: UsersService,
  ) {
  }

  items: (MessagesElement|SeparatorElement)[] = []
  messages: MessagesElement[] = []
  private conversationId: string;
  private replies = new Map<number, Reply[]>();
  private pendingRepliesForMessageId: number[] = [];

  lastMessageId(): number {
    return this.messages.length == 0
      ? 0
      : this.messages[this.messages.length-1].id
  }

  private clear() {
    this.items.length = 0;
    this.messages.length = 0;
    this.replies.clear();
  }

  conversation(): string {
    return this.conversationId;
  }

  setConversation(conversationId: string): void {
    if (this.conversationId == conversationId) return;

    console.log("Change to conversation", conversationId);

    this.clear();
    this.conversationId = conversationId;

    this.restApi.getMessages(conversationId).subscribe(async messages => {
      for (let message of messages) {
        let conversationKeyId = message.context.conversationKeyId;
        let conversationKeyBundle = await this.conversationPermissions.key(conversationKeyId);

        let device = await this.devices.get(message.context.deviceKeyId);
        if (!device)  {
          console.warn("device not found");
          continue;
        }

        let decoded = await this.messageEncoder.decode(message, device.pubkey, conversationKeyBundle);
        let authorProfile = await this.users.profile(device.ownerId);

        if (!message.context.parentMessageId) {
          this.addOrUpdateTopMessage(decoded, authorProfile, message.id, message.timeSent);
        } else {
          let parentMessageId = message.context.parentMessageId;
          this.addReply(parentMessageId, {
            id: message.id,
            message: decoded,
            author: authorProfile,
          });
        }
      }

      this.integratePendingRepliesIntoList();
    });
  }

  addOrUpdateTopMessage(plainMessage: PlainMessage, author: User, id: number, timeSent: Date): void {
    let updated = this.updateIfPossible(id, { plainMessage: plainMessage, timeSent: timeSent });
    if (updated) return;

    let insertAfterElement: MessagesElement | undefined = undefined;
    let insertAfterIndex: number = -1;
    for (let index = 0; index < this.messages.length; ++index) {
      let element = this.messages[index];
      if (element.id < id) {
        insertAfterElement = element;
        insertAfterIndex = index;
      }
    }

    let isFromPreviousAuthor = (insertAfterElement)
      ? insertAfterElement.author.id == author.id
      : false
    let isSameDayAsPrevious = (insertAfterElement)
      ? insertAfterElement.timeSent.getDate() == timeSent.getDate()
      : false
    let isContinuation = isFromPreviousAuthor && isSameDayAsPrevious
    let newElement = new MessagesElement(plainMessage, author, isContinuation, id, timeSent, []);

    this.messages.splice(insertAfterIndex+1, 0, newElement);

    let followingMessage = this.messages[insertAfterIndex+2];

    let insertAfterIndexInItems: number;
    if (insertAfterElement) {
      let insertAfterElementId = insertAfterElement.id;
      insertAfterIndexInItems = this.items.findIndex((item) => {
        return item instanceof MessagesElement && item.id == insertAfterElementId
      });
      Assert.isTrue(insertAfterIndexInItems >= 0, "id found in messages was not found in items");
    } else {
      insertAfterIndexInItems = -1;
    }

    let newMessageIndexInItems: number
    if (!isSameDayAsPrevious) {
      this.items.splice(insertAfterIndexInItems+1, 0,
        new SeparatorElement(timeSent),
        newElement
      );
      newMessageIndexInItems = insertAfterIndexInItems + 2;
    } else {
      this.items.splice(insertAfterIndexInItems+1, 0,
        newElement
      );
      newMessageIndexInItems = insertAfterIndexInItems + 1;
    }

    if (followingMessage) {
      let isSameDayAsFollowing = timeSent.getDate() == followingMessage.timeSent.getDate();
      let isSameAuthorAsFollowing = author.id == followingMessage.author.id;

      if (isSameDayAsFollowing) {
        let followingIndex = newMessageIndexInItems+1
        if (this.items[followingIndex] instanceof SeparatorElement) {
          this.items.splice(followingIndex, 1);
        }
      }

      let followingMessageIsContinuation = isSameAuthorAsFollowing && isSameDayAsFollowing;

      let followingIndexInMessages = this.messages.findIndex(m => m.id == followingMessage.id);
      let followingIndexInItems = this.items.findIndex(i => (i instanceof MessagesElement && i.id == followingMessage.id));
      this.messages[followingIndexInMessages].isContinuation = followingMessageIsContinuation;
      (this.items[followingIndexInItems] as MessagesElement).isContinuation = followingMessageIsContinuation;
    }
  }

  addReply(parentMessageId: number, reply: Reply) {
    if (!this.replies.has(parentMessageId)) this.replies.set(parentMessageId, new Array<Reply>());
    let repliesForMessage = this.replies.get(parentMessageId)!
    let sortRequired = (repliesForMessage.length > 0 && repliesForMessage[repliesForMessage.length-1].id > reply.id);
    repliesForMessage.push(reply);
    if (sortRequired) repliesForMessage.sort((reply1, reply2) => reply1.id - reply2.id);
    let updated = this.updateIfPossible(parentMessageId, { replies: repliesForMessage });
    if (!updated) {
      this.pendingRepliesForMessageId.push(parentMessageId);
    }
  }

  private updateIfPossible(id: number, job: UpdateJob): boolean {
    let indexInMessages = this.messages.findIndex((message) => message.id == id)
    if (indexInMessages != -1) {
      if (job.plainMessage) this.messages[indexInMessages].message = job.plainMessage;
      if (job.timeSent) this.messages[indexInMessages].timeSent = job.timeSent;
      if (job.replies) this.messages[indexInMessages].replies = job.replies;

      let indexInItems = this.items.findIndex((item) => {
        return item instanceof MessagesElement && item.id == id
      });
      if (job.plainMessage) (this.items[indexInItems] as MessagesElement).message = job.plainMessage;
      if (job.timeSent) (this.items[indexInItems] as MessagesElement).timeSent = job.timeSent;
      if (job.replies) (this.items[indexInItems] as MessagesElement).replies = job.replies;

      return true;
    } else {
      return false;
    }
  }

  private integratePendingRepliesIntoList() {
    let index = this.pendingRepliesForMessageId.length;
    while (index--) {
      let messageId = this.pendingRepliesForMessageId[index];
      let allRepliesForThisMessage = this.replies.get(messageId)!
      let updated = this.updateIfPossible(messageId, { replies: allRepliesForThisMessage });
      if (updated) {
        // remove element
        this.pendingRepliesForMessageId.splice(index, 1);
      } else {
        // retry later
      }
    }
  }
}
