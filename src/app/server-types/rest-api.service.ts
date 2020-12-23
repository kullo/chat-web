/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subject } from 'rxjs/Subject';
import { CurrentDeviceService, ServerDevice } from '../current-device';
import { CryptoService, SignatureBundle } from '../crypto';
import { Assert, Config, Encoding } from '../util';

import { IncomingMessage } from './incoming-message';
import { ServerConversation } from './server-conversation';
import { ServerPermission } from './server-permission';
import { User } from './user';

export interface ConversationsWithPermissions {
  conversations: ServerConversation[],
  permissions: ServerPermission[],
}

export interface DevicesWithOwners {
  devices: ServerDevice[],
  owners: User[],
}

interface RestApiServiceInterface {
  makeWebsocketUrl(): Promise<string>;
  getConversations(): Promise<ConversationsWithPermissions>;
  getDevices(state: string): Promise<DevicesWithOwners>;
  getDevice(id: string): Promise<ServerDevice>;
  updateDevice(id: string, patchBody: object): Promise<void>;
  getMessages(conversationId: string): Subject<IncomingMessage[]>;
  getUsers(state?: string): Promise<User[]>;
  createConversation(id: string, type: string, title: string, participantIds: number[], permissions: ServerPermission[]): Promise<void>;
  updateUser(userId: number, requestBody: object): Promise<void>;
  activateUser(userId: number, permissions: ServerPermission[]): Promise<void>;
}

export class FakeRestApiService implements RestApiServiceInterface {
  makeWebsocketUrl(): Promise<string> { return Promise.resolve("ws://example.com"); }
  getConversations(): Promise<ConversationsWithPermissions> {
    return Promise.resolve({ conversations: [], permissions: [] });
  }
  getDevices(state: string): Promise<DevicesWithOwners> {
    return Promise.resolve({ devices: [], owners: [] });
  }
  getDevice(id: string): Promise<ServerDevice> {
    return Promise.reject("FakeRestApiService.getDevice not implemented");
  }
  updateDevice(id: string, patchBody: object): Promise<void> {
    return Promise.resolve();
  }
  getMessages(conversationId: string): Subject<IncomingMessage[]> { return new ReplaySubject<IncomingMessage[]>(); }
  getUsers(state?: string): Promise<User[]> {
    return Promise.resolve(new Array<User>());
  };
  createConversation(id: string, type: string, title: string, participantIds: number[], permissions: ServerPermission[]): Promise<void> {
    return Promise.resolve();
  };
  updateUser(userId: number, requestBody: object): Promise<void> {
    return Promise.resolve();
  }
  activateUser(userId: number, permissions: ServerPermission[]): Promise<void> {
    return Promise.resolve();
  }
}

@Injectable()
export class RestApiService implements RestApiServiceInterface {

  // no state here! RestApiService is kept alive across multiple user sessions

  constructor(
    private currentDevice: CurrentDeviceService,
    private crypto: CryptoService,
    private http: HttpClient,
  ) { }

  async makeWebsocketUrl(): Promise<string> {
    let authorization = await this.makeAuthorization();
    return this.http
      .post(Config.API_BASE_URL + '/ws_urls', null, {
        headers: { 'Authorization': authorization },
      })
      .map((body: any) => body["socketUrl"] as string)
      .toPromise();
  }

  async getConversations(): Promise<ConversationsWithPermissions> {
    let authorization = await this.makeAuthorization();
    let body: any = await this.http
      .get(Config.API_BASE_URL + '/conversations', {
        headers: { 'Authorization': authorization },
      })
      .toPromise();
    let conversations: ServerConversation[] = body["objects"].map((object: any) => ServerConversation.fromJson(object));
    let permissions: ServerPermission[] = body["related"]["permissions"].map((object: any) => ServerPermission.fromJson(object));
    console.log("Got conversations via REST:", conversations, permissions);
    return {
      conversations: conversations,
      permissions: permissions,
    };
  }

  async getDevices(state: string): Promise<DevicesWithOwners> {
    Assert.isSet(state, "state must be set");

    let authorization = await this.makeAuthorization();
    let body: any = await this.http
      .get(Config.API_BASE_URL + '/devices?state=' + state, {
        headers: { 'Authorization': authorization },
      })
      .toPromise();
    let devices: ServerDevice[] = body["objects"].map((object: any) => ServerDevice.fromJson(object));
    let owners: User[] = body["related"]["users"].map((object: any) => User.fromJson(object));
    return {
      devices: devices,
      owners: owners,
    };
  }

