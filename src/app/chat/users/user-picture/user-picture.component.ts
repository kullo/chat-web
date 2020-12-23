/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import * as jdenticon from "jdenticon";
import { User } from '../../../server-types';
import { Encoding } from '../../../util';

export interface UserPictureComponentData {
  userId: number;
  user: User | undefined;
}

@Component({
  selector: 'app-user-picture',
  templateUrl: './user-picture.component.html',
  styleUrls: ['./user-picture.component.less']
})
export class UserPictureComponent {

  private readonly SVG_SIZE = 100; // size does not matter, this is scalable anyway
  private readonly PADDING_RELATIVE = 0.15;

  @Input()
  data: UserPictureComponentData | undefined;

  constructor(
    private sanitizer: DomSanitizer,
  ) {
    jdenticon.config = {
      backColor: "#eeeeee",
    };
  }

  urlForUserData(data: UserPictureComponentData | undefined): SafeUrl | "" {
    if (!data) return "";

    if (data.user && data.user.picture) {
      return data.user.picture;
    } else {
      let start = Date.now();

      let value = String(data.userId);
      let svgSource: string = jdenticon.toSvg(value, this.SVG_SIZE, this.PADDING_RELATIVE);
      let svgBase64 = Encoding.toBase64(Encoding.toUtf8(svgSource));
      let untrustedUrl = "data:image/svg+xml;base64," + svgBase64;

      let end = Date.now();

      // somehow called too often
      // console.log("Generating jdenticon SVG for value", value, "took", end-start, "ms");

      return this.sanitizer.bypassSecurityTrustUrl(untrustedUrl);
    }
  }

}
