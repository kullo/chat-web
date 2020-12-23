/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Subject, Subscription } from 'rxjs/Rx';
import { Arrays, Assert } from "../../util";

import { WebsocketEvent, WebsocketRequest, DisconnectedEvent, ConnectedEvent, AuthorizationErrorWhenGettingWebsocketUrl, ConnectingEvent } from '../socket/websocket-event'
import { WebsocketConnection } from "../socket/websocket-connection";

interface Shutdownable {
  // Call this from a lifecycle hook. Instance must not be used afterwards
  shutDown(): void
}

export class WebsocketReconnectingConnection extends Subject<WebsocketEvent> implements Shutdownable {

  urlCallback: () => Promise<string>

  constructor() {
    super();
  }

  private timeoutIds = new Array<any>();
  private currentConnectionSubscription: Subscription | undefined;
  private currentConnection: WebsocketConnection | undefined;

  private requestQueue: WebsocketRequest[] = [];

  connect() {
    this.reconnect();
  }

  shutDown() {
    console.log("Stutting down WebsocketReconnectingConnection …");

    this.timeoutIds.forEach(id => clearTimeout(id));

    if (this.currentConnectionSubscription) {
      console.log("Unsubscribing from current connection …");
      this.currentConnectionSubscription.unsubscribe();
    }

    if (this.currentConnection) {
      console.log("Closing current connection …");
      this.currentConnection.close();
    }
  }

  sendRequest(request: WebsocketRequest) {
    this.requestQueue.push(request);
    this.tryProcessingRequestsFromQueue();
  }

  private clearCurrentConnection() {
    if (this.currentConnectionSubscription) this.currentConnectionSubscription.unsubscribe();

    this.currentConnectionSubscription = undefined;
    this.currentConnection = undefined;
  }

  private tryProcessingRequestsFromQueue(): void {
    console.log("Queue:", this.requestQueue);
    let request: WebsocketRequest | undefined
    while (this.currentConnection && (request = this.requestQueue.shift())) {
      console.log("Taking request from queue:", request.id);
      let ok = this.currentConnection.sendRequest(request);
      if (!ok) {
        // Sending was not ok: add latest request back to queue and return
        // in order to be able to pick up work as soon as new connection is established.
        this.requestQueue.unshift(request);
        return;
      }
    }
  }

  private async reconnect() {
    Assert.isSet(this.urlCallback, "urlCallback must be set");

    this.next(new ConnectingEvent());

    let url = await this.urlCallback().catch(error => {
      if (error.status === 401) {
        console.log("Authorization error when getting websocket url");
        this.next(new AuthorizationErrorWhenGettingWebsocketUrl());
      } else {
        console.log("Unknown error when getting websocket url:", error);
      }
      return undefined;
    });

    if (!url) {
      this.clearCurrentConnection();

      const retryTimeSeconds = 3;
      console.log(`Retry getting websocket URL in ${retryTimeSeconds} seconds.`);
      this.timeoutIds.push(setTimeout(() => this.reconnect(), retryTimeSeconds * 1000));
      return;
    }

    console.log("Got websocket url", url);

    let connection = new WebsocketConnection(url);

    let connectionSubscription = connection.subscribe(
      event => {
        if (event.type == ConnectedEvent.type) {
          this.next(new ConnectedEvent());
          this.tryProcessingRequestsFromQueue();
        } else if (event.type == DisconnectedEvent.type) {
          this.clearCurrentConnection();
          this.next(new DisconnectedEvent());
          this.timeoutIds.push(setTimeout(() => { this.reconnect() }, 3000));
        } else {
          this.next(event);
        }
      },
      error => {
        console.log("Error in WebsocketConnection")
        this.clearCurrentConnection();
        this.timeoutIds.push(setTimeout(() => { this.reconnect() }, 3000));
      },
      () => {
        console.log("WebsocketConnection ended successfully")
      }
    );

    this.currentConnection = connection;
    this.currentConnectionSubscription = connectionSubscription;
  }
}
