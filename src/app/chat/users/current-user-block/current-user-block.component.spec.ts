/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CurrentDeviceService, FakeCurrentDeviceService } from '../../../current-device';

import { ConnectionStatusIndicatorComponent } from '../../socket/connection-status-indicator/connection-status-indicator.component';
import { ServerCommunicationService, FakeServerCommunicationService } from '../../socket/server-communication.service';
import { UserPictureComponent } from '../../users/user-picture/user-picture.component';
import { UsersService, FakeUsersService } from '../../users/users.service';
import { UserSettingsService, FakeUserSettingsService } from '../../users/user-settings.service';

import { CurrentUserBlockComponent } from './current-user-block.component';

describe('CurrentUserBlockComponent', () => {
  let component: CurrentUserBlockComponent;
  let fixture: ComponentFixture<CurrentUserBlockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
      ],
      declarations: [
        ConnectionStatusIndicatorComponent,
        CurrentUserBlockComponent,
        UserPictureComponent,
      ],
      providers: [
        { provide: CurrentDeviceService, useClass: FakeCurrentDeviceService },
        { provide: UsersService, useClass: FakeUsersService },
        { provide: ServerCommunicationService, useClass: FakeServerCommunicationService },
        { provide: UserSettingsService, useClass: FakeUserSettingsService },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentUserBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
