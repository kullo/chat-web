/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Assert } from "./assert";

import * as picaFacory from 'pica/dist/pica';

export class Images {

  private static readonly pica = picaFacory(/* config */);

  static async resize(imageData: Blob, targetWidth: number, targetHeight: number): Promise<Blob> {
    Assert.isSet(imageData, "imageData must be set");
    Assert.isSet(targetWidth, "targetWidth must be set");
    Assert.isSet(targetHeight, "targetHeight must be set");

    let image = await this.blobToLoadedImage(imageData);

    let source = document.createElement('canvas');
    source.width = image.width;
    source.height = image.height;
    source.getContext('2d')!.drawImage(image, 0, 0);

    let dest = document.createElement('canvas');
    dest.width = targetWidth;
    dest.height = targetHeight;

    await this.pica.resize(source, dest, {});

    let thumbnailBlob = await this.pica.toBlob(dest, "image/jpeg", 0.85);

    return thumbnailBlob;
  }

  static blobToLoadedImage(imageData: Blob): Promise<HTMLImageElement> {
    return new Promise<HTMLImageElement>(function(resolve, reject) {
      let objectUrl = URL.createObjectURL(imageData);
      let image = new Image();
      image.src = objectUrl;
      if (image.complete) {
        URL.revokeObjectURL(objectUrl);
        resolve(image);
      } else {
        image.onload = () => {
          URL.revokeObjectURL(objectUrl);
          resolve(image);
        }
      }
    });
  }
}
