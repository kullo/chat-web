/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Component, OnInit, EventEmitter, Output, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { ServerCommunicationService } from '../server-communication.service';
import { DisconnectedEvent, ConnectingEvent, ConnectedEvent } from '../websocket-event';

@Component({
  selector: 'app-connection-status-indicator',
  templateUrl: './connection-status-indicator.component.html',
  styleUrls: ['./connection-status-indicator.component.less']
})
export class ConnectionStatusIndicatorComponent implements OnInit, OnDestroy {

  private subscriptions = new Array<Subscription>();

  @Output()
  logoutRequested: EventEmitter<void> = new EventEmitter<void>()

  isConnected: boolean = false
  isConnecting: boolean = false

  constructor(
    private server: ServerCommunicationService,
  ) {
  }

  ngOnInit() {
    this.server.connection
      .then(connection => {
        this.subscriptions.push(connection.subscribe(event => {
          if (event.type == ConnectedEvent.type) {
            this.isConnected = true;
            this.isConnecting = false;
          } else if (event.type == ConnectingEvent.type) {
            this.isConnected = false;
            this.isConnecting = true;
          } else if (event.type == DisconnectedEvent.type) {
            this.isConnected = false;
            this.isConnecting = false;
          }
        }));
      })
      .catch(error => {
        this.isConnected = false;
        this.isConnecting = false;
      })
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

}
