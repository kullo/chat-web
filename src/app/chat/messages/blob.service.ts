/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { CryptoService, SymmetricKey } from '../../crypto';
import { Assert, Config } from '../../util';

interface BlobServiceInterface {
  encryptAndUploadFile(
    data: Blob,
    url: string,
    encryptionAlgorithm: string,
    encryptionKey: SymmetricKey,
  ): Promise<void>
  downloadAndDecryptFile(
    id: string,
    mimeType: string,
    encryptionAlgorithm: string,
    encryptionKey: SymmetricKey,
  ): Promise<Blob>
  upload(url: string, data: Blob | ArrayBufferLike, mimeType?: string): Promise<HttpResponse<Blob>>;
  download(url: string): Promise<Blob>;
  downloadUrl(id: string): string;
}

export class FakeBlobService implements BlobServiceInterface {
  encryptAndUploadFile(
    data: Blob,
    url: string,
    encryptionAlgorithm: string,
    encryptionKey: SymmetricKey,
  ): Promise<void> {
    return Promise.reject("fake implementation")
  }
  downloadAndDecryptFile(
    id: string,
    mimeType: string,
    encryptionAlgorithm: string,
    encryptionKey: SymmetricKey,
  ): Promise<Blob> {
    return Promise.resolve(new Blob());
  }
  upload(url: string, data: Blob | ArrayBufferLike, mimeType?: string): Promise<HttpResponse<Blob>> {
    return Promise.reject("fake implementation")
  }
  download(url: string): Promise<Blob> {
    return Promise.reject("fake implementation")
  }
  downloadUrl(id: string): string {
    return "";
  }
}

@Injectable()
export class BlobService implements BlobServiceInterface {

  constructor(
    private crypto: CryptoService,
    private http: HttpClient,
  ) { }

  async encryptAndUploadFile(
    data: Blob,
    url: string,
    encryptionAlgorithm: string,
    encryptionKey: SymmetricKey,
  ): Promise<void> {
    let message = await this.blobToBuffer(data);

    let encrypted: Uint8Array;
    switch (encryptionAlgorithm) {
      case "chacha20poly1305-ietf-nonce12prefixed":
        encrypted = await this.crypto.encryptWithSymmetricKey(message, encryptionKey);
        break;
      default:
        throw new Error("Unknown encryption algorithm");
    }

    let response = await this.upload(url, encrypted.buffer, 'application/octet-stream');
    if (!response.ok) return Promise.reject("PUTing failed");
  }

  async downloadAndDecryptFile(
    id: string,
    mimeType: string,
    encryptionAlgorithm: string,
    encryptionKey: SymmetricKey,
  ): Promise<Blob> {
    Assert.isSet(id, "id must be set");
    Assert.isSet(mimeType, "mimeType must be set");
    Assert.isSet(encryptionAlgorithm, "encryptionAlgorithm must be set");
    Assert.isSet(encryptionKey, "encryptionKey must be set");

    let download = await this.download(this.downloadUrl(id));
    let cyphertext = await this.blobToBuffer(download);

    let message: Uint8Array;
    switch (encryptionAlgorithm) {
      case "chacha20poly1305-ietf-nonce12prefixed":
        message = await this.crypto.decryptWithSymmetricKey(cyphertext, encryptionKey);
        break;
      default:
        throw new Error("Unknown encryption algorithm");
    }

    return new Blob([message], {type: mimeType});
  }

  async upload(url: string, data: Blob | ArrayBufferLike, mimeType?: string): Promise<HttpResponse<Blob>> {
    let headers = new HttpHeaders();

    if (mimeType) {
      headers.append('Content-Type', mimeType);
    } else if (data instanceof Blob && data.type != "") {
      headers.append('Content-Type', data.type);
    }

    return this.http
      .put(url, data, { headers: headers, observe: 'response', responseType: 'blob' })
      .toPromise();
  }

  async download(url: string): Promise<Blob> {
    return this.http
      .get(url, { responseType: 'blob' })
      .toPromise();
  }

  downloadUrl(id: string): string {
    return Config.BLOB_DOWNLOAD_URL_PATTERN
      .replace(':api_base_url', Config.API_BASE_URL)
      .replace(':id', id);
  }

  private blobToBuffer(blob: Blob): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.onload = (event: any) => {
        let buffer: ArrayBuffer = event.target.result;
        resolve(new Uint8Array(buffer));
      }
      reader.readAsArrayBuffer(blob);
    });
  }
}
