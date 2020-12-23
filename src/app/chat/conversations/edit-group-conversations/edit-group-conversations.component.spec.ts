/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CurrentDeviceService, FakeCurrentDeviceService } from '../../../current-device';

import { ConversationsService, FakeConversationsService } from '../../conversations/conversations.service';
import { UserPictureComponent } from '../../users/user-picture/user-picture.component';
import { UsersService, FakeUsersService } from '../../users/users.service';

import { EditGroupConversationsComponent } from './edit-group-conversations.component';

describe('EditGroupConversationsComponent', () => {
  let component: EditGroupConversationsComponent;
  let fixture: ComponentFixture<EditGroupConversationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        EditGroupConversationsComponent,
        UserPictureComponent,
      ],
      providers: [
        { provide: ConversationsService, useClass: FakeConversationsService },
        { provide: CurrentDeviceService, useClass: FakeCurrentDeviceService },
        { provide: UsersService, useClass: FakeUsersService },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditGroupConversationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
