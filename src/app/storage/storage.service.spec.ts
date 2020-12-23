/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { TestBed, inject } from '@angular/core/testing';

import { StorageService } from './storage.service';

describe('StorageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StorageService]
    });
  });

  it('should be created', inject([StorageService], (service: StorageService) => {
    expect(service).toBeTruthy();
  }));

  it('should be able to store and retrieve strings', inject([StorageService], (service: StorageService) => {
    let testData = "abc";
    let testDataEmpty = "";

    // store
    expect(service.setString("StorageServiceSpec", "test_s", testData)).toBeUndefined();
    expect(service.setString("StorageServiceSpec", "test_s_empty", testDataEmpty)).toBeUndefined();

    // retrieve
    expect(service.getString("StorageServiceSpec", "test_s")).toEqual(testData);
    expect(service.getString("StorageServiceSpec", "test_s_empty")).toEqual(testDataEmpty);
    expect(service.getString("StorageServiceSpec", "test_s_unset")).toBeUndefined();
  }));

  it('should be able to store and retrieve binary', inject([StorageService], (service: StorageService) => {
    let testData = new Uint8Array([0x44, 0x55, 0x66, 0x77, 0x88, 0x99]);
    let testDataEmpty = new Uint8Array([]);

    // store
    expect(service.setBinary("StorageServiceSpec", "test", testData)).toBeUndefined();
    expect(service.setBinary("StorageServiceSpec", "test_empty", testDataEmpty)).toBeUndefined();

    // retrieve
    expect(service.getBinary("StorageServiceSpec", "test")).toEqual(testData);
    expect(service.getBinary("StorageServiceSpec", "test_empty")).toEqual(testDataEmpty);
    expect(service.getBinary("StorageServiceSpec", "test_unset")).toBeUndefined();
  }));
});
