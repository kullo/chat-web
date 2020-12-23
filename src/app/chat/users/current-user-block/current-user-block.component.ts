/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CurrentDeviceService } from '../../../current-device';
import { DropZoneDropped, Images } from '../../../util';

import { UserPictureComponentData } from '../../users/user-picture/user-picture.component';
import { UsersService } from '../../users/users.service';
import { UserSettingsService } from '../../users/user-settings.service';

@Component({
  selector: 'app-current-user-block',
  templateUrl: './current-user-block.component.html',
  styleUrls: ['./current-user-block.component.less']
})
export class CurrentUserBlockComponent implements OnInit {

  @Output()
  logoutRequested: EventEmitter<void> = new EventEmitter<void>()

  userPictureData: UserPictureComponentData | undefined;
  name: string

  constructor(
    private currentDevice: CurrentDeviceService,
    private users: UsersService,
    private userSettings: UserSettingsService,
  ) { }

  ngOnInit() {
    let userIdCopy: number
    this.currentDevice.device()
      .then(device => {
        return device.ownerId
      })
      .then(userId => {
        userIdCopy = userId;
        return this.users.profile(userId);
      })
      .then(profile => {
        this.userPictureData = { userId: userIdCopy, user: profile };
        this.name = profile ? profile.name : "";
      });
  }

  onFilesDropped(event: DropZoneDropped) {
    let imageFiles = event.files.filter(this.isImageFile);
    console.log("Got image files:", imageFiles);

    if (imageFiles.length >= 1) {
      let firstImageFile = imageFiles[0];

      (async () => {
        let resized = await Images.resize(firstImageFile, 200, 200);
        let newUser = await this.userSettings.setPicture(resized);
        this.userPictureData = { userId: newUser.id, user: newUser };
      })();
    }
  }

  private isImageFile(file: File) {
    return (
      file.type == "image/jpeg"
      || file.type == "image/png"
      || file.type == "image/svg+xml"
    );
  }

}
