/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CryptoService } from '../../crypto';
import { CurrentDeviceService, FakeCurrentDeviceService } from '../../current-device';
import { RestApiService, FakeRestApiService, PermissionPackerService, FakePermissionPackerService } from '../../server-types';

import { UsersComponent } from './users.component';

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsersComponent ],
      providers: [
        CryptoService,
        { provide: CurrentDeviceService, useClass: FakeCurrentDeviceService },
        { provide: PermissionPackerService, useClass: FakePermissionPackerService },
        { provide: RestApiService, useClass: FakeRestApiService },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
