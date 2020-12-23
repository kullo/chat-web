/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { CurrentDeviceService, FakeCurrentDeviceService } from '../../../current-device';

import { ConversationsService, FakeConversationsService } from '../conversations.service';

import { AvailableConversationsComponent } from './available-conversations.component';

describe('AvailableConversationsComponent', () => {
  let component: AvailableConversationsComponent;
  let fixture: ComponentFixture<AvailableConversationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        RouterTestingModule,
      ],
      declarations: [ AvailableConversationsComponent ],
      providers: [
        { provide: CurrentDeviceService, useClass: FakeCurrentDeviceService },
        { provide: ConversationsService, useClass: FakeConversationsService },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AvailableConversationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
