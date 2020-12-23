/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { TestBed, inject } from '@angular/core/testing';

import { MessagesListService, FakeMessagesListService } from '../conversation/messages-list/messages-list.service';
import { ConversationPermissionsService, FakeConversationPermissionsService } from '../conversations/conversation-permissions.service';
import { ConversationsService, FakeConversationsService } from '../conversations/conversations.service';
import { CurrentDeviceService, FakeCurrentDeviceService } from '../../current-device';
import { DevicesService, FakeDevicesService } from '../devices/devices.service';
import { MessageEncoderService, FakeMessageEncoderService } from '../messages/message-encoder.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ServerCommunicationService, FakeServerCommunicationService } from '../socket/server-communication.service';
import { UsersService, FakeUsersService } from '../users/users.service';

import { ReceiverService } from './receiver.service';

describe('ReceiverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NotificationsService,
        ReceiverService,
        { provide: CurrentDeviceService, useClass: FakeCurrentDeviceService },
        { provide: ConversationPermissionsService, useClass: FakeConversationPermissionsService },
        { provide: ConversationsService, useClass: FakeConversationsService },
        { provide: DevicesService, useClass: FakeDevicesService },
        { provide: MessageEncoderService, useClass: FakeMessageEncoderService },
        { provide: MessagesListService, useClass: FakeMessagesListService },
        { provide: ServerCommunicationService, useClass: FakeServerCommunicationService },
        { provide: UsersService, useClass: FakeUsersService },
      ]
    });
  });

  it('should be created', inject([ReceiverService], (service: ReceiverService) => {
    expect(service).toBeTruthy();
  }));
});
