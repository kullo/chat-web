/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { NgModule } from '@angular/core';
import { DropZoneDirective } from './drop-zone.directive';
import { LinkifyPipe } from './linkify.pipe';

@NgModule({
  imports: [],
  declarations: [
    DropZoneDirective,
    LinkifyPipe,
  ],
  exports: [
    DropZoneDirective,
    LinkifyPipe,
  ],
})
export class UtilModule { }
