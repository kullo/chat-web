/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { TestBed } from '@angular/core/testing';

import { ServerAttachment } from './server-attachment';

describe('Attachment', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [],
    });
  });

  it('should create', () => {
    let author = new ServerAttachment("974g9734g5gt3", "http://localhost:8000/blobs/974g9734g5gt3");
    expect(author).toBeTruthy();
  });

  it('should create from json', () => {
    let json = {
      id: "974g9734g5gt3",
      uploadUrl: "http://localhost:8000/blobs/974g9734g5gt3",
    }
    let uut = new ServerAttachment("974g9734g5gt3", "http://localhost:8000/blobs/974g9734g5gt3");
    expect(uut).toBeTruthy();
    expect(uut.id).toEqual("974g9734g5gt3");
    expect(uut.uploadUrl).toEqual("http://localhost:8000/blobs/974g9734g5gt3");
  });
});
