/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CurrentDeviceService, FakeCurrentDeviceService } from '../../current-device';
import { RestApiService, FakeRestApiService } from '../../server-types';
import { UtilModule } from '../../util';

import { MessagesListService, FakeMessagesListService } from '../conversation/messages-list/messages-list.service';
import { ConversationsListComponent } from '../conversations/conversations-list/conversations-list.component';
import { ConversationComponent } from '../conversation/conversation/conversation.component';
import { ConversationHeaderComponent } from '../conversation/conversation-header/conversation-header.component';
import { MessageComponent, ThumbnailDirective } from '../conversation/messages-list/message/message.component';
import { InputBarComponent } from '../conversation/input-bar/input-bar.component';
import { SeparatorComponent } from '../conversation/messages-list/separator/separator.component';
import { ConversationPermissionsService, FakeConversationPermissionsService } from '../conversations/conversation-permissions.service';
import { ConversationsService, FakeConversationsService } from '../conversations/conversations.service';
import { FakeDevicesService, DevicesService } from '../devices/devices.service';
import { SenderService, FakeSenderService } from '../messages/sender.service';
import { BlobService, FakeBlobService } from '../messages/blob.service';
import { MessageEncoderService, FakeMessageEncoderService } from '../messages/message-encoder.service';
import { ReceiverService, FakeReceiverService } from '../messages/receiver.service';
import { ConnectionStatusIndicatorComponent } from '../socket/connection-status-indicator/connection-status-indicator.component';
import { ServerCommunicationService, FakeServerCommunicationService } from '../socket/server-communication.service';
import { CurrentUserBlockComponent } from '../users/current-user-block/current-user-block.component';
import { UserPictureComponent } from '../users/user-picture/user-picture.component';
import { UsersService, FakeUsersService } from '../users/users.service';
import { UserSettingsService, FakeUserSettingsService } from '../users/user-settings.service';

import { ChatComponent } from './chat.component';

describe('ChatComponent', () => {
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        UtilModule,
      ],
      declarations: [
        ChatComponent,
        ConnectionStatusIndicatorComponent,
        ConversationComponent,
        ConversationsListComponent,
        CurrentUserBlockComponent,
        ConversationComponent,
        ConversationHeaderComponent,
        MessageComponent,
        InputBarComponent,
        SeparatorComponent,
        ThumbnailDirective,
        UserPictureComponent,
      ],
      providers: [
        { provide: ConversationsService, useClass: FakeConversationsService },
        { provide: CurrentDeviceService, useClass: FakeCurrentDeviceService },
        { provide: ServerCommunicationService, useClass: FakeServerCommunicationService },
      ]
    })
    .overrideComponent(ChatComponent, {
      set: {
        providers: [
          { provide: BlobService, useClass: FakeBlobService },
          { provide: ConversationPermissionsService, useClass: FakeConversationPermissionsService },
          { provide: ConversationsService, useClass: FakeConversationsService },
          { provide: CurrentDeviceService, useClass: FakeCurrentDeviceService },
          { provide: DevicesService, useClass: FakeDevicesService },
          { provide: MessageEncoderService, useClass: FakeMessageEncoderService },
          { provide: MessagesListService, useClass: FakeMessagesListService },
          { provide: ServerCommunicationService, useClass: FakeServerCommunicationService },
          { provide: ReceiverService, useClass: FakeReceiverService },
          { provide: RestApiService, useClass: FakeRestApiService },
          { provide: SenderService, useClass: FakeSenderService },
          { provide: UsersService, useClass: FakeUsersService },
          { provide: UserSettingsService, useClass: FakeUserSettingsService },
        ]
      }
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
