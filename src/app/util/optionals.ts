/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
export class Optionals {
  static undefinedToNull(value: any): any | null {
    if (value == undefined) return null;
    else return value;
  }
}
