/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { TestBed, inject } from '@angular/core/testing';
import { EncryptionPubkey } from '../../../crypto';
import { CurrentDeviceService, FakeCurrentDeviceService } from '../../../current-device';
import { RestApiService, FakeRestApiService, User } from '../../../server-types';
import { Encoding } from '../../../util';

import { ConversationPermissionsService, FakeConversationPermissionsService } from '../../conversations/conversation-permissions.service';
import { DevicesService, FakeDevicesService } from '../../devices/devices.service';
import { TextPlainMessage } from '../../messages/plain-message';
import { MessageEncoderService, FakeMessageEncoderService } from '../../messages/message-encoder.service';
import { UsersService, FakeUsersService } from '../../users/users.service';

import { MessagesListService, MessagesElement, SeparatorElement } from './messages-list.service';

describe('MessagesListService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MessagesListService,
        { provide: DevicesService, useClass: FakeDevicesService },
        { provide: CurrentDeviceService, useClass: FakeCurrentDeviceService },
        { provide: ConversationPermissionsService, useClass: FakeConversationPermissionsService },
        { provide: MessageEncoderService, useClass: FakeMessageEncoderService },
        { provide: RestApiService, useClass: FakeRestApiService },
        { provide: UsersService, useClass: FakeUsersService },
      ]
    });
  });

  it('should be created', inject([MessagesListService], (service: MessagesListService) => {
    expect(service).toBeTruthy();
  }));

  it('can add', inject([MessagesListService], (service: MessagesListService) => {
    let author = new User(22, "active", "name", "", new EncryptionPubkey(Encoding.fromBase64("AAAA")));
    let msg1 = new TextPlainMessage("lala");
    let msg2 = new TextPlainMessage("lulu");

    expect(service.messages.length).toEqual(0);

    service.addOrUpdateTopMessage(msg1, author, 33, new Date());
    expect(service.messages.length).toEqual(1);

    service.addOrUpdateTopMessage(msg2, author, 34, new Date());
    expect(service.messages.length).toEqual(2);
    expect(service.messages[0].id).toEqual(33);
    expect(service.messages[1].id).toEqual(34);
  }));

  it('can update', inject([MessagesListService], (service: MessagesListService) => {
    let author = new User(22, "active", "name", "", new EncryptionPubkey(Encoding.fromBase64("AAAA")));
    let msg1 = new TextPlainMessage("lala");
    let msg2 = new TextPlainMessage("lulu");

    expect(service.messages.length).toEqual(0);
    service.addOrUpdateTopMessage(msg1, author, 33, new Date());
    expect(service.messages.length).toEqual(1);
    expect(service.messages[0].message.content).toEqual("lala");
    service.addOrUpdateTopMessage(msg2, author, 33, new Date());
    expect(service.messages.length).toEqual(1)
    expect(service.messages[0].message.content).toEqual("lulu");
  }));

  it('can add in order', inject([MessagesListService], (service: MessagesListService) => {
    let author = new User(22, "active", "name", "", new EncryptionPubkey(Encoding.fromBase64("AAAA")));
    let msg1 = new TextPlainMessage("lala");
    let msg2 = new TextPlainMessage("lulu");
    let msg3 = new TextPlainMessage("lili");

    service.addOrUpdateTopMessage(msg1, author, 33, new Date());
    service.addOrUpdateTopMessage(msg2, author, 32, new Date());
    service.addOrUpdateTopMessage(msg3, author, 31, new Date());
    expect(service.messages[0].message.content).toEqual("lili");
    expect(service.messages[1].message.content).toEqual("lulu");
    expect(service.messages[2].message.content).toEqual("lala");
  }));

  it('can add with separator', inject([MessagesListService], (service: MessagesListService) => {
    let author = new User(22, "active", "name", "", new EncryptionPubkey(Encoding.fromBase64("AAAA")));
    let msg1 = new TextPlainMessage("lala");
    let msg2 = new TextPlainMessage("lala"); // same day
    let msg3 = new TextPlainMessage("lulu"); // other day

    expect(service.items.length).toEqual(0);

    service.addOrUpdateTopMessage(msg1, author, 33, new Date(2017, 11, 22, 13, 15));
    expect(service.items.length).toEqual(2);
    expect(service.items[0]).toEqual(jasmine.any(SeparatorElement));
    expect(service.items[1]).toEqual(jasmine.any(MessagesElement));

    service.addOrUpdateTopMessage(msg2, author, 34, new Date(2017, 11, 22, 13, 17));
    expect(service.items.length).toEqual(3);
    expect(service.items[0]).toEqual(jasmine.any(SeparatorElement));
    expect(service.items[1]).toEqual(jasmine.any(MessagesElement));
    expect(service.items[2]).toEqual(jasmine.any(MessagesElement));

    service.addOrUpdateTopMessage(msg3, author, 35, new Date(2017, 11, 23, 11, 11));
    expect(service.items.length).toEqual(5);
    expect(service.items[0]).toEqual(jasmine.any(SeparatorElement));
    expect(service.items[1]).toEqual(jasmine.any(MessagesElement));
    expect(service.items[2]).toEqual(jasmine.any(MessagesElement));
    expect(service.items[3]).toEqual(jasmine.any(SeparatorElement));
    expect(service.items[4]).toEqual(jasmine.any(MessagesElement));
  }));

  it('can add reverse with separator', inject([MessagesListService], (service: MessagesListService) => {
    let author = new User(22, "active", "name", "", new EncryptionPubkey(Encoding.fromBase64("AAAA")));
    let msg1 = new TextPlainMessage("lala");
    let msg2 = new TextPlainMessage("lala"); // same day
    let msg3 = new TextPlainMessage("lulu"); // other day

    expect(service.items.length).toEqual(0);

    service.addOrUpdateTopMessage(msg3, author, 35, new Date(2017, 11, 23, 11, 11));
    expect(service.items.length).toEqual(2);
    expect(service.items[0]).toEqual(jasmine.any(SeparatorElement));
    expect(service.items[1]).toEqual(jasmine.any(MessagesElement));

    service.addOrUpdateTopMessage(msg2, author, 34, new Date(2017, 11, 22, 13, 17));
    expect(service.items.length).toEqual(4);
    expect(service.items[0]).toEqual(jasmine.any(SeparatorElement));
    expect(service.items[1]).toEqual(jasmine.any(MessagesElement));
    expect(service.items[2]).toEqual(jasmine.any(SeparatorElement));
    expect(service.items[3]).toEqual(jasmine.any(MessagesElement));

    service.addOrUpdateTopMessage(msg1, author, 33, new Date(2017, 11, 22, 13, 15));
    expect(service.items.length).toEqual(5);
    expect(service.items[0]).toEqual(jasmine.any(SeparatorElement));
    expect(service.items[1]).toEqual(jasmine.any(MessagesElement));
    expect(service.items[2]).toEqual(jasmine.any(MessagesElement));
    expect(service.items[3]).toEqual(jasmine.any(SeparatorElement));
    expect(service.items[4]).toEqual(jasmine.any(MessagesElement));
  }));

  it('can add with same author', inject([MessagesListService], (service: MessagesListService) => {
    let author = new User(22, "active", "name", "", new EncryptionPubkey(Encoding.fromBase64("AAAA")));
    let msg1 = new TextPlainMessage("lala");
    let msg2 = new TextPlainMessage("lulu");

    service.addOrUpdateTopMessage(msg1, author, 33, new Date());
    service.addOrUpdateTopMessage(msg2, author, 34, new Date());
    expect(service.messages[0].isContinuation).toEqual(false);
    expect(service.messages[1].isContinuation).toEqual(true);
  }));

  it('can add reverse with same author', inject([MessagesListService], (service: MessagesListService) => {
    let author = new User(2, "active", "name", "", new EncryptionPubkey(Encoding.fromBase64("AAAA")));
    let msg1 = new TextPlainMessage("lala");
    let msg2 = new TextPlainMessage("lulu");

    service.addOrUpdateTopMessage(msg2, author, 34, new Date());
    service.addOrUpdateTopMessage(msg1, author, 33, new Date());
    expect(service.messages[0].isContinuation).toEqual(false);
    expect(service.messages[1].isContinuation).toEqual(true);
  }));

  it('can add in between with other author', inject([MessagesListService], (service: MessagesListService) => {
    let author1 = new User(21, "active", "The first author", "", new EncryptionPubkey(Encoding.fromBase64("AAAA")));
    let author2 = new User(22, "active", "The second author", "", new EncryptionPubkey(Encoding.fromBase64("AAAA")));
    let msg1 = new TextPlainMessage("lala");
    let msg2 = new TextPlainMessage("lulu");
    let msg3 = new TextPlainMessage("lulu");

    service.addOrUpdateTopMessage(msg1, author1, 30, new Date());
    service.addOrUpdateTopMessage(msg3, author1, 32, new Date());
    expect(service.messages[0].isContinuation).toEqual(false);
    expect(service.messages[1].isContinuation).toEqual(true);

    service.addOrUpdateTopMessage(msg2, author2, 31, new Date());
    expect(service.messages[0].isContinuation).toEqual(false);
    expect(service.messages[1].isContinuation).toEqual(false);
    expect(service.messages[2].isContinuation).toEqual(false);
  }));

  it('can add with same author, different date', inject([MessagesListService], (service: MessagesListService) => {
    let author = new User(333, "active", "name", "", new EncryptionPubkey(Encoding.fromBase64("AAAA")));
    let msg1 = new TextPlainMessage("lala");
    let msg2 = new TextPlainMessage("lulu");

    service.addOrUpdateTopMessage(msg1, author, 33, new Date(2017, 2, 22, 12, 0, 0));
    service.addOrUpdateTopMessage(msg2, author, 34, new Date(2017, 2, 23, 12, 0, 0));
    expect(service.messages[0].isContinuation).toEqual(false);
    expect(service.messages[1].isContinuation).toEqual(false);
  }));
});
