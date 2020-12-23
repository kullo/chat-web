/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectionStatusIndicatorComponent } from './connection-status-indicator.component';
import { ServerCommunicationService, FakeServerCommunicationService } from '../server-communication.service';

describe('ConnectionStatusIndicatorComponent', () => {
  let component: ConnectionStatusIndicatorComponent;
  let fixture: ComponentFixture<ConnectionStatusIndicatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConnectionStatusIndicatorComponent ],
      providers: [
        { provide: ServerCommunicationService, useClass: FakeServerCommunicationService },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectionStatusIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