  async getDevice(id: string): Promise<ServerDevice> {
    Assert.isSet(id, "id must be set");

    let devices = (await this.getDevices("active")).devices;
    let devicesWithSearchId = devices.filter(d => d.id == id);
    Assert.isEqual(devicesWithSearchId.length, 1);
    return devicesWithSearchId[0];
  }

  async updateDevice(id: string, patchBody: object): Promise<void> {
    Assert.isSet(id, "id must be set");

    let authorization = await this.makeAuthorization();
    let body: any = await this.http
      .patch(Config.API_BASE_URL + '/devices/' + id, patchBody, {
        headers: { 'Authorization': authorization },
      })
      .toPromise();
  }

  getMessages(conversationId: string): ReplaySubject<IncomingMessage[]> {
    Assert.isSet(conversationId, "conversationId must be set");
    console.log("Reload messages of conversation " + conversationId + " via REST …")

    let out = new ReplaySubject<IncomingMessage[]>();

    (async () => {
      let authorization = await this.makeAuthorization();

      do {
        let params;
        if (nextCursor) {
          params = {
            "cursor": nextCursor,
          }
        } else {
          params = {}
        }
        let body: any = await this.http
          .get(Config.API_BASE_URL + '/conversations/' + conversationId + '/messages', {
            headers: { 'Authorization': authorization },
            params: params
          })
          .toPromise()

        var nextCursor = body["meta"]["nextCursor"];
        let messages: IncomingMessage[] = body["objects"].map((object: any) => IncomingMessage.fromJson(object));
        console.log("Got page of messages via REST:", messages);
        out.next(messages);

      } while (nextCursor);

      out.complete();
    })();

    return out;
  }

  async getUsers(state?: string): Promise<User[]> {
    let url = (state) ? '/users?state=' + state : '/users';
    let authorization = await this.makeAuthorization();
    let body: any = await this.http
      .get(Config.API_BASE_URL + url, {
        headers: { 'Authorization': authorization },
      })
      .toPromise();
    let users: User[] = body["objects"].map((object: any) => User.fromJson(object));
    console.log("Got users via REST:", users);
    return users;
  }

  async createConversation(id: string, type: string, title: string, participantIds: number[], permissions: ServerPermission[]): Promise<void> {
    let authorization = await this.makeAuthorization();
    let requestBody = {
      conversation: {
        id: id,
        type: type,
        title: title,
        participantIds: participantIds,
      },
      permissions: permissions.map(p => p.toJson())
    };
    let responseBody = await this.http
      .post(Config.API_BASE_URL + '/conversations', requestBody, {
        headers: { 'Authorization': authorization },
      })
      .toPromise();
    return Promise.resolve();
  };

  async updateUser(userId: number, requestBody: object): Promise<void> {
    let authorization = await this.makeAuthorization();
    let responseBody = await this.http
      .patch(Config.API_BASE_URL + '/users/' + userId, requestBody, {
        headers: { 'Authorization': authorization },
      })
      .toPromise();
    //let newUser = User.fromJson(responseBody);
    //return newUser;
    return;
  }

  async activateUser(userId: number, permissions: ServerPermission[]): Promise<void> {
    let authorization = await this.makeAuthorization();
    let requestBody = {
      user: {
        state: "active",
      },
      permissions: permissions.map(p => p.toJson()),
    }
    await this.updateUser(userId, requestBody);
    return;
  }

  private async makeAuthorization(): Promise<string> {
    let loginKey = await this.currentDevice.loginKey();
    let loginKeyBase64 = Encoding.toBase64(loginKey);

    let device = await this.currentDevice.device();
    let signature = await this.crypto.makeEd25519Signature(loginKey, device.privkey);
    let signatureBundle = new SignatureBundle(device.id, signature);

    // TODO: fix separator as soon as server is fixed
    return `KULLO_V1 loginKey="${loginKeyBase64}", signature="${signatureBundle.toString()}"`;
  }

}
