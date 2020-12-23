/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { CryptoService } from '../crypto';
import { CurrentDeviceService, FakeCurrentDeviceService } from '../current-device';

import { RestApiService } from './rest-api.service';

describe('RestApiService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
      ],
      providers: [
        CryptoService,
        RestApiService,
        { provide: CurrentDeviceService, useClass: FakeCurrentDeviceService },
      ]
    });
  });

  it('should be created', inject([RestApiService], (service: RestApiService) => {
    expect(service).toBeTruthy();
  }));
});
