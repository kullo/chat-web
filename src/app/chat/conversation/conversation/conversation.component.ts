/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Component, ElementRef, OnInit, ViewChild, NgZone, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import * as simplescroll from 'simple-scrollbar';
import { DropZoneDropped } from '../../../util';

import { MessagesListService, MessagesElement, SeparatorElement } from '../../conversation/messages-list/messages-list.service';
import { ReactionEvent } from '../../conversation/messages-list/message/message.component';
import { ConversationsService } from '../../conversations/conversations.service';
import { SenderService } from '../../messages/sender.service';

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.less']
})
export class ConversationComponent implements OnInit, OnDestroy {

  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  @ViewChild('sendNow') private sendNow: ElementRef;
  @ViewChild('addToMessage') private addToMessage: ElementRef;

  items: (MessagesElement|SeparatorElement)[]
  title: string
  joined: boolean = false
  participantsCount: number
  conversationId: string | undefined

  private subscription = new Array<Subscription>();
  private scrollBar: any

  constructor(
    private conversations: ConversationsService,
    private messagesList: MessagesListService,
    private sender: SenderService,
    private route: ActivatedRoute,
    private router: Router,
    private ngZone: NgZone,
  ) {
    this.items = this.messagesList.items
  }

  ngOnInit() {
    this.ngZone.runOutsideAngular(() => {
      this.scrollBar = simplescroll.init(this.myScrollContainer.nativeElement, {
        scrollInsets: { top: 84 },
        contentAlign: "bottom",
      });
    });

    this.subscription.push(this.conversations.items.subscribe(conversations => {
      this.updateConversationInfos();
    }));

    this.subscription.push(this.route.paramMap.subscribe(params => {
      let id_param = params.get('id');
      if (!id_param) return;

      this.updateConversationInfos(id_param);
    }));
  }

  ngOnDestroy() {
    this.subscription.forEach(subscription => subscription.unsubscribe());
  }

  ngAfterViewChecked() {
    this.ngZone.runOutsideAngular(() => {
      this.scrollBar.update();
      this.scrollBar.scrollToBottom();
    });
  }

  async updateConversationInfos(conversationId?: string) {
    if (!conversationId) {
      if (this.conversationId) {
        conversationId = this.conversationId;
      } else {
        return;
      }
    }

    let conversation = this.conversations.items.value.conversations.find(conv => conv.id == conversationId);
    if (conversation) {
      this.title = await this.conversations.conversationTitle(conversation);
      this.joined = await this.conversations.joined(conversation);
      this.participantsCount = conversation.participantIds.length;
    } else {
      this.title = "";
      this.joined = false;
      this.participantsCount = 0;
    }
    this.messagesList.setConversation(conversationId);
    this.conversationId = conversationId;
  }

  isSeparator(item: any) {
    if (item instanceof SeparatorElement) {
      return true;
    } else {
      return false;
    }
  }

  async onNewMessageSubmitted(event: string) {
    let previousMessageId = this.messagesList.lastMessageId();
    this.sender.sendText(event, this.conversationId!, previousMessageId);
  }

  async onReactionAdded(event: ReactionEvent): Promise<void> {
    console.log("Add reaction", event.content, "to message", event.parentMessageId,
      "after", event.previousMessageId);
    this.sender.sendReaction(event.content, this.conversationId!, event.parentMessageId, event.previousMessageId);
  }

  onFilesDropped(event: DropZoneDropped) {
    if (event.target == this.sendNow.nativeElement) {
      console.log("Send now:", event.files);
      if (event.files.length > 0) {
        this.sender.uploadFilesAndSend(
          event.files,
          this.conversationId!,
          this.messagesList.lastMessageId());
      } else {
        console.warn("Received drop with no files.");
      }
    } else if(event.target == this.addToMessage.nativeElement) {
      console.log("Add files to message:", event.files);
    } else {
      console.log("Ignore drop");
    }
  }
}
