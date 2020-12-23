/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Injectable } from '@angular/core';

import * as libsodium from "libsodium-wrappers";

import { Assert, Encoding } from '../util';

import { Ed25519Keypair, Ed25519Privkey, Ed25519Pubkey } from './ed25519-keypair';
import { Ed25519Signature } from './ed25519-signature';
import { EncryptionKeypair, EncryptionPubkey, EncryptionPrivkey } from './encryption-keypair';
import { MasterKey, Subkey } from './kdf-types';
import { SymmetricKey } from './symmetric-key';

export enum Blake2bLen {
  size128 = 16,
  size224 = 28,
  size256 = 32,
  size384 = 48,
  size512 = 64,
}

@Injectable()
export class CryptoService {

  ready: boolean = false;

  private readonly sodium = libsodium;

  constructor() {
    this.sodium.ready
      .then(ready => {
        this.ready = true;
      })
      .catch(error => {
        setTimeout(() => {
          throw new Error("Initializing libsodium failed: " + error);
        });
      });
  }

  // Encoding

  async base64Encode(input: Uint8Array): Promise<string> {
    Assert.isSet(input);
    await this.sodium.ready;
    return this.sodium.to_base64(input, this.sodium.base64_variants.ORIGINAL);
  }

  async base64Decode(input: string): Promise<Uint8Array> {
    Assert.isSet(input);
    await this.sodium.ready;
    return this.sodium.from_base64(input, this.sodium.base64_variants.ORIGINAL);
  }

  async hexEncode(input: Uint8Array): Promise<string> {
    Assert.isSet(input);
    await this.sodium.ready;
    return this.sodium.to_hex(input);
  }

  async hexDecode(input: string): Promise<Uint8Array> {
    Assert.isSet(input);
    await this.sodium.ready;
    return this.sodium.from_hex(input);
  }

  // Hashing

  async blake2b(outLength: Blake2bLen, input: Uint8Array): Promise<Uint8Array> {
    Assert.isSet(input);
    await this.sodium.ready;
    return this.sodium.crypto_generichash(outLength, input, null);
  }

  async blake2bKdf(subkeyId: number, context: string, masterKey: MasterKey): Promise<Uint8Array> {
    Assert.isSet(subkeyId, "subkeyId must be set");
    Assert.isSet(context, "context must be set");
    Assert.isSet(masterKey, "masterKey must be set");
    Assert.isTrue(subkeyId >= 0, "subkeyId must be non-negative");
    Assert.isTrue(Number.isSafeInteger(subkeyId), "subkeyId must not exceed the safe integer range");

    await this.sodium.ready;

    Assert.isEqual(context.length, this.sodium.crypto_kdf_CONTEXTBYTES);
    Assert.isEqual(masterKey.data.length, this.sodium.crypto_kdf_KEYBYTES);

    return this.sodium.crypto_kdf_derive_from_key(
      32,
      subkeyId,
      context,
      masterKey.data
    );
  }

  async kdf(subkeyId: Subkey, masterKey: MasterKey): Promise<Uint8Array> {
    Assert.isSet(subkeyId, "subkeyId must be set");
    Assert.isSet(masterKey, "masterKey must be set");

    let APP_CONTEXT = "CHATv001";
    return this.blake2bKdf(subkeyId, APP_CONTEXT, masterKey);
  }

  // Identifiers

  async makeFingerprint(data: Uint8Array): Promise<string> {
    await this.sodium.ready;
    let hash = await this.blake2b(Blake2bLen.size128, data);
    return Encoding.toHex(hash);
  }

  async generateRandomId(): Promise<string> {
    await this.sodium.ready;
    let raw = this.sodium.randombytes_buf(16 /* 128 bit */)
    return Encoding.toHex(raw);
  }

  // Ed25519

  async generateEd25519Keypair(): Promise<Ed25519Keypair> {
    await this.sodium.ready;
    return Ed25519Keypair.fromLibsodium(this.sodium.crypto_sign_keypair());
  }

  async signEd25519(message: Uint8Array, privateKey: Ed25519Privkey): Promise<Uint8Array> {
    await this.sodium.ready;
    return this.sodium.crypto_sign(message, privateKey.data);
  }

  async verifyEd25519(signedMessage: Uint8Array, publicKey: Ed25519Pubkey): Promise<Uint8Array> {
    await this.sodium.ready;
    return this.sodium.crypto_sign_open(signedMessage, publicKey.data);
  }

  async makeEd25519Signature(message: Uint8Array, privateKey: Ed25519Privkey): Promise<Ed25519Signature> {
    await this.sodium.ready;
    return new Ed25519Signature(this.sodium.crypto_sign_detached(message, privateKey.data));
  }

