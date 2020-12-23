/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { CryptoService, EncryptedSymmetricKey, Ed25519Signature, SignatureBundle } from '../../crypto';
import { CurrentDeviceService } from '../../current-device';
import { User, RestApiService, ConversationKeyId, ConversationsWithPermissions, ServerConversation, ServerPermission } from '../../server-types';
import { Encoding, Dates, Assert } from '../../util';

import { ConversationPermissionsService } from '../conversations/conversation-permissions.service';
import { UsersService } from '../users/users.service';
import { ServerCommunicationService } from '../socket/server-communication.service';

interface ConversationsServiceInterface {
  items: BehaviorSubject<ConversationsWithPermissions>;
  reload(): Promise<void>;
  conversationTitle(conversation: ServerConversation): Promise<string>;
  groupConversationTitle(conversation: ServerConversation): Promise<string>;
}

export class FakeConversationsService implements ConversationsServiceInterface {
  // in this class, current user (permission owner) is 4444
  items = new BehaviorSubject<ConversationsWithPermissions>({
    conversations: [
      new ServerConversation("123", "channel", "Marketing", [1, 2, 4444]),
      new ServerConversation("124", "channel", "Off topic", []),
      new ServerConversation("42", "group", "", []),
    ],
    permissions: [
      new ServerPermission(
        "123",
        new ConversationKeyId("aabbccdd"),
        new EncryptedSymmetricKey(Encoding.fromHex("5c99b1c83ccb51fc7c917625ddc13da4898ca0588ee69b62ae50752994aacd65727ed9576524871304f0bb9d5738f0fcbd1043cfe97ae2cfe123daa5e759bbd54502fe2cf83abce073c0287a9a313241")),
        4444, 33,
        "2018-01-01 00:00:00Z",
        new SignatureBundle("aabbccdd", new Ed25519Signature(Encoding.fromHex("00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"))),
      ),
      new ServerPermission(
        "124",
        new ConversationKeyId("eeddeeddeeddeedd"),
        new EncryptedSymmetricKey(Encoding.fromHex("5c99b1c83ccb51fc7c917625ddc13da4898ca0588ee69b62ae50752994aacd65727ed9576524871304f0bb9d5738f0fcbd1043cfe97ae2cfe123daa5e759bbd54502fe2cf83abce073c0287a9a313241")),
        4444, 33,
        "2018-01-01 00:00:00Z",
        new SignatureBundle("aabbccdd", new Ed25519Signature(Encoding.fromHex("00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"))),
      ),
      // after key rotation: two permissions for the same conversation and owner
      new ServerPermission(
        "42",
        new ConversationKeyId("961e57c49ac08a897349d862ccc3f2f2"),
        new EncryptedSymmetricKey(Encoding.fromHex("5c99b1c83ccb51fc7c917625ddc13da4898ca0588ee69b62ae50752994aacd65727ed9576524871304f0bb9d5738f0fcbd1043cfe97ae2cfe123daa5e759bbd54502fe2cf83abce073c0287a9a313241")),
        4444, 100,
        "2018-01-01 00:00:00Z",
        new SignatureBundle("aabbccdd", new Ed25519Signature(Encoding.fromHex("00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"))),
      ),
      new ServerPermission(
        "42",
        new ConversationKeyId("ef0a99b55a599f09e4f8663ee15864ac"),
        new EncryptedSymmetricKey(Encoding.fromHex("5c99b1c83ccb51fc7c917625ddc13da4898ca0588ee69b62ae50752994aacd65727ed9576524871304f0bb9d5738f0fcbd1043cfe97ae2cfe123daa5e759bbd54502fe2cf83abce073c0287a9a313241")),
        4444, 100,
        "2018-02-01 00:00:00Z",
        new SignatureBundle("aabbccdd", new Ed25519Signature(Encoding.fromHex("00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"))),
      ),
    ]
  });
  reload(): Promise<void> { return Promise.resolve() }
  conversationTitle(conversation: ServerConversation): Promise<string> { return Promise.resolve("") }
  groupConversationTitle(conversation: ServerConversation): Promise<string> { return Promise.resolve("") }
}

