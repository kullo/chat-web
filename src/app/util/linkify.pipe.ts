/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Pipe, PipeTransform } from '@angular/core';
import * as linkifyString from 'linkifyjs/string';

@Pipe({
  name: 'linkify',
})
export class LinkifyPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return value
      ? linkifyString(value, {target: '_system'})
      : value;
  }

}
