/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { TestBed, inject } from '@angular/core/testing';
import { CryptoService } from '../../crypto';
import { CurrentDeviceService, FakeCurrentDeviceService } from '../../current-device';
import { RestApiService, FakeRestApiService } from '../../server-types';

import { ConversationPermissionsService, FakeConversationPermissionsService } from '../conversations/conversation-permissions.service';
import { ServerCommunicationService, FakeServerCommunicationService } from '../socket/server-communication.service';
import { UsersService, FakeUsersService } from '../users/users.service';

import { ConversationsService } from './conversations.service';

describe('ConversationsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ConversationsService,
        CryptoService,
        { provide: CurrentDeviceService, useClass: FakeCurrentDeviceService },
        { provide: ConversationPermissionsService, useClass: FakeConversationPermissionsService },
        { provide: UsersService, useClass: FakeUsersService },
        { provide: RestApiService, useClass: FakeRestApiService },
        { provide: ServerCommunicationService, useClass: FakeServerCommunicationService },
      ]
    });
  });

  it('should be created', inject([ConversationsService], (service: ConversationsService) => {
    expect(service).toBeTruthy();
  }));
});
