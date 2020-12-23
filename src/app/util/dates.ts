/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
export class ParsingError extends Error {
}

export class Dates {
  private static RFC3339_MATCHER
    = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\.(\d{3}))?([+-]\d{2}:\d{2}|Z)$/;
  private static TIMEZONE_MATCHER
    = /^([+-])(\d{2}):(\d{2})$/;

  static fromRfc3339(input: string): Date {
    let match = Dates.RFC3339_MATCHER.exec(input);
    if (!match) {
      throw new ParsingError("Invalid date string: '" + input + "'");
    }

    let year   = +match[1];
    let month  = +match[2];
    let day    = +match[3];
    let hour   = +match[4];
    let minute = +match[5];
    let second = +match[6];
    let msec   = match[7] ? +match[7] : 0;
    let tz     = match[8];

    if (tz == "Z") {
      return new Date(Date.UTC(year, month - 1, day, hour, minute, second, msec));
    } else {
      let tzMatch = Dates.TIMEZONE_MATCHER.exec(tz);
      if (!tzMatch) {
        throw new ParsingError("Invalid timezone string: '" + tz + "'");
      }
      let tzSign = tzMatch[1] == "+" ? +1 : -1;
      let tzHour = +tzMatch[2];
      let tzMin  = +tzMatch[3];
      let tzOffsetInMinutes = tzSign * (tzHour * 60 + tzMin);

      let out = new Date(Date.UTC(year, month - 1, day, hour, minute, second, msec));
      out.setTime(out.getTime() - tzOffsetInMinutes * 60 * 1000);
      return out;
    }
  }

  static toRfc3339Utc(d: Date): string {
    function pad(n: number) { return n<10 ? '0'+n : n }
    return d.getUTCFullYear() + '-'
      + pad(d.getUTCMonth()+1) + '-'
      + pad(d.getUTCDate()) + 'T'
      + pad(d.getUTCHours()) + ':'
      + pad(d.getUTCMinutes()) + ':'
      + pad(d.getUTCSeconds()) + 'Z'
  }
}