  async verifyEd25519Signature(signature: Ed25519Signature, message: Uint8Array, publicKey: Ed25519Pubkey): Promise<boolean> {
    await this.sodium.ready;
    return this.sodium.crypto_sign_verify_detached(signature.data, message, publicKey.data);
  }

  // Public-key encryption

  async generateEncryptionKeypair(): Promise<EncryptionKeypair> {
    await this.sodium.ready;
    return EncryptionKeypair.fromLibsodium(this.sodium.crypto_box_keypair());
  }

  // curve25519xsalsa20poly1305?
  async encryptWithPubkey(message: Uint8Array, pubkey: EncryptionPubkey): Promise<Uint8Array> {
    Assert.isSet(message, "message must be set");
    Assert.isSet(pubkey, "pubkey must be set");

    await this.sodium.ready;

    let ciphertext = this.sodium.crypto_box_seal(
      message,
      pubkey.data);
    return ciphertext;
  }

  async decryptWithPrivkey(ciphertext: Uint8Array, keypairReceiver: EncryptionKeypair): Promise<Uint8Array> {
    Assert.isSet(ciphertext, "ciphertext must be set");
    Assert.isSet(keypairReceiver, "keypairReceiver must be set");

    await this.sodium.ready;

    let sealLen = this.sodium.crypto_box_SEALBYTES;

    Assert.isTrue(ciphertext.length >= sealLen, "ciphertext too short");

    let plaintext = this.sodium.crypto_box_seal_open(
      ciphertext,
      keypairReceiver.pubkey.data,
      keypairReceiver.privkey.data);
    return plaintext;
  }

  // Symmetric encryption

  async generateSymmetricKey(): Promise<SymmetricKey> {
    await this.sodium.ready;
    return new SymmetricKey(this.sodium.crypto_aead_chacha20poly1305_ietf_keygen());
  }

  async generateSymmetricEncrytionNonce(): Promise<Uint8Array> {
    await this.sodium.ready;
    return this.sodium.randombytes_buf(this.sodium.crypto_aead_chacha20poly1305_ietf_NPUBBYTES)
  }

  async encryptWithSymmetricKey(message: Uint8Array, key: SymmetricKey): Promise<Uint8Array> {
    let nonce = await this.generateSymmetricEncrytionNonce();
    let ciphertext = await this.chacha20Poly1305IetfEncrypt(message, key.data, nonce);

    let out = new Uint8Array(nonce.length + ciphertext.length)
    out.set(nonce, 0);
    out.set(ciphertext, nonce.length);
    return out;
  }

  async decryptWithSymmetricKey(ciphertext: Uint8Array, key: SymmetricKey): Promise<Uint8Array> {
    Assert.isSet(ciphertext, "ciphertext must be set");
    Assert.isSet(key, "key must be set");

    await this.sodium.ready;

    let nonceLen = this.sodium.crypto_aead_chacha20poly1305_ietf_NPUBBYTES;
    let aLen = this.sodium.crypto_aead_chacha20poly1305_ietf_ABYTES;

    Assert.isTrue(ciphertext.length >= nonceLen + aLen, "ciphertext too short");

    let publicNonce = new Uint8Array(ciphertext.buffer, 0, nonceLen);
    let ciphertextWithoutNonce = new Uint8Array(ciphertext.buffer, nonceLen);

    let secretNonce = null; // unused in crypto_aead_chacha20poly1305_ietf_decrypt, should be null
    let additionalData = undefined;
    return this.chacha20Poly1305IetfDecrypt(ciphertextWithoutNonce, key.data, publicNonce);
  }

  async chacha20Poly1305IetfEncrypt(message: Uint8Array, key: Uint8Array, nonce: Uint8Array): Promise<Uint8Array> {
    await this.sodium.ready;
    let additionalData = undefined;
    let secretNonce = null; // unused in crypto_aead_chacha20poly1305_ietf_encrypt, should be null
    let publicNonce = nonce;

    let ciphertext = this.sodium.crypto_aead_chacha20poly1305_ietf_encrypt(
      message,
      additionalData,
      secretNonce,
      publicNonce,
      key);

    return ciphertext;
  }

  async chacha20Poly1305IetfDecrypt(ciphertext: Uint8Array, key: Uint8Array, nonce: Uint8Array): Promise<Uint8Array> {
    await this.sodium.ready;

    let publicNonce = nonce;
    let secretNonce = null; // unused in crypto_aead_chacha20poly1305_ietf_decrypt, should be null
    let additionalData = undefined;
    return this.sodium.crypto_aead_chacha20poly1305_ietf_decrypt(
      secretNonce,
      ciphertext,
      additionalData,
      publicNonce,
      key);
  }
}
