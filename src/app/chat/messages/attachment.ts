/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { SymmetricKey } from "../../crypto";
import { Assert, Encoding } from "../../util";

export class Thumbnail {
  constructor(
    public readonly id: string,
    public readonly mimeType: string,
    public readonly width: number,
    public readonly height: number,
    public readonly encryptionAlgorithm: string,
    public readonly encryptionKey: SymmetricKey,
  ) {
    Assert.isSet(id, "id must be set");
    Assert.isSet(mimeType, "mimeType must be set");
    Assert.isSet(width, "width must be set");
    Assert.isSet(height, "height must be set");
    Assert.isSet(encryptionAlgorithm, "encryptionAlgorithm must be set");
    Assert.isSet(encryptionKey, "encryptionKey must be set");

    Assert.isEqual(encryptionAlgorithm, "chacha20poly1305-ietf-nonce12prefixed");
  }

  toJson(): object {
    return {
      id: this.id,
      mimeType: this.mimeType,
      width: this.width,
      height: this.height,
      encryption: {
        algorithm: this.encryptionAlgorithm,
        key: Encoding.toBase64(this.encryptionKey.data),
      },
    }
  }

  static fromJson(json: any): Thumbnail {
    Assert.isSet(json, "json must be set");
    return new Thumbnail(
      json.id,
      json.mimeType,
      json.width,
      json.height,
      json.encryption.algorithm,
      new SymmetricKey(Encoding.fromBase64(json.encryption.key)),
    );
  }
}

export class Attachment {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly mimeType: string,
    public readonly encryptionAlgorithm: string,
    public readonly encryptionKey: SymmetricKey,
    public readonly thumbnail: Thumbnail | null,
  ) {
    Assert.isSet(id, "id must be set");
    Assert.isSet(name, "name must be set");
    Assert.isSet(mimeType, "mimeType must be set");
    Assert.isSet(encryptionAlgorithm, "encryptionAlgorithm must be set");
    Assert.isSet(encryptionKey, "encryptionKey must be set");
    Assert.isDefined(thumbnail, "thumbnail must be defined");

    Assert.isEqual(encryptionAlgorithm, "chacha20poly1305-ietf-nonce12prefixed");
  }

  toJson(): object {
    return {
      id: this.id,
      name: this.name,
      mimeType: this.mimeType,
      encryption: {
        algorithm: this.encryptionAlgorithm,
        key: Encoding.toBase64(this.encryptionKey.data),
      },
      thumbnail: (this.thumbnail) ? this.thumbnail.toJson() : null,
    }
  }

  static fromJson(json: any): Attachment {
    Assert.isSet(json, "json must be set");

    let thumbnail = (json.thumbnail) ? Thumbnail.fromJson(json.thumbnail) : null;
    return new Attachment(
      json.id,
      json.name,
      json.mimeType,
      json.encryption.algorithm,
      new SymmetricKey(Encoding.fromBase64(json.encryption.key)),
      thumbnail);
  }
}
