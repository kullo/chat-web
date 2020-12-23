/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { EncryptionPubkey } from '../../crypto';
import { ServerDevice } from '../../current-device';
import { Context, ConversationKeyId, OutgoingMessage, RestApiService, ServerPermission, User } from '../../server-types';
import { Assert, Encoding } from '../../util';

import { ServerAttachment } from '../socket/server-attachment';
import { WebsocketReconnectingConnection } from '../socket/websocket-reconnecting-connection';
import { WebsocketEvent, AddMessageRequest, WebsocketRequest } from '../socket/websocket-event';

interface ServerCommunicationServiceInterface {
  connection: Promise<Observable<WebsocketEvent>>;
  connect(): void
  getUser(id: number): Promise<User>
  getConversationPermission(conversationKeyId: ConversationKeyId): Promise<ServerPermission>
  send(outMessage: OutgoingMessage): Promise<void>
  joinLeaveConversation(action: "join" | "leave", conversationId: number): Promise<void>
}

export class FakeServerCommunicationService implements ServerCommunicationServiceInterface {
  connection = Promise.resolve(new ReplaySubject<WebsocketEvent>())
  connect() {}
  getUser(id: number): Promise<User> {
    let out = new User(id, "active", "Ulf", "https://www.kullo.de/2/images/customer03.jpg", new EncryptionPubkey(Encoding.fromBase64("AAAA")));
    return Promise.resolve(out);
  }
  getConversationPermission(conversationKeyId: ConversationKeyId): Promise<ServerPermission> {
    return Promise.reject("not implemented");
  }
  send(outMessage: OutgoingMessage): Promise<void> {
    return Promise.resolve();
  }
  joinLeaveConversation(action: "join" | "leave", conversationId: number): Promise<void> {
    return Promise.reject("conversation not found");
  }
}

@Injectable()
export class ServerCommunicationService implements ServerCommunicationServiceInterface, OnDestroy {

  connection: Promise<WebsocketReconnectingConnection>;
  private lastRequestId: number = 0;

  constructor(
    private restApi: RestApiService,
  ) {
    this.connection = this.makeWebsocketConnection(restApi)
  }

  ngOnDestroy() {
    console.log("Destroying ServerCommunicationService");
    this.connection.then(connection => connection.shutDown());
  }

  connect() {
    this.connection
      .then(reconnectingConnection => reconnectingConnection.connect())
      .catch(error => console.log("Connection failed"))
  }

  async getDevice(id: string): Promise<ServerDevice | undefined> {
    let requestId = this.makeRequestId();
    let request = new WebsocketRequest("device.get", requestId, { "id": id });
    let response = await this.request(request);
    if (response.error()) return undefined;
    return ServerDevice.fromJson(response.data);
  }

  async joinLeaveConversation(action: "join" | "leave", conversationId: number): Promise<void> {
    let requestId = this.makeRequestId();
    let request = new WebsocketRequest("conversation." + action, requestId, { "id": conversationId });
    let response = await this.request(request);
    if (response.error()) return Promise.reject("Error loining/leaving conversation");

    let event = new WebsocketEvent("_conversation.updated", response.data);
    (await this.connection).next(event);
  }

  async getConversationPermission(conversationKeyId: ConversationKeyId): Promise<ServerPermission> {
    let requestId = this.makeRequestId();
    let request = new WebsocketRequest("conversation_permission.get", requestId, {
      "conversationKeyId": conversationKeyId.data
    });
    let response = await this.request(request);
    if (response.error()) return Promise.reject("Error getting permission: " + response.error());
    return ServerPermission.fromJson(response.data);
  }

  async getUser(id: number): Promise<User> {
    let requestId = this.makeRequestId();
    let request = new WebsocketRequest("user.get", requestId, { "id": id });
    let response = await this.request(request);
    if (response.error()) return Promise.reject("Error getting user: " + response.error());
    return User.fromJson(response.data);
  }

  async getAttachmentUploadUrls(count: number): Promise<ServerAttachment[]> {
    Assert.isSet(count, "count must be set");
    let requestId = this.makeRequestId();
    let request = new WebsocketRequest("attachments.add", requestId, { count: count });
    let response = await this.request(request);
    if (response.error()) return Promise.reject("Error getting upload URLs: " + response.error());
    return response.data.map((object: any) => ServerAttachment.fromJson(object));
  }

  async send(outMessage: OutgoingMessage): Promise<void> {
    let request = new AddMessageRequest(outMessage, this.makeRequestId());
    let response = await this.request(request);

    if (response.error()) {
      return Promise.reject(response.error());
    }

    Assert.isSet(response.data, "Response event must have `data`");

    let event = new WebsocketEvent("_message.added", response.data);
    (await this.connection).next(event);
  }

  private async request(request: WebsocketRequest): Promise<WebsocketEvent> {
    let pendingResponse = (await this.connection)
      .filter(event => event.type == "response" && event.meta.requestId == request.id)
      .first()
      .toPromise();
    (await this.connection).sendRequest(request);
    return pendingResponse;
  }

  private async makeWebsocketConnection(restApi: RestApiService): Promise<WebsocketReconnectingConnection> {
    let connection = new WebsocketReconnectingConnection();
    connection.urlCallback = () => {
      // Do not use `this` to avoid retain cycle of ServerCommunicationService
      return restApi.makeWebsocketUrl()
    };
    return connection;
  }

  private makeRequestId(): number {
    return this.lastRequestId += 1
  }
}
