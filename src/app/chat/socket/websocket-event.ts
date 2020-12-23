/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { OutgoingMessage } from '../../server-types';
import { Assert } from '../../util';

export class WebsocketRequest {
  constructor(
    public type: string,
    public id: number,
    public data: any,
  ) {}

  toJson(): object {
    return {
      type: this.type,
      id: this.id,
      data: this.data,
    }
  }
}

export class AddMessageRequest extends WebsocketRequest {
  constructor(
    outMessage: OutgoingMessage,
    id: number,
  ) {
    super("message.add", id, outMessage.toJson())
  }
}

export class WebsocketEvent {
  constructor(
    public type: string,
    public data: any,
    public meta?: any,
  ) {}

  error(): string | undefined {
    if (this.meta) {
      if (this.meta.error === "") {
        // Convert to non-empty string to allow boolean tests
        // like `if (response.error())`
        return "Server sent an empty error";
      } else if (this.meta.error) {
        return this.meta.error
      } else {
        return undefined;
      }
    } else {
      return undefined
    }
  }

  static fromJson(json: any): WebsocketEvent {
    Assert.isSet(json, "json must be set");

    if (json.meta) {
      return new WebsocketEvent(json.type, json.data, json.meta)
    } else {
      return new WebsocketEvent(json.type, json.data)
    }
  }
}

// Internal fake events

export class ConnectingEvent extends WebsocketEvent {
  public static readonly type: string = "_connecting";

  constructor() {
    super(ConnectingEvent.type, {});
  }
}

export class ConnectedEvent extends WebsocketEvent {
  public static readonly type: string = "_connected";

  constructor() {
    super(ConnectedEvent.type, {});
  }
}

export class DisconnectedEvent extends WebsocketEvent {
  public static readonly type: string = "_disconnected";

  constructor() {
    super(DisconnectedEvent.type, {});
  }
}

export class AuthorizationErrorWhenGettingWebsocketUrl extends WebsocketEvent {
  public static readonly type: string = "_ws_url_error";

  constructor() {
    super(AuthorizationErrorWhenGettingWebsocketUrl.type, {});
  }
}
