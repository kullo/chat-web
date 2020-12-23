/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CurrentDeviceService } from '../../../current-device';
import { ServerConversation } from '../../../server-types';

import { ConversationsService } from '../../conversations/conversations.service';
import { ServerCommunicationService } from '../../socket/server-communication.service';

class ConversationMenuEntry {
  constructor(
    public id: string,
    public title: string,
  ) { }
}

@Component({
  selector: 'app-conversations-list',
  templateUrl: './conversations-list.component.html',
  styleUrls: ['./conversations-list.component.less']
})
export class ConversationsListComponent implements OnInit, OnDestroy {

  channels: ConversationMenuEntry[] = []
  groups: ConversationMenuEntry[] = []

  private subscriptions = new Array<Subscription>();

  constructor(
    private conversations: ConversationsService,
    private currentDevice: CurrentDeviceService,
  ) { }

  ngOnInit() {
    this.subscriptions.push(this.conversations.items.subscribe(async result => {
      let currentUserId = (await this.currentDevice.device()).ownerId;

      this.channels.length = 0;
      this.groups.length = 0;

      function currentUserIsParticipant(conv: ServerConversation): boolean {
        return conv.participantIds.findIndex(id => id == currentUserId) != -1;
      }

      for (let conv of result.conversations.filter(conv => conv.type == "channel" && currentUserIsParticipant(conv))) {
        this.channels.push(new ConversationMenuEntry(conv.id, conv.title))
      }
      for (let conv of result.conversations.filter(conv => conv.type == "group" && currentUserIsParticipant(conv))) {
        this.groups.push(new ConversationMenuEntry(conv.id, await this.conversations.groupConversationTitle(conv)));
      }
    }));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
