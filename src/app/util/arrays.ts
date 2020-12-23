/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
export class Arrays {

  static sum<T>(input: Array<T>, where: (element: T) => boolean) {
    return input.reduce((count, nextElement: T) => {
      if (where(nextElement)) return count + 1;
      else return count;
    }, 0);
  }

  static shuffled<T>(input: Array<T>): Array<T> {
    let out = input.slice(0); // copy
    for (let i = out.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  static remove<T>(array: T[], element: T): boolean {
    const index = array.indexOf(element);
    if (index !== -1) {
      array.splice(index, 1);
      return true;
    } else {
      return false;
    }
  }

}
