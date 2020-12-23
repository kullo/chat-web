/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { TestBed } from '@angular/core/testing';
import { Ed25519Pubkey, Ed25519Signature, SignatureBundle } from '../crypto';
import { Encoding } from '../util';

import { ServerDevice } from './server-device';

describe('ServerDevice', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [],
    });
  });

  it('should create', () => {
    let pubkey = new Ed25519Pubkey(new Uint8Array([]));
    let id = "aabbccdd";
    let idOwnerIdSignature = new SignatureBundle(
      id,
      new Ed25519Signature(Encoding.fromHex("e5564300c360ac729086e2cc806e828a84877f1eb8e5d974d873e065224901555fb8821590a33bacc61e39701cf9b46bd25bf5f0595bbe24655141438e7a100b")),
    );
    let uut = new ServerDevice(id, 22, pubkey, "pending", null, idOwnerIdSignature);
    expect(uut).toBeTruthy();
  });

  it('should create from json', () => {
    {
      let json = {
        "id": "aabbccdd",
        "ownerId": 33,
        "idOwnerIdSignature": "aabbccdd,DksG5uSElisx0gTouv5hNMCK8k30PxzphHBhhKQBWlfgSnwa8urJSizNo2RTEWXyfsh4l2jIxbyq3dTjAafN1A==",
        "pubkey": "T88+5EwOllRRiZPg8jWhXjF3OK2tWIzu1+4bHelzBl0=",
        "state": "active",
        "blockTime": null,
      }
      let device = ServerDevice.fromJson(json);
      expect(device).toBeTruthy();
      expect(device.id).toEqual("aabbccdd");
      expect(device.ownerId).toEqual(33);
      expect(device.idOwnerIdSignature.deviceId).toEqual("aabbccdd");
      expect(device.idOwnerIdSignature.signature.data).toEqual(Encoding.fromBase64("DksG5uSElisx0gTouv5hNMCK8k30PxzphHBhhKQBWlfgSnwa8urJSizNo2RTEWXyfsh4l2jIxbyq3dTjAafN1A=="));
      expect(device.pubkey.data).toEqual(Encoding.fromBase64("T88+5EwOllRRiZPg8jWhXjF3OK2tWIzu1+4bHelzBl0="));
      expect(device.state).toEqual("active");
      expect(device.blockTime).toEqual(null);
    }

    { // blockTime set
      let json = {
        "id": "aabbccdd",
        "ownerId": 33,
        "idOwnerIdSignature": "aabbccdd,DksG5uSElisx0gTouv5hNMCK8k30PxzphHBhhKQBWlfgSnwa8urJSizNo2RTEWXyfsh4l2jIxbyq3dTjAafN1A==",
        "pubkey": "T88+5EwOllRRiZPg8jWhXjF3OK2tWIzu1+4bHelzBl0=",
        "state": "blocked",
        "blockTime": "2002-10-02T15:00:00.05Z",
      }
      let device = ServerDevice.fromJson(json);
      expect(device.blockTime).toEqual("2002-10-02T15:00:00.05Z");
    }

    { // blockTime not serialized
      let json = {
        "id": "aabbccdd",
        "ownerId": 33,
        "idOwnerIdSignature": "aabbccdd,DksG5uSElisx0gTouv5hNMCK8k30PxzphHBhhKQBWlfgSnwa8urJSizNo2RTEWXyfsh4l2jIxbyq3dTjAafN1A==",
        "pubkey": "T88+5EwOllRRiZPg8jWhXjF3OK2tWIzu1+4bHelzBl0=",
        "state": "pending",
      }
      let device = ServerDevice.fromJson(json);
      expect(device).toBeTruthy();
      expect(device.blockTime).toEqual(null);
    }
  });

  it('should export to json', () => {
    {
      let pubkey = new Ed25519Pubkey(new Uint8Array([0x61, 0x62, 0x63]));
      let id = "aabbccdd";
      let idOwnerIdSignature = new SignatureBundle(
        id,
        new Ed25519Signature(Encoding.fromBase64("DksG5uSElisx0gTouv5hNMCK8k30PxzphHBhhKQBWlfgSnwa8urJSizNo2RTEWXyfsh4l2jIxbyq3dTjAafN1A==")),
      );
      let device = new ServerDevice(id, 44, pubkey, "active", null, idOwnerIdSignature);

      let expectedJson = {
        id: "aabbccdd",
        ownerId: 44,
        idOwnerIdSignature: "aabbccdd,DksG5uSElisx0gTouv5hNMCK8k30PxzphHBhhKQBWlfgSnwa8urJSizNo2RTEWXyfsh4l2jIxbyq3dTjAafN1A==",
        pubkey: "YWJj",
        state: "active",
        blockTime: null,
      }
      expect(device.toJson()).toEqual(expectedJson)
    }

    { // blockTime set
      let pubkey = new Ed25519Pubkey(new Uint8Array([0x61, 0x62, 0x63]));
      let id = "aabbccdd";
      let idOwnerIdSignature = new SignatureBundle(
        id,
        new Ed25519Signature(Encoding.fromBase64("DksG5uSElisx0gTouv5hNMCK8k30PxzphHBhhKQBWlfgSnwa8urJSizNo2RTEWXyfsh4l2jIxbyq3dTjAafN1A==")),
      );
      let device = new ServerDevice(id, 55, pubkey, "blocked", "2002-10-02T15:00:00.05Z", idOwnerIdSignature);

      let expectedJson = {
        id: "aabbccdd",
        ownerId: 55,
        idOwnerIdSignature: "aabbccdd,DksG5uSElisx0gTouv5hNMCK8k30PxzphHBhhKQBWlfgSnwa8urJSizNo2RTEWXyfsh4l2jIxbyq3dTjAafN1A==",
        pubkey: "YWJj",
        state: "blocked",
        blockTime: "2002-10-02T15:00:00.05Z",
      }
      expect(device.toJson()).toEqual(expectedJson)
    }
  });

});
