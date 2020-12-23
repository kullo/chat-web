/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ChatComponent } from './chat/chat.component';
import { ConversationComponent } from './conversation/conversation/conversation.component';
import { AvailableConversationsComponent } from './conversations/available-conversations/available-conversations.component';
import { EditGroupConversationsComponent } from './conversations/edit-group-conversations/edit-group-conversations.component';
import { RedirectorComponent } from './conversations/redirector/redirector.component';

const routes: Routes = [
  {
    path: '',
    component: ChatComponent,
    children: [
      { path: '', component: RedirectorComponent },
      { path: 'rooms_edit', component: AvailableConversationsComponent },
      { path: 'persons_edit', component: EditGroupConversationsComponent },
      { path: ':id', component: ConversationComponent },
    ],
  }
];

@NgModule({
  exports: [ RouterModule ],
  imports: [ RouterModule.forChild(routes) ]
})
export class ChatRoutingModule { }
