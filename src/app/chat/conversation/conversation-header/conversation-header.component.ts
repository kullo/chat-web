/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-conversation-header',
  templateUrl: './conversation-header.component.html',
  styleUrls: ['./conversation-header.component.less']
})
export class ConversationHeaderComponent implements OnInit {

  @Input()
  title: string

  @Input()
  participantsCount: number

  constructor(
  ) { }

  ngOnInit() {
  }
}
