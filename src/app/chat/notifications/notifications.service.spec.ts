/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { TestBed, inject } from '@angular/core/testing';

import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NotificationsService]
    });
  });

  it('should be created', inject([NotificationsService], (service: NotificationsService) => {
    expect(service).toBeTruthy();
  }));

  it('can notify', inject([NotificationsService], (service: NotificationsService) => {
    let notification = service.notify("Something happened", "please see");
    expect(notification).toBeTruthy();
    expect(notification.title).toEqual("Something happened");
    expect(notification.body).toEqual("please see");
  }));
});
