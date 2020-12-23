/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { TestBed } from '@angular/core/testing';
import { Ed25519Pubkey, Ed25519Privkey, Ed25519Signature } from '../crypto';
import { Encoding } from '../util';

import { LocalDevice } from './local-device';

describe('LocalDevice', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [],
    });
  });

  it('should create', () => {
    let pubkey = new Ed25519Pubkey(new Uint8Array([]));
    let privkey = new Ed25519Privkey(new Uint8Array([]));
    let idOwnerIdSignature = new Ed25519Signature(Encoding.fromHex("e5564300c360ac729086e2cc806e828a84877f1eb8e5d974d873e065224901555fb8821590a33bacc61e39701cf9b46bd25bf5f0595bbe24655141438e7a100b"));
    let uut = new LocalDevice("aabbccdd", 22, pubkey, privkey, idOwnerIdSignature);
    expect(uut).toBeTruthy();
  });

  it('should export to JSON', () => {
    let pubkey = new Ed25519Pubkey(Encoding.fromBase64("RYoWeqhM"));
    let privkey = new Ed25519Privkey(Encoding.fromBase64("ZxXgnG1K"));
    let idOwnerIdSignature = new Ed25519Signature(Encoding.fromBase64("Ptq9jAhlBs1P+SUxzHbWLD+syw6q5TAqj4Yse4tbBKi/E6yk8YHu30H91EQ3oJGRX9NBDGLDPKhy6LNyQ1MjKQ=="));
    let uut = new LocalDevice("aabbccdd", 22, pubkey, privkey, idOwnerIdSignature);

    let expectedJson = {
      id: "aabbccdd",
      ownerId: 22,
      idOwnerIdSignature: "Ptq9jAhlBs1P+SUxzHbWLD+syw6q5TAqj4Yse4tbBKi/E6yk8YHu30H91EQ3oJGRX9NBDGLDPKhy6LNyQ1MjKQ==",
      pubkey: "RYoWeqhM",
      privkey: "ZxXgnG1K",
    };

    expect(uut.toJson()).toEqual(expectedJson);
  });


  it('should import from JSON', () => {
    let json = {
      id: "aabbccdd",
      ownerId: 22,
      idOwnerIdSignature: "Ptq9jAhlBs1P+SUxzHbWLD+syw6q5TAqj4Yse4tbBKi/E6yk8YHu30H91EQ3oJGRX9NBDGLDPKhy6LNyQ1MjKQ==",
      pubkey: "RYoWeqhM",
      privkey: "ZxXgnG1K",
    };

    let uut = LocalDevice.fromJson(json);
    expect(uut).toBeTruthy();
    expect(uut.id).toEqual("aabbccdd");
    expect(uut.ownerId).toEqual(22);
    expect(uut.pubkey.data).toEqual(Encoding.fromBase64("RYoWeqhM"));
    expect(uut.privkey.data).toEqual(Encoding.fromBase64("ZxXgnG1K"));
    expect(uut.idOwnerIdSignature.data).toEqual(Encoding.fromBase64("Ptq9jAhlBs1P+SUxzHbWLD+syw6q5TAqj4Yse4tbBKi/E6yk8YHu30H91EQ3oJGRX9NBDGLDPKhy6LNyQ1MjKQ=="));
  });

  it('should export to ServerDevice', () => {
    let pubkey = new Ed25519Pubkey(new Uint8Array([0x61]));
    let privkey = new Ed25519Privkey(new Uint8Array([0x62]));
    let idOwnerIdSignature = new Ed25519Signature(Encoding.fromHex("e5564300c360ac729086e2cc806e828a84877f1eb8e5d974d873e065224901555fb8821590a33bacc61e39701cf9b46bd25bf5f0595bbe24655141438e7a100b"));
    let uut = new LocalDevice("aabbccdd", 22, pubkey, privkey, idOwnerIdSignature);

    let result = uut.toServerDevice("active");
    expect(result).toBeTruthy();
    expect(result.id).toEqual("aabbccdd");
    expect(result.ownerId).toEqual(22);
    expect(result.state).toEqual("active");
    expect(result.blockTime).toEqual(null);
    expect(result.pubkey.data).toEqual(pubkey.data);
    expect(result.idOwnerIdSignature.deviceId).toEqual("aabbccdd");
    expect(result.idOwnerIdSignature.signature.data).toEqual(Encoding.fromHex("e5564300c360ac729086e2cc806e828a84877f1eb8e5d974d873e065224901555fb8821590a33bacc61e39701cf9b46bd25bf5f0595bbe24655141438e7a100b"));
  });

});
