/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-input-bar',
  templateUrl: './input-bar.component.html',
  styleUrls: ['./input-bar.component.less']
})
export class InputBarComponent implements OnInit {

  @Output()
  textSubmitted: EventEmitter<string> = new EventEmitter<string>()

  constructor() { }

  ngOnInit() {
  }

  onSubmit(textInput: any) {
    let trimmedText:string = textInput.value.trim()
    if (trimmedText.length != 0) {
      this.textSubmitted.emit(trimmedText)
      textInput.value = ''
    }
  }
}
