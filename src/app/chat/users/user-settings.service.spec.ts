/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { TestBed, inject } from '@angular/core/testing';
import { CurrentDeviceService, FakeCurrentDeviceService } from '../../current-device';
import { RestApiService, FakeRestApiService } from '../../server-types';

import { BlobService, FakeBlobService } from '../messages/blob.service';
import { ServerCommunicationService, FakeServerCommunicationService } from '../socket/server-communication.service';
import { UsersService, FakeUsersService } from '../users/users.service';

import { UserSettingsService } from './user-settings.service';

describe('UserSettingsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserSettingsService,
        { provide: BlobService, useClass: FakeBlobService },
        { provide: CurrentDeviceService, useClass: FakeCurrentDeviceService },
        { provide: RestApiService, useClass: FakeRestApiService },
        { provide: ServerCommunicationService, useClass: FakeServerCommunicationService },
        { provide: UsersService, useClass: FakeUsersService },
      ],
    });
  });

  it('should be created', inject([UserSettingsService], (service: UserSettingsService) => {
    expect(service).toBeTruthy();
  }));
});
