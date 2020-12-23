/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EncryptionPubkey } from '../../crypto';
import { User, RestApiService } from '../../server-types';
import { Assert, Encoding } from '../../util';

import { ServerCommunicationService } from '../socket/server-communication.service';

interface UsersServiceInterface {
  items: BehaviorSubject<User[]>;
  profile(userId: number): Promise<User | undefined>
  invalidate(userId: number): void;
  reload(): void;
}

export class FakeUsersService implements UsersServiceInterface {
  items = new BehaviorSubject<User[]>([
    new User(1, "active", "Ulf", "https://www.kullo.de/2/images/customer03.jpg",
      new EncryptionPubkey(Encoding.fromHex("f1be61e98abcea057d20a0db106a3cb76052393e620a8b7f627dc4362d974b32")),
    ),
    new User(2, "active", "Ulf", "https://www.kullo.de/2/images/customer03.jpg",
      new EncryptionPubkey(Encoding.fromHex("f1be61e98abcea057d20a0db106a3cb76052393e620a8b7f627dc4362d974b32")),
    ),
  ]);
  profile(userId: number): Promise<User | undefined> {
    // pub f1be61e98abcea057d20a0db106a3cb76052393e620a8b7f627dc4362d974b32
    // priv 0db5c65173609e7f08e5316a0f369602249561c908b9337bbfee35277a020b20
    let out = new User(userId, "active", "Ulf", "https://www.kullo.de/2/images/customer03.jpg",
      new EncryptionPubkey(Encoding.fromHex("f1be61e98abcea057d20a0db106a3cb76052393e620a8b7f627dc4362d974b32")),
    );
    return Promise.resolve(out);
  }
  invalidate(userId: number): void {
    return;
  }
  reload(): void {
  }
}

@Injectable()
export class UsersService implements UsersServiceInterface {

  items = new BehaviorSubject<User[]>([]);
  private cache = new Map<number, User>();

  constructor(
    private restApi: RestApiService,
    private server: ServerCommunicationService,
  ) {
  }

  async profile(userId: number): Promise<User> {
    Assert.isSet(userId);

    if (!this.cache.has(userId)) {
      let user = await this.server.getUser(userId);
      this.addToCache(user);
    }

    return this.cache.get(userId)!;
  }

  invalidate(userId: number): void {
    this.cache.delete(userId);
  }

  reload() {
    this.restApi.getUsers().then(users => {
      for (let user of users) {
        this.addToCache(user);
      }
      this.items.next(users);
    });
  }

  private addToCache(user: User): void {
    this.cache.set(user.id, user);
  }
}
