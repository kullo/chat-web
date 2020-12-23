/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CurrentDeviceService } from '../../current-device';
import { IncomingMessage } from '../../server-types';

import { MessagesListService } from '../conversation/messages-list/messages-list.service';
import { ConversationPermissionsService } from '../conversations/conversation-permissions.service';
import { ConversationsService } from '../conversations/conversations.service';
import { DevicesService } from '../devices/devices.service';
import { MessageEncoderService } from '../messages/message-encoder.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ServerCommunicationService } from '../socket/server-communication.service';
import { UsersService } from '../users/users.service';

interface ReceiverServiceInterface {
}

export class FakeReceiverService implements ReceiverServiceInterface {
}

@Injectable()
export class ReceiverService implements ReceiverServiceInterface, OnDestroy {

  private subscriptions = new Array<Subscription>();

  constructor(
    private conversationPermissions: ConversationPermissionsService,
    private conversations: ConversationsService,
    private currentDevice: CurrentDeviceService,
    private devices: DevicesService,
    private messageEncoder: MessageEncoderService,
    private messagesList: MessagesListService,
    private notifications: NotificationsService,
    private server: ServerCommunicationService,
    private users: UsersService,
  ) {
    this.server.connection
      .then(connection => {
        this.subscriptions.push(connection
          .filter(event => event.type == "message.added" || event.type == "_message.added")
          .filter(event => !event.error())
          .subscribe(async event => {
            console.log("Message event:", event)

            let serverMessage = IncomingMessage.fromJson(event.data)
            //console.log("Got socket message:", serverMessage);
            let conversationKeyId = serverMessage.context.conversationKeyId;
            let conversationId = await this.conversationPermissions.id(conversationKeyId);
            let conversationKey = await this.conversationPermissions.key(conversationKeyId);

            let device = await this.devices.get(serverMessage.context.deviceKeyId);
            if (!device) {
              console.warn("device not found")
              return;
            }

            let decoded = await this.messageEncoder.decode(serverMessage, device.pubkey, conversationKey);

            let sentByCurrentUser = (device.ownerId == (await this.currentDevice.device()).ownerId);
            let joinedChannel = await this.conversations.joined(conversationId);

            if (!sentByCurrentUser && joinedChannel) {
              // TODO: translate
              this.notifications.notifyWhenHidden("New message", decoded.content);
            }

            if (conversationId == this.messagesList.conversation()) {
              let authorProfile = await this.users.profile(device.ownerId);
              if (!authorProfile) {
                console.warn("Could not show message because author is missing");
                return;
              }

              if (!serverMessage.context.parentMessageId) {
                this.messagesList.addOrUpdateTopMessage(decoded, authorProfile, serverMessage.id, serverMessage.timeSent);
              } else {
                this.messagesList.addReply(serverMessage.context.parentMessageId, {
                  id: serverMessage.id,
                  message: decoded,
                  author: authorProfile,
                });
              }
            }
          })
        );
      })
      .catch(error => {
        console.log("Error when resolving ServerCommunicationService connection:", error);
      })
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
