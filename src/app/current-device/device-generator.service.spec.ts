/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { TestBed, inject } from '@angular/core/testing';
import { CryptoService } from '../crypto';

import { DeviceGeneratorService } from './device-generator.service';

describe('DeviceGeneratorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CryptoService,
        DeviceGeneratorService,
      ]
    });
  });

  it('should be created', inject([DeviceGeneratorService], (service: DeviceGeneratorService) => {
    expect(service).toBeTruthy();
  }));

  it('can generate', inject([DeviceGeneratorService], (service: DeviceGeneratorService) => {
    service.generate(22).then(device => {
      expect(device.ownerId).toEqual(22);
      expect(device.pubkey).toBeTruthy();
      expect(device.privkey).toBeTruthy();
      expect(device.idOwnerIdSignature).toBeTruthy();
      expect(device.id).toBeTruthy();
    })
  }));
});