@Injectable()
export class ConversationsService implements ConversationsServiceInterface, OnDestroy {

  items = new BehaviorSubject<ConversationsWithPermissions>({
    conversations: [], permissions: []
  });

  private subscriptions = new Array<Subscription>();

  constructor(
    private crypto: CryptoService,
    private currentDevice: CurrentDeviceService,
    private permissions: ConversationPermissionsService,
    private restApi: RestApiService,
    private users: UsersService,
    private server: ServerCommunicationService,
  ) {
    this.server.connection.then(connection => {
      this.subscriptions.push(
        connection
          .filter(event => {
            return event.type == '_conversation.updated'
              || event.type == 'conversation.updated'
              || event.type == 'conversation.added'
          })
          .map(event => ServerConversation.fromJson(event.data))
          .subscribe(conversation => this.addOrUpdate(conversation))
      );
    });

    this.subscriptions.push(
      this.items.subscribe(conversationsWithPermissions => {
        this.permissions.fillCaches(conversationsWithPermissions.permissions);
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  async reload(): Promise<void> {
    let conversations = await this.restApi.getConversations();
    this.items.next(conversations);
    return;
  }

  async addChannel(title: string) {
    let currentUserId = (await this.currentDevice.device()).ownerId
    let allUsers = await this.restApi.getUsers();
    let activeUsers = allUsers.filter(u => u.state == "active");

    let conversationId = await this.crypto.generateRandomId();

    let permissions = await this.permissions.make(conversationId, allUsers);

    let participantIds = activeUsers.map(u => u.id);

    await this.restApi.createConversation(
      conversationId, "channel", title, participantIds, permissions);

    this.addOrUpdate(
      new ServerConversation(conversationId, "channel", title, participantIds),
      permissions);
  }

  async addGroupChat(participants: User[]) {
    let conversationId = await this.crypto.generateRandomId();
    let permissions = await this.permissions.make(conversationId, participants);
    let participantIds = participants.map(u => u.id);

    await this.restApi.createConversation(
      conversationId, "group", "", participantIds, permissions);

    this.addOrUpdate(
      new ServerConversation(conversationId, "group", "", participantIds),
      permissions);
  }

  async joinLeaveConversation(action: "join" | "leave", conversationId: number): Promise<void> {
    return this.server.joinLeaveConversation(action, conversationId);
  }

  async joined(conversation: ServerConversation | string): Promise<boolean> {
    let currentUserId = (await this.currentDevice.device()).ownerId;

    if (typeof conversation === "string") {
      let searchResult = this.items.value.conversations.find((c) => c.id == conversation);
      if (!searchResult) throw new Error("Conversation not found");
      conversation = searchResult;
    }

    return conversation.participantIds.findIndex((id) => id == currentUserId) != -1;
  }

  async conversationTitle(conversation: ServerConversation): Promise<string> {
    if (conversation.type == "group") {
      return this.groupConversationTitle(conversation);
    } else {
      return conversation.title;
    }
  }

  async groupConversationTitle(conversation: ServerConversation): Promise<string> {
    let currentUserId = (await this.currentDevice.device()).ownerId;
    let listedUserIds = conversation.participantIds.filter(userId => userId != currentUserId);
    let listedTitles: string[] = []
    for (let userId of listedUserIds) {
      let user = await this.users.profile(userId);
      listedTitles.push(user.name);
    }
    return listedTitles.join(", ");
  }

  private addOrUpdate(newConversation: ServerConversation, relatedPermissions?: ServerPermission[]) {
    Assert.isSet(newConversation, "newConversation must be set");

    if (!relatedPermissions) {
      relatedPermissions = []
    }

    let data = this.items.value;

    let indexToUpdate = data.conversations.findIndex(item => item.id == newConversation.id);
    if (indexToUpdate != -1) {
      data.conversations[indexToUpdate].update(newConversation);
    } else {
      data.conversations.push(newConversation);
    }

    for (let relatedPermission of relatedPermissions) {
      data.permissions.push(relatedPermission);
    }
    this.items.next(data);
  }

}
