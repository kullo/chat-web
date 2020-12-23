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

@Component({
  selector: 'app-redirector',
  template: '',
  styles: ['']
})
export class RedirectorComponent implements OnInit, OnDestroy {

  private subscriptions = new Array<Subscription>();

  constructor(
    private conversations: ConversationsService,
    private currentDevice: CurrentDeviceService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.subscriptions.push(this.conversations.items.subscribe(async result => {
      let currentUserId = (await this.currentDevice.device()).ownerId;

      let bestConversation = result.conversations
        .filter(c => c.type == "channel")
        .filter(c => c.participantIds.includes(currentUserId))
        [0];
      if (!bestConversation) {
        bestConversation = result.conversations
          .filter(c => c.type == "group")
          .filter(c => c.participantIds.includes(currentUserId))
          [0];
      }

      if (bestConversation) {
        this.router.navigate([bestConversation.id], { relativeTo: this.route });
      }
    }));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
