/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { CryptoService } from '../../crypto';
import { CurrentDeviceService, FakeCurrentDeviceService } from '../../current-device';
import { RestApiService, FakeRestApiService } from '../../server-types';

import { ActivationPendingComponent } from './activation-pending.component';

describe('ActivationPendingComponent', () => {
  let component: ActivationPendingComponent;
  let fixture: ComponentFixture<ActivationPendingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivationPendingComponent ],
      providers: [
        CryptoService,
        { provide: CurrentDeviceService, useClass: FakeCurrentDeviceService },
        { provide: RestApiService, useClass: FakeRestApiService },
        { provide: ActivatedRoute, useValue: { 'params': Observable.from([{}]) } },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate')} },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivationPendingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
