/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { TestBed, inject } from '@angular/core/testing';
import { CryptoService } from '../../crypto';
import { CurrentDeviceService, FakeCurrentDeviceService } from '../../current-device';

import { ConversationPermissionsService, FakeConversationPermissionsService } from '../conversations/conversation-permissions.service';
import { BlobService, FakeBlobService } from '../messages/blob.service';
import { MessageEncoderService, FakeMessageEncoderService } from '../messages/message-encoder.service';
import { ServerCommunicationService, FakeServerCommunicationService } from '../socket/server-communication.service';

import { SenderService } from './sender.service';

describe('SenderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CryptoService,
        SenderService,
        { provide: BlobService, useClass: FakeBlobService },
        { provide: ConversationPermissionsService, useClass: FakeConversationPermissionsService },
        { provide: CurrentDeviceService, useClass: FakeCurrentDeviceService },
        { provide: MessageEncoderService, useClass: FakeMessageEncoderService },
        { provide: ServerCommunicationService, useClass: FakeServerCommunicationService },
      ]
    });
  });

  it('should be created', inject([SenderService], (service: SenderService) => {
    expect(service).toBeTruthy();
  }));
});
