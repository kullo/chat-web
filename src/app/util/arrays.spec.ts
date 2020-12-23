/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { TestBed } from '@angular/core/testing';

import { Arrays } from './arrays';

describe('Arrays', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('can sum', () => {
    {
      let array = [1, 2, 33, 5, 12, 3, 5];
      expect(Arrays.sum(array, e => e < 1)).toEqual(0);
      expect(Arrays.sum(array, e => e < 10)).toEqual(5);
      expect(Arrays.sum(array, e => e < 100)).toEqual(7);
    }
    {
      let array: number[] = [];
      expect(Arrays.sum(array, e => e < 1)).toEqual(0);
      expect(Arrays.sum(array, e => e < 10)).toEqual(0);
      expect(Arrays.sum(array, e => e < 100)).toEqual(0);
    }
  });
});
