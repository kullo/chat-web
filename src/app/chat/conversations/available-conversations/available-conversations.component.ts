/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { CurrentDeviceService } from '../../../current-device';

import { ConversationsService } from '../conversations.service';

class AvailableConversation {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly joined: boolean,
  ) {}
}

@Component({
  selector: 'app-available-conversations',
  templateUrl: './available-conversations.component.html',
  styleUrls: ['./available-conversations.component.less']
})
export class AvailableConversationsComponent implements OnInit, OnDestroy {

  private subscriptions = new Array<Subscription>();

  availableChannels: AvailableConversation[]

  constructor(
    private currentDevice: CurrentDeviceService,
    private conversations: ConversationsService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.subscriptions.push(
      this.conversations.items.subscribe(async data => {
        let me = (await this.currentDevice.device()).ownerId;

        let out = new Array<AvailableConversation>();
        for (let conversation of data.conversations.filter(c => c.type == "channel")) {
          let permission = data.permissions.find(p => p.conversationId == conversation.id && p.ownerId == me)
          if (permission) {
            let title = await this.conversations.conversationTitle(conversation);
            let joined = conversation.participantIds.findIndex((id) => id == me) != -1;
            out.push(new AvailableConversation(conversation.id, title, joined));
          }
        }
        this.availableChannels = out;
      })
    );
  }

  join(conversationId: number): void {
    this.conversations.joinLeaveConversation("join", conversationId).then(() => {
      this.router.navigate(["..", conversationId], { relativeTo: this.route });
    });
  }

  leave(conversationId: number): void {
    this.conversations.joinLeaveConversation("leave", conversationId);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  onSubmit(textInput: any) {
    let title: string = textInput.value.trim();
    if (title.length != 0) {
      textInput.value = '';
      console.log("Create channel " + title);
      this.conversations.addChannel(title);
    }
  }
}
