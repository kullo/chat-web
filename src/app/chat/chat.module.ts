/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { NgModule } from '@angular/core';

import { ChatRoutingModule } from './chat-routing.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UtilModule } from '../util';

import { ChatComponent } from './chat/chat.component';
import { InputBarComponent } from './conversation/input-bar/input-bar.component';
import { ConversationComponent } from './conversation/conversation/conversation.component';
import { ConversationHeaderComponent } from './conversation/conversation-header/conversation-header.component';
import { MessageComponent, ThumbnailDirective } from './conversation/messages-list/message/message.component';
import { SeparatorComponent } from './conversation/messages-list/separator/separator.component';
import { ConversationsListComponent } from './conversations/conversations-list/conversations-list.component';
import { AvailableConversationsComponent } from './conversations/available-conversations/available-conversations.component';
import { EditGroupConversationsComponent } from './conversations/edit-group-conversations/edit-group-conversations.component';
import { RedirectorComponent } from './conversations/redirector/redirector.component';
import { ConnectionStatusIndicatorComponent } from './socket/connection-status-indicator/connection-status-indicator.component';
import { CurrentUserBlockComponent } from './users/current-user-block/current-user-block.component';
import { UserPictureComponent } from './users/user-picture/user-picture.component';

@NgModule({
  declarations: [
    AvailableConversationsComponent,
    ChatComponent,
    ConnectionStatusIndicatorComponent,
    CurrentUserBlockComponent,
    EditGroupConversationsComponent,
    InputBarComponent,
    MessageComponent,
    ConversationComponent,
    ConversationHeaderComponent,
    SeparatorComponent,
    ConversationsListComponent,
    RedirectorComponent,
    ThumbnailDirective,
    UserPictureComponent,
  ],
  imports: [
    ChatRoutingModule,
    CommonModule,
    FormsModule,
    UtilModule,
  ],
})
export class ChatModule { }
