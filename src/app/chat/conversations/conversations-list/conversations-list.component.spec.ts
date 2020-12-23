/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CurrentDeviceService, FakeCurrentDeviceService } from '../../../current-device';

import { ConversationsService, FakeConversationsService } from '../../conversations/conversations.service';

import { ConversationsListComponent } from './conversations-list.component';

describe('ConversationsListComponent', () => {
  let component: ConversationsListComponent;
  let fixture: ComponentFixture<ConversationsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
      ],
      declarations: [
        ConversationsListComponent,
      ],
      providers: [
        { provide: ConversationsService, useClass: FakeConversationsService },
        { provide: CurrentDeviceService, useClass: FakeCurrentDeviceService },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConversationsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
