/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { UtilModule } from '../../../util';

import { ConversationHeaderComponent } from '../../conversation/conversation-header/conversation-header.component';
import { InputBarComponent } from '../../conversation/input-bar/input-bar.component';
import { ConversationsService, FakeConversationsService } from '../../conversations/conversations.service';
import { BlobService, FakeBlobService } from '../../messages/blob.service';
import { SenderService, FakeSenderService } from '../../messages/sender.service';
import { MessageComponent, ThumbnailDirective } from '../../conversation/messages-list/message/message.component';
import { MessagesListService, FakeMessagesListService } from '../../conversation/messages-list/messages-list.service';
import { SeparatorComponent } from '../../conversation/messages-list/separator/separator.component';
import { UserPictureComponent } from '../../users/user-picture/user-picture.component';

import { ConversationComponent } from './conversation.component';

describe('ConversationComponent', () => {
  let component: ConversationComponent;
  let fixture: ComponentFixture<ConversationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        UtilModule,
      ],
      declarations: [
        ConversationComponent,
        ConversationHeaderComponent,
        InputBarComponent,
        MessageComponent,
        SeparatorComponent,
        ThumbnailDirective,
        UserPictureComponent,
      ],
      providers: [
        { provide: BlobService, useClass: FakeBlobService }, // for ThumbnailDirective
        { provide: ConversationsService, useClass: FakeConversationsService },
        { provide: MessagesListService, useClass: FakeMessagesListService },
        { provide: SenderService, useClass: FakeSenderService },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConversationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
