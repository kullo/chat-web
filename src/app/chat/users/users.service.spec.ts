/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { TestBed, async, inject } from '@angular/core/testing';
import { RestApiService, FakeRestApiService } from '../../server-types';

import { ServerCommunicationService, FakeServerCommunicationService } from '../socket/server-communication.service';

import { UsersService } from './users.service';

describe('UsersService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UsersService,
        { provide: RestApiService, useClass: FakeRestApiService },
        { provide: ServerCommunicationService, useClass: FakeServerCommunicationService },
      ]
    });
  });

  it('should be created', inject([UsersService], (service: UsersService) => {
    expect(service).toBeTruthy();
  }));

  it('return stable profile', async(inject([UsersService], async (service: UsersService) => {
    let profile1 = await service.profile(1);
    let profile2 = await service.profile(1);
    expect(profile1).toBeTruthy();
    expect(profile2).toBeTruthy();

    expect(profile1.name).toEqual(profile2.name);
    expect(profile1.picture).toEqual(profile2.picture);
  })));
});
