/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { TestBed } from '@angular/core/testing';

import { Dates } from './dates';

describe('Dates', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  describe('parse RFC 3339', () => {
    it('invalid', () => {
      expect(() => Dates.fromRfc3339("")).toThrowError(/invalid/i);
      expect(() => Dates.fromRfc3339("no date")).toThrowError(/invalid/i);

      // seconds precision is required
      expect(() => Dates.fromRfc3339("2017-01-02T03:04Z")).toThrowError(/invalid/i);
      expect(() => Dates.fromRfc3339("2017-01-02T03Z")).toThrowError(/invalid/i);
      expect(() => Dates.fromRfc3339("2017-01-02Z")).toThrowError(/invalid/i);

      // separator not T or space
      expect(() => Dates.fromRfc3339("2017-01-02,03:04:05Z")).toThrowError(/invalid/i);
      expect(() => Dates.fromRfc3339("2017-01-02.03:04:05Z")).toThrowError(/invalid/i);
      expect(() => Dates.fromRfc3339("2017-01-02\t03:04:05Z")).toThrowError(/invalid/i);
      // separator count != 1
      expect(() => Dates.fromRfc3339("2017-01-0203:04:05Z")).toThrowError(/invalid/i);
      expect(() => Dates.fromRfc3339("2017-01-02  03:04:05Z")).toThrowError(/invalid/i);
      expect(() => Dates.fromRfc3339("2017-01-02TT03:04:05Z")).toThrowError(/invalid/i);
      expect(() => Dates.fromRfc3339("2017-01-02T 03:04:05Z")).toThrowError(/invalid/i);
      expect(() => Dates.fromRfc3339("2017-01-02 T03:04:05Z")).toThrowError(/invalid/i);

      // short components
      expect(() => Dates.fromRfc3339("17-01-02T03:04:05.678Z")).toThrowError(/invalid/i);
      expect(() => Dates.fromRfc3339("2017-1-02T03:04:05.678Z")).toThrowError(/invalid/i);
      expect(() => Dates.fromRfc3339("2017-01-2T03:04:05.678Z")).toThrowError(/invalid/i);
      expect(() => Dates.fromRfc3339("2017-01-02T3:04:05.678Z")).toThrowError(/invalid/i);
      expect(() => Dates.fromRfc3339("2017-01-02T03:4:05.678Z")).toThrowError(/invalid/i);
      expect(() => Dates.fromRfc3339("2017-01-02T03:04:5.678Z")).toThrowError(/invalid/i);
      expect(() => Dates.fromRfc3339("2017-01-02T03:04:05.67Z")).toThrowError(/invalid/i);

      // missing timezone
      expect(() => Dates.fromRfc3339("2017-01-02T03:04:05.678")).toThrowError(/invalid/i);
    });

    it('valid', () => {
      expect(Dates.fromRfc3339("2017-01-02T03:04:05.678Z")).toEqual(
        new Date(Date.UTC(2017, 0, 2, 3, 4, 5, 678)));

      // milliseconds can be skipped
      expect(Dates.fromRfc3339("2017-01-02T03:04:05Z")).toEqual(
        new Date(Date.UTC(2017, 0, 2, 3, 4, 5, 0)));

      // space allowed
      expect(Dates.fromRfc3339("2017-01-02 03:04:05.678Z")).toEqual(
        new Date(Date.UTC(2017, 0, 2, 3, 4, 5, 678)));
    });

    it('valid timezones', () => {
      // Z
      expect(Dates.fromRfc3339("2017-01-02T03:04:05Z")).toEqual(
        new Date(Date.UTC(2017, 0, 2, /* T */ 3, 4, 5)));

      // +/- 00:00 are valid synonyms for UTC
      expect(Dates.fromRfc3339("2017-01-02T03:04:05-00:00")).toEqual(
        new Date(Date.UTC(2017, 0, 2, /* T */ 3, 4, 5)));
      expect(Dates.fromRfc3339("2017-01-02T03:04:05-00:00")).toEqual(
        new Date(Date.UTC(2017, 0, 2, /* T */ 3, 4, 5)));

      // plus something
      expect(Dates.fromRfc3339("2017-01-02T03:04:05+01:00")).toEqual(
        new Date(Date.UTC(2017, 0, 2, /* T */ 2, 4, 5)));
      expect(Dates.fromRfc3339("2017-01-02T03:04:05+00:01")).toEqual(
        new Date(Date.UTC(2017, 0, 2, /* T */ 3, 3, 5)));
      expect(Dates.fromRfc3339("2017-01-02T03:04:05+01:01")).toEqual(
        new Date(Date.UTC(2017, 0, 2, /* T */ 2, 3, 5)));

      // minus something
      expect(Dates.fromRfc3339("2017-01-02T03:04:05-01:00")).toEqual(
        new Date(Date.UTC(2017, 0, 2, /* T */ 4, 4, 5)));
      expect(Dates.fromRfc3339("2017-01-02T03:04:05-00:01")).toEqual(
        new Date(Date.UTC(2017, 0, 2, /* T */ 3, 5, 5)));
      expect(Dates.fromRfc3339("2017-01-02T03:04:05-01:01")).toEqual(
        new Date(Date.UTC(2017, 0, 2, /* T */ 4, 5, 5)));
    });
  });

});
