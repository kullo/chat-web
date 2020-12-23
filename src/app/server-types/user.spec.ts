/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { TestBed } from '@angular/core/testing';
import { EncryptionPubkey } from '../crypto';
import { Encoding } from '../util';

import { User } from './user';

describe('User', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [],
    });
  });

  it('should create', () => {
    let author = new User(1, "active", "Some One", "", new EncryptionPubkey(Encoding.fromBase64("AAAA")));
    expect(author).toBeTruthy();
  });

  it('should export to json', () => {
    let author = new User(
      1,
      "active",
      "Otto",
      "https://www.kullo.de/2/images/customer02.jpg",
      new EncryptionPubkey(Encoding.fromBase64("AAAA")),
    );
    let expectedJson = {
      id: 1,
      state: "active",
      name: "Otto",
      picture: "https://www.kullo.de/2/images/customer02.jpg",
      encryptionPubkey: "AAAA",
    }
    expect(author.toJson()).toEqual(expectedJson)
  });

  it('should create from json', () => {
    {
      let json = {
        id: 22,
        state: "pending",
        name: "Otto",
        picture: "https://www.kullo.de/2/images/customer02.jpg",
        encryptionPubkey: "AAAABBBB",
      }
      let author = User.fromJson(json)
      expect(author).toBeTruthy();
      expect(author.id).toEqual(22);
      expect(author.state).toEqual("pending");
      expect(author.name).toEqual("Otto");
      expect(author.picture).toEqual("https://www.kullo.de/2/images/customer02.jpg");
      expect(author.encryptionPubkey.data).toEqual(Encoding.fromBase64("AAAABBBB"));
    }

    { // null picture
      let json = {
        id: 22,
        state: "pending",
        name: "Otto",
        picture: null,
        encryptionPubkey: "AAAABBBB",
      }
      let author = User.fromJson(json);
      expect(author).toBeTruthy();
      expect(author.picture).toBeNull();
    }

    { // unset picture
      let json = {
        id: 22,
        state: "pending",
        name: "Otto",
        encryptionPubkey: "AAAABBBB",
      }
      let author = User.fromJson(json);
      expect(author).toBeTruthy();
      expect(author.picture).toBeNull();
    }
  });
});
