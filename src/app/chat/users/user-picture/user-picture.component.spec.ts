/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPictureComponent } from './user-picture.component';

describe('UserPictureComponent', () => {
  let component: UserPictureComponent;
  let fixture: ComponentFixture<UserPictureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserPictureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserPictureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
