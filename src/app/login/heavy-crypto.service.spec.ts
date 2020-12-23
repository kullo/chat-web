/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { TestBed, inject } from '@angular/core/testing';
import { Encoding } from '../util';

import { HeavyCryptoService } from './heavy-crypto.service';

describe('HeavyCryptoService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HeavyCryptoService,
      ]
    });
  });

  it('should be created', inject([HeavyCryptoService], (service: HeavyCryptoService) => {
    expect(service).toBeTruthy();
  }));

  // For some strange reason, those tests do not work when using async()
  // from @angular/core/testing. Thus stick to the done callback.
  it('can do Agon2id', (done) => { inject([HeavyCryptoService], async (service: HeavyCryptoService) => {
    // echo -n "abc" | ./argon2 XXXXXXXXXXXXXXXX -id -t 3 -k 8 -l 32
    {
      let result = await service.argon2id(
        32,
        Encoding.toUtf8('abc'),
        Encoding.toUtf8('XXXXXXXXXXXXXXXX'),
        3,
        8*1024,
      );
      expect(Encoding.toHex(result)).toEqual("27284e475d0f7033b5cee1e12eb9a88dc2e5e7c1046aa725d65044e5424fd3f6");
    }

    { // other password
      let result = await service.argon2id(
        32,
        Encoding.toUtf8('ghg5789h795htq9734h84h0th'),
        Encoding.toUtf8('XXXXXXXXXXXXXXXX'),
        3,
        8*1024,
      );
      expect(Encoding.toHex(result)).toEqual("bf51601b703a893557f027f66bbfe3299b53aba9553029385c4d2400d788ae24");
    }

    { // other opsLimit
      let result = await service.argon2id(
        32,
        Encoding.toUtf8('abc'),
        Encoding.toUtf8('XXXXXXXXXXXXXXXX'),
        5,
        8*1024,
      );
      expect(Encoding.toHex(result)).toEqual("1a7026474ec13a9e3a587e3425217f74a990bcd175fc037a9a8fffb38c849539");
    }

    { // other memLimit
      let result = await service.argon2id(
        32,
        Encoding.toUtf8('abc'),
        Encoding.toUtf8('XXXXXXXXXXXXXXXX'),
        3,
        16*1024,
      );
      expect(Encoding.toHex(result)).toEqual("fc1eaa01c056efeb830d69d182270e4eafbd7f958f1ebe316de545a3a36db49f");
    }

    { // Use large memory (32 MiB) but very low opsLimit to remain fast for test
      let result = await service.argon2id(
        32,
        Encoding.toUtf8('abc'),
        Encoding.toUtf8('XXXXXXXXXXXXXXXX'),
        1,
        32*1024*1024,
      );
      expect(Encoding.toHex(result)).toEqual("9cff605b44af6fb725f7910fe04ee088591f39521caa7f7dcb58a6db45148668");
    }

    done();
  })() });

  // disabled because this runs for ~ 6 seconds
  xit('can do pkdf step 1', (done) => { inject([HeavyCryptoService], async (service: HeavyCryptoService) => {
    // calculated using external script using C libsodium
    let masterKey = await service.pkdfStep1("password");
    expect(masterKey.length).toEqual(32);
    expect(masterKey).toEqual(Encoding.fromBase64("27atcsOrVKUFdN9oJgF5VyGeRezuAM5+5MyWNRUu1AM="));
    done();
  })() }, 10000);
});
