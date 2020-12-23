/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Injectable } from '@angular/core';

@Injectable()
export class NotificationsService {

  grantedState: NotificationPermission = "denied";

  constructor() {
    this.grantedState = (Notification as any).permission; // Notification.permission missing in definition file

    if (this.grantedState !== "granted") {
      // Use callback interface since Safari does not support the Promise interface
      // https://developer.mozilla.org/de/docs/Web/API/Notification/requestPermission
      Notification.requestPermission(permission => {
        this.grantedState = permission;
      });
    }
  }

  notifyWhenHidden(title: string, body: string): Notification | undefined {
    if (document.hidden) {
      return this.notify(title, body);
    } else {
      return undefined;
    }
  }

  notify(title: string, body: string): Notification {
    return new Notification(title, { body: body });
  }
}
