/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { CurrentDeviceService, FakeCurrentDeviceService } from '../../../current-device';

import { ConversationsService, FakeConversationsService } from '../conversations.service';

import { RedirectorComponent } from './redirector.component';

describe('RedirectorComponent', () => {
  let component: RedirectorComponent;
  let fixture: ComponentFixture<RedirectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RedirectorComponent ],
      providers: [
        { provide: ConversationsService, useClass: FakeConversationsService },
        { provide: CurrentDeviceService, useClass: FakeCurrentDeviceService },
        { provide: ActivatedRoute, useValue: { 'params': Observable.from([{}]) } },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate')} },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RedirectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
