/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Subject } from 'rxjs';

import { WebsocketEvent, WebsocketRequest, ConnectedEvent, DisconnectedEvent } from './websocket-event';

export class WebsocketConnection extends Subject<WebsocketEvent> {

  private readonly socket: WebSocket;

  constructor(url: string) {
    super();
    this.socket = new WebSocket(url);

    this.socket.onmessage = (event: MessageEvent) => {
      let incomingJson = JSON.parse(event.data)
      //console.log("From socket:", incomingJson)
      this.next(WebsocketEvent.fromJson(incomingJson));
    }

    this.socket.onerror = (error: Event) => {
      this.error(error)
    };

    this.socket.onclose = (event: CloseEvent) => {
      this.next(new DisconnectedEvent());
      //observer.complete();
    }

    this.socket.onopen = () => {
      this.next(new ConnectedEvent());
    };
  }

  sendRequest(request: WebsocketRequest): boolean {
    if (this.socket.readyState === WebSocket.OPEN) {
      console.log("Sending to socket:", request);
      this.socket.send(JSON.stringify(request.toJson()));
      return true;
    } else {
      return false;
    }
  }

  close() {
    this.socket.close();
  }
}
