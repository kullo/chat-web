/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
export class Assert {
  static isSet(value: any, message?: string) {
    if (value === null || value === undefined) {
      throw TypeError(message || "Value must not be null or undefined.");
    }
  }

  static isDefined(value: any, message?: string) {
    if (value === undefined) {
      throw TypeError(message || "Value must not be undefined.");
    }
  }

  static isTrue(value: boolean, message?: string) {
    if (value !== true) {
      throw TypeError(message || "Value must be true.");
    }
  }

  static isTruthy(value: any, message?: string) {
    if (!value) {
      throw TypeError(message || "Value must be truthy.");
    }
  }

  static isFalsy(value: any, message?: string) {
    if (value) {
      throw TypeError(message || "Value must be falsy.");
    }
  }

  static isEqual(value1: number | string, value2: number | string, message?: string) {
    if (value1 !== value2) {
      throw TypeError(message || "Values must be equal: " + value1 + " vs. " + value2);
    }
  }

  static isEven(value: number) {
    if (value%2 != 0) {
      throw TypeError("Value must be even.");
    }
  }

  static isDivisible(value: number, by: number) {
    if (value%by != 0) {
      throw TypeError("Value must be divisible by " + by + ".");
    }
  }

  static isOfType(value: any, type: Object): void {
    if (type == "number") {
      if (typeof value !== type) {
        throw TypeError("Value must be of type " + type + ".");
      }
      return
    }

    if (type == "string") {
      if (typeof value !== type) {
        throw TypeError("Value must be of type " + type + ".");
      }
      return
    }

    if (type == "boolean") {
      if (typeof value !== type) {
        throw TypeError("Value must be of type " + type + ".");
      }
      return
    }

    if (!(value instanceof (type as any))) {
      throw TypeError("Value must be of type " + type + ".");
    }
  }
}
