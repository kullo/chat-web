/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-separator',
  templateUrl: './separator.component.html',
  styleUrls: ['./separator.component.less']
})
export class SeparatorComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  @Input()
  date: Date

  formattedDate(): string {
    if (this.date) {
      let dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
      return this.date.toLocaleDateString('de-DE', dateOptions);
    } else {
      return "";
    }
  }

  today(): boolean {
    if (this.date) {
      return this.date.getDate() == (new Date()).getDate()
    } else {
      return false;
    }
  }

}
