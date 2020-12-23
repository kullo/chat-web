/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Injectable } from '@angular/core';
import { CurrentDeviceService } from '../../current-device';
import { RestApiService, User } from '../../server-types';

import { BlobService } from '../messages/blob.service';
import { ServerCommunicationService } from '../socket/server-communication.service';
import { UsersService } from './users.service';

interface UserSettingsServiceInterface {
  setPicture(file: Blob): Promise<User>;
}

export class FakeUserSettingsService implements UserSettingsServiceInterface {
  setPicture(file: Blob): Promise<User> {
    return Promise.reject("FakeUserSettingsService.setPicture not implemented");
  }
}

@Injectable()
export class UserSettingsService implements UserSettingsServiceInterface {

  constructor(
    private blob: BlobService,
    private currentDevice: CurrentDeviceService,
    private restApi: RestApiService,
    private server: ServerCommunicationService,
    private users: UsersService,
  ) { }

  async setPicture(file: Blob): Promise<User> {
    let attachment = (await this.server.getAttachmentUploadUrls(1))[0];

    await this.blob.upload(attachment.uploadUrl, file);
    let downloadUrl = this.blob.downloadUrl(attachment.id);

    let currentUserId = (await this.currentDevice.device()).ownerId;

    await this.restApi.updateUser(currentUserId, {
      user: {
        picture: downloadUrl,
      },
    });

    this.users.invalidate(currentUserId);
    let newUser = this.users.profile(currentUserId);

    return newUser;
  }
}
