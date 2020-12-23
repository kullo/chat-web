/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { TestBed } from '@angular/core/testing';

import { Assert } from './assert';

describe('Assert', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('can isSet', () => {
    expect(() => { Assert.isSet(1)});
    expect(() => { Assert.isSet(0)});
    expect(() => { Assert.isSet("ab")});
    expect(() => { Assert.isSet("")});
    expect(() => { Assert.isSet(new Number(33))});
    expect(() => { Assert.isSet(new Number(0))});

    expect(() => { Assert.isSet(undefined)}).toThrow();
    expect(() => { Assert.isSet(null)}).toThrow();
  });

  it('can isOfType', () => {
    Assert.isOfType(1, "number");
    Assert.isOfType(0, "number");
    Assert.isOfType("ab", "string");
    Assert.isOfType("", "string");
    Assert.isOfType(true, "boolean");
    Assert.isOfType(false, "boolean");

    Assert.isOfType(new String("ab"), String);
    Assert.isOfType(new String(""), String);
    Assert.isOfType(new Number(33), Number);
    Assert.isOfType(new Number(0), Number);
    Assert.isOfType(new Boolean(true), Boolean);
    Assert.isOfType(new Boolean(false), Boolean);

    expect(() => { Assert.isOfType(true, Boolean)}).toThrow();
    expect(() => { Assert.isOfType("ab", String)}).toThrow();
    expect(() => { Assert.isOfType(1234, Number)}).toThrow();

    expect(() => { Assert.isOfType(undefined, "string")}).toThrow();
    expect(() => { Assert.isOfType(null, "string")}).toThrow();
    expect(() => { Assert.isOfType(undefined, "number")}).toThrow();
    expect(() => { Assert.isOfType(null, "number")}).toThrow();
    expect(() => { Assert.isOfType(undefined, "boolean")}).toThrow();
    expect(() => { Assert.isOfType(null, "boolean")}).toThrow();
    expect(() => { Assert.isOfType(new Number(33), String)}).toThrow();
    expect(() => { Assert.isOfType(new Number(33), Boolean)}).toThrow();
  });
});
