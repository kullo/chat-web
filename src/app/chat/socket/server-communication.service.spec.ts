/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { TestBed, inject } from '@angular/core/testing';
import { RestApiService, FakeRestApiService } from '../../server-types';

import { ServerCommunicationService } from './server-communication.service';

describe('ServerCommunicationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ServerCommunicationService,
        { provide: RestApiService, useClass: FakeRestApiService },
      ]
    });
  });

  it('should be created', inject([ServerCommunicationService], (service: ServerCommunicationService) => {
    expect(service).toBeTruthy();
  }));
});
