/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CurrentDeviceService } from '../../../current-device';
import { User } from '../../../server-types';

import { UsersService } from '../../users/users.service';
import { ConversationsService } from '../conversations.service';

@Component({
  selector: 'app-edit-group-conversations',
  templateUrl: './edit-group-conversations.component.html',
  styleUrls: ['./edit-group-conversations.component.less']
})
export class EditGroupConversationsComponent implements OnInit, OnDestroy {

  availableChatPartners: User[] = []

  private selectedUsers: User[] = []
  private subscriptions = new Array<Subscription>();

  constructor(
    private conversations: ConversationsService,
    private currentDevice: CurrentDeviceService,
    private users: UsersService,
  ) { }

  ngOnInit() {
    this.subscriptions.push(
      this.users.items.subscribe(async users => {
        let meId = (await this.currentDevice.device()).ownerId;
        let out = users.filter(u => u.id != meId);
        this.availableChatPartners = out;
      })
    );

    this.users.reload();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  select(user: User) {
    let index = this.selectedUsers.findIndex(u => u.id == user.id);
    if (index != -1) {
      this.selectedUsers.splice(index, 1);
    } else {
      this.selectedUsers.push(user);
    }
  }

  isSelected(user: User): boolean {
    return Boolean(this.selectedUsers.find(u => u.id == user.id));
  }

  async submit(): Promise<void> {
    let participants = this.selectedUsers;
    let meId = (await this.currentDevice.device()).ownerId;
    let me = await this.users.profile(meId);
    participants.push(me);
    await this.conversations.addGroupChat(participants);
    // redirect
    return;
  }
}
