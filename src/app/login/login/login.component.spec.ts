/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { CryptoService } from '../../crypto';

import { HeavyCryptoService } from '../heavy-crypto.service';
import { CurrentDeviceService, FakeCurrentDeviceService, DeviceGeneratorService, FakeDeviceGeneratorService, DevicePublisherService, FakeDevicePublisherService } from '../../current-device';
import { LoginRequestsService, FakeLoginRequestsService } from '../login-requests.service';
import { ProgressBarComponent } from '../progress-bar/progress-bar.component';

import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        FormsModule,
      ],
      declarations: [
        LoginComponent,
        ProgressBarComponent,
      ],
      providers: [
        CryptoService,
        HeavyCryptoService,
        { provide: DeviceGeneratorService, useClass: FakeDeviceGeneratorService },
        { provide: DevicePublisherService, useClass: FakeDevicePublisherService },
        { provide: CurrentDeviceService, useClass: FakeCurrentDeviceService },
        { provide: LoginRequestsService, useClass: FakeLoginRequestsService },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
