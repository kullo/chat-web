/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Component, OnInit, NgZone, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CurrentDeviceService } from '../../current-device';
import * as simplescroll from 'simple-scrollbar';

import { ReceiverService } from '../messages/receiver.service';
import { ServerCommunicationService } from '../socket/server-communication.service';
import { BlobService } from '../messages/blob.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MessagesListService } from '../conversation/messages-list/messages-list.service';
import { MessageEncoderService } from '../messages/message-encoder.service';
import { DevicesService } from '../devices/devices.service';
import { ConversationsService } from '../conversations/conversations.service';
import { ConversationPermissionsService } from '../conversations/conversation-permissions.service';
import { SenderService } from '../messages/sender.service';
import { EncryptionKeypairRotatorService } from '../users/encryption-keypair-rotator.service';
import { UsersService } from '../users/users.service';
import { UserSettingsService } from '../users/user-settings.service';
import { AuthorizationErrorWhenGettingWebsocketUrl, ConnectedEvent } from '../socket/websocket-event';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.less'],
  // Provide services in component scope to ensure those are destroyed
  // when leaving the chat part of the app.
  //
  // For some reason, limiting the lifetime of services does not work
  // in module scrope as described in the docs:
  // "When you navigate away from the route, the injector is destroyed.
  // This means that services declared in a route module will have a
  // lifetime equal to that of the route."
  // See https://github.com/angular/angular/issues/21531
  providers: [
    BlobService,
    ConversationPermissionsService,
    ConversationsService,
    DevicesService,
    EncryptionKeypairRotatorService,
    MessageEncoderService,
    MessagesListService,
    NotificationsService,
    ReceiverService,
    ServerCommunicationService,
    SenderService,
    UsersService,
    UserSettingsService,
  ],
  host: {
    '(window:resize)': 'onWindowResized($event)',
  },
})
export class ChatComponent implements OnInit, OnDestroy {

  @ViewChild('leftSidebar') private leftSidebar: ElementRef;

  private subscriptions = new Array<Subscription>();
  private scrollBar: any

  constructor(
    private conversations: ConversationsService,
    private currentDevice: CurrentDeviceService,
    private receiver: ReceiverService, // inject only, not used directly
    private router: Router,
    private server: ServerCommunicationService,
    private ngZone: NgZone,
  ) { }

  ngOnInit() {
    this.ngZone.runOutsideAngular(() => {
      this.scrollBar = simplescroll.init(this.leftSidebar.nativeElement, {
        color: "rgba(255, 255, 255, 0.2)",
      });
    });

    this.server.connection.then(connection => {
      this.subscriptions.push(
        connection
          .filter(event => event.type == ConnectedEvent.type)
          .subscribe(connectedEvent => {
            // connection (re-)established. Conversations may have changed in the meantime
            this.conversations.reload();
          })
        );

      this.subscriptions.push(
        connection
          .filter(event => event.type == AuthorizationErrorWhenGettingWebsocketUrl.type)
          .subscribe(errorEvent => {
            this.currentDevice.device()
              .then(() => {
                // no auth, device exists => pending activation or user blocked/deleted
                this.router.navigate(['/login', 'activation_pending']);
              })
              .catch(() => {
                // no auth, no device => login or registration
                this.router.navigate(['/login']);
              });
          })
        );
    });

    this.server.connect();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  onWindowResized(event: any) {
    this.ngZone.runOutsideAngular(() => {
      this.scrollBar.update();
    });
  }

  onLogoutRequested() {
    console.log("Logout time!");
    this.router.navigate(['/login', 'logout']);
  }
}
