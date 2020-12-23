/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { TestBed, inject } from '@angular/core/testing';
import { CryptoService } from '../../crypto';

import { ServerCommunicationService, FakeServerCommunicationService } from '../socket/server-communication.service';

import { DevicesService } from './devices.service';

describe('DevicesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CryptoService,
        DevicesService,
        { provide: ServerCommunicationService, useClass: FakeServerCommunicationService },
      ]
    });
  });

  it('should be created', inject([DevicesService], (service: DevicesService) => {
    expect(service).toBeTruthy();
  }));
});
