/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { TestBed, inject, async } from '@angular/core/testing';

import { Assert, Encoding } from '../util';

import { Ed25519Pubkey, Ed25519Privkey } from './ed25519-keypair';
import { Ed25519Signature } from './ed25519-signature';
import { EncryptionKeypair } from './encryption-keypair';
import { MasterKey, Subkey } from './kdf-types';

import { CryptoService, Blake2bLen } from './crypto.service';

describe('CryptoService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CryptoService]
    });
  });

  describe('Setup', () => {
    it('should be created', inject([CryptoService], (service: CryptoService) => {
      expect(service).toBeTruthy();
    }));

    it('is created unready', inject([CryptoService], (service: CryptoService) => {
      expect(service.ready).toBeFalsy();
    }));

    it('becomes ready quickly', async(inject([CryptoService], (service: CryptoService) => {
      expect(service.ready).toBeFalsy();

      setTimeout(() => {
        expect(service.ready).toBeTruthy();
      }, 200);
    })));
  });

  describe('Encoding', () => {
    it('can encode base64', async(inject([CryptoService], (service: CryptoService) => {
      service.base64Encode(new Uint8Array([])).then(result => expect(result).toEqual(''));
      service.base64Encode(new Uint8Array([0x61])).then(result => expect(result).toEqual('YQ=='));
      service.base64Encode(new Uint8Array([0x61,0x62])).then(result => expect(result).toEqual('YWI='));
      service.base64Encode(new Uint8Array([0x61,0x62,0x63])).then(result => expect(result).toEqual('YWJj'));
      service.base64Encode(new Uint8Array([0x61,0x62,0x63,0x64])).then(result => expect(result).toEqual('YWJjZA=='));
    })));

    it('can decode base64', async(inject([CryptoService], (service: CryptoService) => {
      service.base64Decode('').then(result => expect(result).toEqual(new Uint8Array([])));
      service.base64Decode('YQ==').then(result => expect(result).toEqual(new Uint8Array([0x61])));
      service.base64Decode('YWI=').then(result => expect(result).toEqual(new Uint8Array([0x61,0x62])));
      service.base64Decode('YWJj').then(result => expect(result).toEqual(new Uint8Array([0x61,0x62,0x63])));
      service.base64Decode('YWJjZA==').then(result => expect(result).toEqual(new Uint8Array([0x61,0x62,0x63,0x64])));
    })));

    it('can encode hex', async(inject([CryptoService], (service: CryptoService) => {
      service.hexEncode(new Uint8Array([])).then(result => expect(result).toEqual(''));
      service.hexEncode(new Uint8Array([0x0])).then(result => expect(result).toEqual('00'));
      service.hexEncode(new Uint8Array([0x1])).then(result => expect(result).toEqual('01'));
      service.hexEncode(new Uint8Array([0x1a])).then(result => expect(result).toEqual('1a'));
      service.hexEncode(new Uint8Array([0x1A])).then(result => expect(result).toEqual('1a'));
      service.hexEncode(new Uint8Array([0x61])).then(result => expect(result).toEqual('61'));
      service.hexEncode(new Uint8Array([0x61,0x62])).then(result => expect(result).toEqual('6162'));
      service.hexEncode(new Uint8Array([0x61,0x62,0x63])).then(result => expect(result).toEqual('616263'));
      service.hexEncode(new Uint8Array([0x61,0x62,0x63,0x64])).then(result => expect(result).toEqual('61626364'));
    })));

    it('can decode hex', async(inject([CryptoService], (service: CryptoService) => {
      service.hexDecode('').then(result => expect(result).toEqual(new Uint8Array([])));
      service.hexDecode('00').then(result => expect(result).toEqual(new Uint8Array([0x0])));
      service.hexDecode('01').then(result => expect(result).toEqual(new Uint8Array([0x1])));
      service.hexDecode('61').then(result => expect(result).toEqual(new Uint8Array([0x61])));
      service.hexDecode('6162').then(result => expect(result).toEqual(new Uint8Array([0x61,0x62])));
      service.hexDecode('616263').then(result => expect(result).toEqual(new Uint8Array([0x61,0x62,0x63])));
      service.hexDecode('aaBB').then(result => expect(result).toEqual(new Uint8Array([0xAA,0xBB])));

      service.hexDecode('1').then(() => fail("This must not pass")).catch(error => {});
      service.hexDecode('1~').then(() => fail("This must not pass")).catch(error => {});
      service.hexDecode(' 10').then(() => fail("This must not pass")).catch(error => {});
      service.hexDecode('10 ').then(() => fail("This must not pass")).catch(error => {});
      service.hexDecode('1 0').then(() => fail("This must not pass")).catch(error => {});
      service.hexDecode('+1').then(() => fail("This must not pass")).catch(error => {});
      service.hexDecode('-1').then(() => fail("This must not pass")).catch(error => {});
      service.hexDecode('+11').then(() => fail("This must not pass")).catch(error => {});
      service.hexDecode('-11').then(() => fail("This must not pass")).catch(error => {});
      service.hexDecode('xx').then(() => fail("This must not pass")).catch(error => {});
      service.hexDecode('XX').then(() => fail("This must not pass")).catch(error => {});
    })));
  });

  describe('Hashing', () => {
    let h2b = Encoding.fromHex
    let b2h = Encoding.toHex

    it('can hash blake2b-128', async(inject([CryptoService], (service: CryptoService) => {
      // echo -n "abc" | ./b2sum -a blake2b -l 128
      service.blake2b(Blake2bLen.size128, new Uint8Array([])).then(result => expect(b2h(result)).toEqual('cae66941d9efbd404e4d88758ea67670'));
      service.blake2b(Blake2bLen.size128, new Uint8Array([0x61])).then(result => expect(b2h(result)).toEqual('27c35e6e9373877f29e562464e46497e'));
      service.blake2b(Blake2bLen.size128, new Uint8Array([0x61,0x62])).then(result => expect(b2h(result)).toEqual('3dc9ae220222e2e156b2a5abb60d01c7'));
      service.blake2b(Blake2bLen.size128, new Uint8Array([0x61,0x62,0x63])).then(result => expect(b2h(result)).toEqual('cf4ab791c62b8d2b2109c90275287816'));
      service.blake2b(Blake2bLen.size128, new Uint8Array([0x61,0x62,0x63,0x64])).then(result => expect(b2h(result)).toEqual('d2c8e95841ccbc0c3cb3edc9201a6981'));
      service.blake2b(Blake2bLen.size128, new Uint8Array([0x61,0x62,0x63,0x64,0x65])).then(result => expect(b2h(result)).toEqual('a3a3b5a38cf9a32f84b9991697f45702'));
    })));

    it('can hash blake2b-224', async(inject([CryptoService], (service: CryptoService) => {
      // https://github.com/randombit/botan/blob/2.4.0/src/tests/data/hash/blake2b.vec#L1
      service.blake2b(Blake2bLen.size224, h2b('')).then(result => expect(b2h(result)).toEqual('836cc68931c2e4e3e838602eca1902591d216837bafddfe6f0c8cb07'));
      service.blake2b(Blake2bLen.size224, h2b('CC')).then(result => expect(b2h(result)).toEqual('1a926bc943aed563be0f1b2c7e3a64d962e054509018a422d2bdcbbc'));
      service.blake2b(Blake2bLen.size224, h2b('41FB')).then(result => expect(b2h(result)).toEqual('0f13ab23fcea3b2ea5d55452af7266fc40c3c9cf5dd19d26fcefbee7'));
      service.blake2b(Blake2bLen.size224, h2b('1F877C')).then(result => expect(b2h(result)).toEqual('5517b00622a841ed3c3e1579cb9a298f49f293a9f6c97b2f6bf06ec8'));
      service.blake2b(Blake2bLen.size224, h2b('C1ECFDFC')).then(result => expect(b2h(result)).toEqual('da3dbd8c051292cef4492561cf9e13f2633d4a53a042ca6fdb7460c5'));
      service.blake2b(Blake2bLen.size224, h2b('21F134AC57')).then(result => expect(b2h(result)).toEqual('d34caff9fe2a54f665d9f0422d0141acf5585c7a8f222f3fb8d3696c'));
      service.blake2b(Blake2bLen.size224, h2b('C6F50BB74E29')).then(result => expect(b2h(result)).toEqual('746a72a362ac79c5f077820b180fb5fcc5d1aff00d9b71e627c74036'));
      service.blake2b(Blake2bLen.size224, h2b('119713CC83EEEF')).then(result => expect(b2h(result)).toEqual('075194e4614bf009bfa810759489994200190c1f2712daf5766dfd24'));
      service.blake2b(Blake2bLen.size224, h2b('4A4F202484512526')).then(result => expect(b2h(result)).toEqual('9989709d0c5be9353b902acac4617dc028d4195e0a83fcbf3fefa4e0'));
      service.blake2b(Blake2bLen.size224, h2b('1F66AB4185ED9B6375')).then(result => expect(b2h(result)).toEqual('adcac140e02efe54d91be9c3997cec2fd9983e12a83570dfc7d332d6'));
    })));

    it('can hash blake2b-256', async(inject([CryptoService], (service: CryptoService) => {
      // https://github.com/randombit/botan/blob/2.4.0/src/tests/data/hash/blake2b.vec#L770
      service.blake2b(Blake2bLen.size256, h2b('')).then(result => expect(b2h(result)).toEqual('0e5751c026e543b2e8ab2eb06099daa1d1e5df47778f7787faab45cdf12fe3a8'));
      service.blake2b(Blake2bLen.size256, h2b('CC')).then(result => expect(b2h(result)).toEqual('e3f0d5af2a41c8fd042a6ec5fef8acfd591903cbb97a3ab666f08e7c39c8a948'));
      service.blake2b(Blake2bLen.size256, h2b('41FB')).then(result => expect(b2h(result)).toEqual('a464a6ab07b3205c7d44e07dbd83431c2bcbb67739a611748687820e1473b418'));
      service.blake2b(Blake2bLen.size256, h2b('1F877C')).then(result => expect(b2h(result)).toEqual('5868d8802e659afd11b06134af3bde8af8771904d981c670eb5afff39801723e'));
      service.blake2b(Blake2bLen.size256, h2b('C1ECFDFC')).then(result => expect(b2h(result)).toEqual('c86d7b42e003fdf7cf2edecaf72ad31dfcd2e760c2ef3c5271f518b50ebf0948'));
      service.blake2b(Blake2bLen.size256, h2b('21F134AC57')).then(result => expect(b2h(result)).toEqual('07c408f561f4e787c372e2bed3c5e0712974b3779da8bff92c352781620ab9bd'));
      service.blake2b(Blake2bLen.size256, h2b('C6F50BB74E29')).then(result => expect(b2h(result)).toEqual('5d506ac9eb30d9e0aff48367c826337d6c580ef0baa65606ead12e12fee007f6'));
      service.blake2b(Blake2bLen.size256, h2b('119713CC83EEEF')).then(result => expect(b2h(result)).toEqual('1dc248af1b1ab128599207862440a45d1ddcca8684b04f9318561142f1c3db76'));
      service.blake2b(Blake2bLen.size256, h2b('4A4F202484512526')).then(result => expect(b2h(result)).toEqual('508b1db1b81a82b89f1884847f5c32a85414a4c93e49e976adaa41e4678ec3e8'));
      service.blake2b(Blake2bLen.size256, h2b('1F66AB4185ED9B6375')).then(result => expect(b2h(result)).toEqual('d1b8b12a6d5c44515b8ce2836a18330072a7cd0b990a86737a44c3303a7dac50'));
    })));

    it('can hash blake2b-384', async(inject([CryptoService], (service: CryptoService) => {
      // https://github.com/randombit/botan/blob/2.4.0/src/tests/data/hash/blake2b.vec#L1539
      service.blake2b(Blake2bLen.size384, h2b('')).then(result => expect(b2h(result)).toEqual('b32811423377f52d7862286ee1a72ee540524380fda1724a6f25d7978c6fd3244a6caf0498812673c5e05ef583825100'));
      service.blake2b(Blake2bLen.size384, h2b('CC')).then(result => expect(b2h(result)).toEqual('9f520c539e7b9c056895f27718a97990ff374677d08b5c7f307f2f0d6d84d96ce65ee615d19452c7237feb11907d9bb6'));
      service.blake2b(Blake2bLen.size384, h2b('41FB')).then(result => expect(b2h(result)).toEqual('c4131fe792ad9c30f714558c44a37906fe1a959e8f80e590d592b878bc77e52af9870af93240420d2a40fe9dc208ad7e'));
      service.blake2b(Blake2bLen.size384, h2b('1F877C')).then(result => expect(b2h(result)).toEqual('3c93148a342ef7dca597826edb97466148fa217d8761175e5f6dc52461a4e270007e5a0663fbf97cdd894e78140e2663'));
      service.blake2b(Blake2bLen.size384, h2b('C1ECFDFC')).then(result => expect(b2h(result)).toEqual('5f77d0d10c723078fa42127c7bf89e8869503075cd82cf6bb3ebf3a502fea269a2a6f7f216ee159088c781ec47ee0d70'));
      service.blake2b(Blake2bLen.size384, h2b('21F134AC57')).then(result => expect(b2h(result)).toEqual('ab828876b8b36b77b3df9ea8ecd123c248e31faba8372298dba31158ceef8fb6d68d54fa43f784cbefc9a188d1d29f3a'));
      service.blake2b(Blake2bLen.size384, h2b('C6F50BB74E29')).then(result => expect(b2h(result)).toEqual('77c55a5efdac2e9db8c49797c17b1d68942437740648126169dfaf7917af3eddc0184aa0c8cbc185d0df1012393c1780'));
      service.blake2b(Blake2bLen.size384, h2b('119713CC83EEEF')).then(result => expect(b2h(result)).toEqual('a1a60084d6c9a4a9d92653815fbb3e4587b35177112014dad9011338a2d4617cd96071a32344f7547891d23385f0139a'));
      service.blake2b(Blake2bLen.size384, h2b('4A4F202484512526')).then(result => expect(b2h(result)).toEqual('141e5ead3e6f54be88c6069a4c64cc0b591b718778bb3256e85d2707b22211a9b9db86be06d15e3d755f15c45f31e22c'));
      service.blake2b(Blake2bLen.size384, h2b('1F66AB4185ED9B6375')).then(result => expect(b2h(result)).toEqual('cdf2fc66549d6acfbdabc2ea9b5d6d895f4bebd2d1a83fe10eee819ed10a26c6cb0fd7810a74e45cef71964585a87321'));
    })));

    it('can hash blake2b-512', async(inject([CryptoService], (service: CryptoService) => {
      // https://github.com/randombit/botan/blob/2.4.0/src/tests/data/hash/blake2b.vec#L2308
      service.blake2b(Blake2bLen.size512, h2b('')).then(result => expect(b2h(result)).toEqual('786a02f742015903c6c6fd852552d272912f4740e15847618a86e217f71f5419d25e1031afee585313896444934eb04b903a685b1448b755d56f701afe9be2ce'));
      service.blake2b(Blake2bLen.size512, h2b('CC')).then(result => expect(b2h(result)).toEqual('e9bfc0d3aac9639604e9ec53ee0f41282f2df5ea7a0d6e88a620edf208694b96e8b0a8d21f0908bc6af54a05c16b8379a21016843e535d41b7deca17089e4926'));
      service.blake2b(Blake2bLen.size512, h2b('41FB')).then(result => expect(b2h(result)).toEqual('37ce1fe37bcfdf1da0018341e405286ba20ee9de3d674e0768861913864121113d3357a2ba48dcd2e3ac11d69ed4f83664bf1da91e47576c45a8ea06d054a01f'));
      service.blake2b(Blake2bLen.size512, h2b('1F877C')).then(result => expect(b2h(result)).toEqual('f9a58b6f9f3e7355ca9d031e3f5b460f49f7ff9d9ca310d4c6330fa0c869ed15848a9196130430f5f9a1a5dfb7347cb5c444d05ac6234905bdda3d291f046f4b'));
      service.blake2b(Blake2bLen.size512, h2b('C1ECFDFC')).then(result => expect(b2h(result)).toEqual('c524e0f5fc9a535135e9eb6120365e22f0979ff910b24face1468b0e54416dab422425020c0c45cac1763b64e2b7bbdbbfa3314453c7924f6a6ec543eb08f425'));
      service.blake2b(Blake2bLen.size512, h2b('21F134AC57')).then(result => expect(b2h(result)).toEqual('6d132924c50de1017a11e6bb5ec736b2f1617fb7ecf12963cc43f569ea33fdf2c3a17232b30d3054fd7cd8a4b848ece7eabddaf893e9d36499b8e60fe943d723'));
      service.blake2b(Blake2bLen.size512, h2b('C6F50BB74E29')).then(result => expect(b2h(result)).toEqual('aa6a1929b2288692f7fb56da27d1c69ecee2c0a2ed21848201b37fa7860066d0a569c95a8088f7ae04a077c0593520c4a7aa6fb0b0bc79751af076985c998129'));
      service.blake2b(Blake2bLen.size512, h2b('119713CC83EEEF')).then(result => expect(b2h(result)).toEqual('6dde70cb29cf808df56472dbef85fae90f22a947b35f7108a67b1c57ef74339a37beaeec0afc2c1f3e45a582b97de3e140b0a70d234b0a1bb21bf8177868fb1d'));
      service.blake2b(Blake2bLen.size512, h2b('4A4F202484512526')).then(result => expect(b2h(result)).toEqual('fee4f7fe1bb9aee79551f365c1dff2051a40c9953c6e7cf166e63e82abb4e9f19032da2c79a441dc483f6d13619db0a497b59171d5d8bd5cced8ffbde18b2868'));
      service.blake2b(Blake2bLen.size512, h2b('1F66AB4185ED9B6375')).then(result => expect(b2h(result)).toEqual('6587e21d2f9e6ff2fd6d85998c98f9479f3c9a2942f4894422237df6337e7c7c6d7115113ba9779dc7ab9af610602016ef6509d866bda1dc670adb673377596a'));
    })));

    it('can kdf (blake2b) with null values', async(inject([CryptoService], (service: CryptoService) => {
      // BLAKE2B-subkeylen(key=key, message={}, salt=subkey_id || {0}, personal=ctx || {0})
      // Python adds 0-padding to the right up to salt 16 Bytes, person: 16 Bytes

      {
        // python3 -c 'import hashlib; print(hashlib.blake2b(digest_size=32, key=bytes.fromhex("0000000000000000000000000000000000000000000000000000000000000000"), salt=bytes.fromhex("00000000000000000000000000000000"), person=bytes.fromhex("43484154434841540000000000000000")).hexdigest())'
        let masterKey = new MasterKey(Encoding.fromHex('0000000000000000000000000000000000000000000000000000000000000000'));
        let context = "CHATCHAT"; // 8 bytes string, padded to 16 bytes
        let subkey = 0x00;
        service.blake2bKdf(subkey, context, masterKey).then(result => {
          expect(b2h(result)).toEqual('2f8a6e0e76b6492ac0b63f7686332d7c9b195c2bc6ba799bb87e56548ffe2ae3');
        });
      }

      { // subkey set (manipulates left-most byte of salt)
        // python3 -c 'import hashlib; print(hashlib.blake2b(digest_size=32, key=bytes.fromhex("0000000000000000000000000000000000000000000000000000000000000000"), salt=bytes.fromhex("01000000000000000000000000000000"), person=bytes.fromhex("43484154434841540000000000000000")).hexdigest())'
        let masterKey = new MasterKey(Encoding.fromHex('0000000000000000000000000000000000000000000000000000000000000000'));
        let context = "CHATCHAT"; // 8 bytes string, padded to 16 bytes
        let subkey = 0x01;
        service.blake2bKdf(subkey, context, masterKey).then(result => {
          expect(b2h(result)).toEqual('e18290edad41566454d0120ed04965cd6ff0a98025f325e139ef6fe1cbc16499');
        });
      }

      { // subkey set to two-byte number (manipulates two left-most byte of salt, order reversed)
        // python3 -c 'import hashlib; print(hashlib.blake2b(digest_size=32, key=bytes.fromhex("0000000000000000000000000000000000000000000000000000000000000000"), salt=bytes.fromhex("aa110000000000000000000000000000"), person=bytes.fromhex("43484154434841540000000000000000")).hexdigest())'
        let masterKey = new MasterKey(Encoding.fromHex('0000000000000000000000000000000000000000000000000000000000000000'));
        let context = "CHATCHAT"; // 8 bytes string, padded to 16 bytes
        let subkey = 0x11aa;
        service.blake2bKdf(subkey, context, masterKey).then(result => {
          expect(b2h(result)).toEqual('db9a77fafe2a7dbfaa6e3d963adfd7b4ce10bdc2859db80880becc2812923adb');
        });
      }

      { // subkey set to four-byte number (manipulates two four-most byte of salt, order reversed)
        // python3 -c 'import hashlib; print(hashlib.blake2b(digest_size=32, key=bytes.fromhex("0000000000000000000000000000000000000000000000000000000000000000"), salt=bytes.fromhex("ffffff7f000000000000000000000000"), person=bytes.fromhex("43484154434841540000000000000000")).hexdigest())'
        let masterKey = new MasterKey(Encoding.fromHex('0000000000000000000000000000000000000000000000000000000000000000'));
        let context = "CHATCHAT"; // 8 bytes string, padded to 16 bytes
        let subkey = 0x7FFFFFFF;
        service.blake2bKdf(subkey, context, masterKey).then(result => {
          expect(b2h(result)).toEqual('d3cf5331dba021cb20d633ab5c9670390e54d1cdf450091be65743016326072a');
        });
      }

      // broken, see https://github.com/jedisct1/libsodium.js/issues/135
      //{ // subkey set to four-byte number (manipulates two four-most byte of salt, order reversed)
      //  // python3 -c 'import hashlib; print(hashlib.blake2b(digest_size=32, key=bytes.fromhex("0000000000000000000000000000000000000000000000000000000000000000"), salt=bytes.fromhex("00000080000000000000000000000000"), person=bytes.fromhex("43484154434841540000000000000000")).hexdigest())'
      //  let masterKey = new MasterKey(Encoding.fromHex('0000000000000000000000000000000000000000000000000000000000000000'));
      //  let context = "CHATCHAT"; // 8 bytes string, padded to 16 bytes
      //  let subkey = 0x80000000;
      //  service.blake2bKdf(subkey, context, masterKey).then(result => {
      //    expect(b2h(result)).toEqual('fdd6c47a47684d3c1e5236fe1d28187c220b22db6b12b87dcf9f8c4b58373c68');
      //  });
      //}
    })));

    it('can kdf', async(inject([CryptoService], (service: CryptoService) => {
      { // loginKey
        // python3 -c 'import hashlib; print(hashlib.blake2b(digest_size=32, key=bytes.fromhex("0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF"), salt=bytes.fromhex("01000000000000000000000000000000"), person=bytes.fromhex("43484154763030310000000000000000")).hexdigest())'
        let masterKey = new MasterKey(Encoding.fromHex('0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF'));
        let subkey = Subkey.loginKey;
        service.kdf(subkey, masterKey).then(result => {
          expect(b2h(result)).toEqual('8694ed3dd35635bef850edc16cd8ba2033cf6e57ba9c04e612f852ebb90d73f9');
        });
      }

      { // passwordVerificationKey
        // python3 -c 'import hashlib; print(hashlib.blake2b(digest_size=32, key=bytes.fromhex("0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF"), salt=bytes.fromhex("02000000000000000000000000000000"), person=bytes.fromhex("43484154763030310000000000000000")).hexdigest())'
        let masterKey = new MasterKey(Encoding.fromHex('0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF'));
        let subkey = Subkey.passwordVerificationKey;
        service.kdf(subkey, masterKey).then(result => {
          expect(b2h(result)).toEqual('2bd9f5205e8e09ec7c79975daa23d6e0a72afb1c1ca886e1f5bd17b7dd390ffd');
        });
      }

      { // encryptionPrivkeyEncryptingKey
        // python3 -c 'import hashlib; print(hashlib.blake2b(digest_size=32, key=bytes.fromhex("0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF"), salt=bytes.fromhex("03000000000000000000000000000000"), person=bytes.fromhex("43484154763030310000000000000000")).hexdigest())'
        let masterKey = new MasterKey(Encoding.fromHex('0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF'));
        let subkey = Subkey.encryptionPrivkeyEncryptingKey;
        service.kdf(subkey, masterKey).then(result => {
          expect(b2h(result)).toEqual('5e388a104845d0d18ee739ca074cdd1ce03558c2f0addb8e5a353823a18d0fad');
        });
      }

      { // Test vectors from external script using C libsodium
        let masterKey = new MasterKey(Encoding.fromBase64("27atcsOrVKUFdN9oJgF5VyGeRezuAM5+5MyWNRUu1AM="));
        service.kdf(Subkey.loginKey, masterKey).then(result => {
          expect(result).toEqual(Encoding.fromBase64('V0nrrLcHcPcf1nuQoTnBIDKczv+LbXjJeTKyL5LTW+o='));
        });
        service.kdf(Subkey.passwordVerificationKey, masterKey).then(result => {
          expect(result).toEqual(Encoding.fromBase64('iNMTjnqTkFnnyZgumYzpHgpdFZAdX0x+CCso4Rsy3eM='));
        });
        service.kdf(Subkey.encryptionPrivkeyEncryptingKey, masterKey).then(result => {
          expect(result).toEqual(Encoding.fromBase64('Ygs/fQQXBAr18hd8h+GBtCOniPQ6bTAYaLvntI8bMic='));
        });
      }
    })));
  });

  describe('Identifiers', () => {
    it('can create fingerprint', async(inject([CryptoService], (service: CryptoService) => {
      let input = new Uint8Array([0x61, 0x62, 0x63]);
      service.makeFingerprint(input).then(fingerprint => {
        expect(fingerprint).toBeTruthy();
        expect(fingerprint).toEqual(jasmine.any(String))
        expect(fingerprint.length).toEqual(32 /* = 16 bytes = 128 bit */);
        expect(fingerprint).toMatch(/^[0-9a-f]+$/);
      });
    })));

    it('can generate random id', async(inject([CryptoService], (service: CryptoService) => {
      service.generateRandomId().then(id => {
        expect(id).toBeTruthy();
        expect(id.length).toEqual(32 /* 16 bytes, 128 bit */);
        expect(id).toMatch(/^[0-9a-f]+$/);
      })
    })));
  });

  describe('Ed25519 signatures', () => {
    it('can generate keypair', async(inject([CryptoService], (service: CryptoService) => {
      service.generateEd25519Keypair().then(keypair => {
        expect(keypair).toBeTruthy()
        expect(keypair.pubkey).toBeTruthy()
        expect(keypair.privkey).toBeTruthy()
        expect(keypair.pubkey.data.length).toEqual(32);
        expect(keypair.privkey.data.length).toEqual(64);
        // pubkey is suffix of privkey (see comment in https://tools.ietf.org/html/rfc8032#section-7.1)
        expect(keypair.privkey.data.slice(32,64)).toEqual(keypair.pubkey.data);
      })
    })));

    it('can sign and verify (attached)', async(inject([CryptoService], (service: CryptoService) => {
      let SIGNATURE_LENGTH = 64;

      (async () => {
        let keypair = await service.generateEd25519Keypair();

        let message = Encoding.toUtf8("Hello world");
        expect(message.byteLength).toEqual(11);

        let signed = await service.signEd25519(message, keypair.privkey);
        expect(signed).toBeTruthy();
        expect(signed.byteLength).toEqual(SIGNATURE_LENGTH + 11);
        expect(signed.slice(SIGNATURE_LENGTH + 0, SIGNATURE_LENGTH + 11)).toEqual(message);

        {
          let verified = await service.verifyEd25519(signed, keypair.pubkey);
          expect(verified).toBeTruthy();
          expect(verified).toEqual(message);
        }

        {
          let corruptedMessage = new Uint8Array(signed);
          corruptedMessage[74] ^= 0x01;
          await service.verifyEd25519(corruptedMessage, keypair.pubkey)
            .then(
              message => { fail("Promise must not resolve") },
              error => { expect(error).toMatch(/incorrect signature for the given public key/) }
            )
        }

        {
          let corruptedSignature = new Uint8Array(signed);
          corruptedSignature[0] ^= 0x01;
          await service.verifyEd25519(corruptedSignature, keypair.pubkey)
            .then(
              message => { fail("Promise must not resolve") },
              error => { expect(error).toMatch(/incorrect signature for the given public key/) }
            )
        }
      })();
    })));

    it('can sign and verify (detached)', async(inject([CryptoService], (service: CryptoService) => {
      let SIGNATURE_LENGTH = 64;

      (async () => {
        let keypair = await service.generateEd25519Keypair();

        let message = Encoding.toUtf8("Hello world");
        expect(message.byteLength).toEqual(11);

        let signature = await service.makeEd25519Signature(message, keypair.privkey);
        expect(signature).toBeTruthy();
        expect(signature.data.length).toEqual(SIGNATURE_LENGTH);

        {
          let ok = await service.verifyEd25519Signature(signature, message, keypair.pubkey);
          expect(ok).toEqual(true);
        }

        {
          let corruptedMessage = new Uint8Array(message);
          corruptedMessage[0] ^= 0x01;
          let ok = await service.verifyEd25519Signature(signature, corruptedMessage, keypair.pubkey);
          expect(ok).toEqual(false);
        }

        {
          let corruptedSignatureData = new Uint8Array(signature.data);
          corruptedSignatureData[0] ^= 0x01;
          let ok = await service.verifyEd25519Signature(new Ed25519Signature(corruptedSignatureData), message, keypair.pubkey);
          expect(ok).toEqual(false);
        }
      })();
    })));

    it('match test vectors (detached)',  async(inject([CryptoService], (service: CryptoService) => {
      (async () => {
        { // TEST 1 from https://tools.ietf.org/html/rfc8032#section-7.1
          let privkey = new Ed25519Privkey(Encoding.fromHex("9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a"));
          let pubkey = new Ed25519Pubkey(Encoding.fromHex("d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a"));
          let message = Encoding.fromHex("");
          let signature = await service.makeEd25519Signature(message, privkey);
          expect(signature.data).toEqual(Encoding.fromHex("e5564300c360ac729086e2cc806e828a84877f1eb8e5d974d873e065224901555fb8821590a33bacc61e39701cf9b46bd25bf5f0595bbe24655141438e7a100b"));
        }

        { // TEST 2 from https://tools.ietf.org/html/rfc8032#section-7.1
          let privkey = new Ed25519Privkey(Encoding.fromHex("4ccd089b28ff96da9db6c346ec114e0f5b8a319f35aba624da8cf6ed4fb8a6fb3d4017c3e843895a92b70aa74d1b7ebc9c982ccf2ec4968cc0cd55f12af4660c"));
          let pubkey = new Ed25519Pubkey(Encoding.fromHex("3d4017c3e843895a92b70aa74d1b7ebc9c982ccf2ec4968cc0cd55f12af4660c"));
          let message = Encoding.fromHex("72");
          let signature = await service.makeEd25519Signature(message, privkey);
          expect(signature.data).toEqual(Encoding.fromHex("92a009a9f0d4cab8720e820b5f642540a2b27b5416503f8fb3762223ebdb69da085ac1e43e15996e458f3613d0f11d8c387b2eaeb4302aeeb00d291612bb0c00"));
        }

        { // TEST 3 from https://tools.ietf.org/html/rfc8032#section-7.1
          let privkey = new Ed25519Privkey(Encoding.fromHex("c5aa8df43f9f837bedb7442f31dcb7b166d38535076f094b85ce3a2e0b4458f7fc51cd8e6218a1a38da47ed00230f0580816ed13ba3303ac5deb911548908025"));
          let pubkey = new Ed25519Pubkey(Encoding.fromHex("fc51cd8e6218a1a38da47ed00230f0580816ed13ba3303ac5deb911548908025"));
          let message = Encoding.fromHex("af82");
          let signature = await service.makeEd25519Signature(message, privkey);
          expect(signature.data).toEqual(Encoding.fromHex("6291d657deec24024827e69c3abe01a30ce548a284743a445e3680d7db5ac3ac18ff9b538d16f290ae67f760984dc6594a7c15e9716ed28dc027beceea1ec40a"));
        }

        { // TEST 1024 from https://tools.ietf.org/html/rfc8032#section-7.1
          let privkey = new Ed25519Privkey(Encoding.fromHex("f5e5767cf153319517630f226876b86c8160cc583bc013744c6bf255f5cc0ee5278117fc144c72340f67d0f2316e8386ceffbf2b2428c9c51fef7c597f1d426e"));
          let pubkey = new Ed25519Pubkey(Encoding.fromHex("278117fc144c72340f67d0f2316e8386ceffbf2b2428c9c51fef7c597f1d426e"));
          let message = Encoding.fromHex("08b8b2b733424243760fe426a4b54908632110a66c2f6591eabd3345e3e4eb98fa6e264bf09efe12ee50f8f54e9f77b1e355f6c50544e23fb1433ddf73be84d879de7c0046dc4996d9e773f4bc9efe5738829adb26c81b37c93a1b270b20329d658675fc6ea534e0810a4432826bf58c941efb65d57a338bbd2e26640f89ffbc1a858efcb8550ee3a5e1998bd177e93a7363c344fe6b199ee5d02e82d522c4feba15452f80288a821a579116ec6dad2b3b310da903401aa62100ab5d1a36553e06203b33890cc9b832f79ef80560ccb9a39ce767967ed628c6ad573cb116dbefefd75499da96bd68a8a97b928a8bbc103b6621fcde2beca1231d206be6cd9ec7aff6f6c94fcd7204ed3455c68c83f4a41da4af2b74ef5c53f1d8ac70bdcb7ed185ce81bd84359d44254d95629e9855a94a7c1958d1f8ada5d0532ed8a5aa3fb2d17ba70eb6248e594e1a2297acbbb39d502f1a8c6eb6f1ce22b3de1a1f40cc24554119a831a9aad6079cad88425de6bde1a9187ebb6092cf67bf2b13fd65f27088d78b7e883c8759d2c4f5c65adb7553878ad575f9fad878e80a0c9ba63bcbcc2732e69485bbc9c90bfbd62481d9089beccf80cfe2df16a2cf65bd92dd597b0707e0917af48bbb75fed413d238f5555a7a569d80c3414a8d0859dc65a46128bab27af87a71314f318c782b23ebfe808b82b0ce26401d2e22f04d83d1255dc51addd3b75a2b1ae0784504df543af8969be3ea7082ff7fc9888c144da2af58429ec96031dbcad3dad9af0dcbaaaf268cb8fcffead94f3c7ca495e056a9b47acdb751fb73e666c6c655ade8297297d07ad1ba5e43f1bca32301651339e22904cc8c42f58c30c04aafdb038dda0847dd988dcda6f3bfd15c4b4c4525004aa06eeff8ca61783aacec57fb3d1f92b0fe2fd1a85f6724517b65e614ad6808d6f6ee34dff7310fdc82aebfd904b01e1dc54b2927094b2db68d6f903b68401adebf5a7e08d78ff4ef5d63653a65040cf9bfd4aca7984a74d37145986780fc0b16ac451649de6188a7dbdf191f64b5fc5e2ab47b57f7f7276cd419c17a3ca8e1b939ae49e488acba6b965610b5480109c8b17b80e1b7b750dfc7598d5d5011fd2dcc5600a32ef5b52a1ecc820e308aa342721aac0943bf6686b64b2579376504ccc493d97e6aed3fb0f9cd71a43dd497f01f17c0e2cb3797aa2a2f256656168e6c496afc5fb93246f6b1116398a346f1a641f3b041e989f7914f90cc2c7fff357876e506b50d334ba77c225bc307ba537152f3f1610e4eafe595f6d9d90d11faa933a15ef1369546868a7f3a45a96768d40fd9d03412c091c6315cf4fde7cb68606937380db2eaaa707b4c4185c32eddcdd306705e4dc1ffc872eeee475a64dfac86aba41c0618983f8741c5ef68d3a101e8a3b8cac60c905c15fc910840b94c00a0b9d0");
          let signature = await service.makeEd25519Signature(message, privkey);
          expect(signature.data).toEqual(Encoding.fromHex("0aab4c900501b3e24d7cdf4663326a3a87df5e4843b2cbdb67cbf6e460fec350aa5371b1508f9f4528ecea23c436d94b5e8fcd4f681e30a6ac00a9704a188a03"));
        }
      })();
    })));

    it('match test vectors (attached)',  async(inject([CryptoService], (service: CryptoService) => {
      (async () => {
        { // TEST 1 from https://tools.ietf.org/html/rfc8032#section-7.1
          let privkey = new Ed25519Privkey(Encoding.fromHex("9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a"));
          let pubkey = new Ed25519Pubkey(Encoding.fromHex("d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a"));
          let message = Encoding.fromHex("");
          let signedMessage = await service.signEd25519(message, privkey);
          expect(signedMessage.slice(0,64)).toEqual(Encoding.fromHex("e5564300c360ac729086e2cc806e828a84877f1eb8e5d974d873e065224901555fb8821590a33bacc61e39701cf9b46bd25bf5f0595bbe24655141438e7a100b"));
          expect(signedMessage.slice(64)).toEqual(message);
        }

        { // TEST 2 from https://tools.ietf.org/html/rfc8032#section-7.1
          let privkey = new Ed25519Privkey(Encoding.fromHex("4ccd089b28ff96da9db6c346ec114e0f5b8a319f35aba624da8cf6ed4fb8a6fb3d4017c3e843895a92b70aa74d1b7ebc9c982ccf2ec4968cc0cd55f12af4660c"));
          let pubkey = new Ed25519Pubkey(Encoding.fromHex("3d4017c3e843895a92b70aa74d1b7ebc9c982ccf2ec4968cc0cd55f12af4660c"));
          let message = Encoding.fromHex("72");
          let signedMessage = await service.signEd25519(message, privkey);
          expect(signedMessage.slice(0,64)).toEqual(Encoding.fromHex("92a009a9f0d4cab8720e820b5f642540a2b27b5416503f8fb3762223ebdb69da085ac1e43e15996e458f3613d0f11d8c387b2eaeb4302aeeb00d291612bb0c00"));
          expect(signedMessage.slice(64)).toEqual(message);
        }

        { // TEST 3 from https://tools.ietf.org/html/rfc8032#section-7.1
          let privkey = new Ed25519Privkey(Encoding.fromHex("c5aa8df43f9f837bedb7442f31dcb7b166d38535076f094b85ce3a2e0b4458f7fc51cd8e6218a1a38da47ed00230f0580816ed13ba3303ac5deb911548908025"));
          let pubkey = new Ed25519Pubkey(Encoding.fromHex("fc51cd8e6218a1a38da47ed00230f0580816ed13ba3303ac5deb911548908025"));
          let message = Encoding.fromHex("af82");
          let signedMessage = await service.signEd25519(message, privkey);
          expect(signedMessage.slice(0,64)).toEqual(Encoding.fromHex("6291d657deec24024827e69c3abe01a30ce548a284743a445e3680d7db5ac3ac18ff9b538d16f290ae67f760984dc6594a7c15e9716ed28dc027beceea1ec40a"));
          expect(signedMessage.slice(64)).toEqual(message);
        }

        { // TEST 1024 from https://tools.ietf.org/html/rfc8032#section-7.1
          let privkey = new Ed25519Privkey(Encoding.fromHex("f5e5767cf153319517630f226876b86c8160cc583bc013744c6bf255f5cc0ee5278117fc144c72340f67d0f2316e8386ceffbf2b2428c9c51fef7c597f1d426e"));
          let pubkey = new Ed25519Pubkey(Encoding.fromHex("278117fc144c72340f67d0f2316e8386ceffbf2b2428c9c51fef7c597f1d426e"));
          let message = Encoding.fromHex("08b8b2b733424243760fe426a4b54908632110a66c2f6591eabd3345e3e4eb98fa6e264bf09efe12ee50f8f54e9f77b1e355f6c50544e23fb1433ddf73be84d879de7c0046dc4996d9e773f4bc9efe5738829adb26c81b37c93a1b270b20329d658675fc6ea534e0810a4432826bf58c941efb65d57a338bbd2e26640f89ffbc1a858efcb8550ee3a5e1998bd177e93a7363c344fe6b199ee5d02e82d522c4feba15452f80288a821a579116ec6dad2b3b310da903401aa62100ab5d1a36553e06203b33890cc9b832f79ef80560ccb9a39ce767967ed628c6ad573cb116dbefefd75499da96bd68a8a97b928a8bbc103b6621fcde2beca1231d206be6cd9ec7aff6f6c94fcd7204ed3455c68c83f4a41da4af2b74ef5c53f1d8ac70bdcb7ed185ce81bd84359d44254d95629e9855a94a7c1958d1f8ada5d0532ed8a5aa3fb2d17ba70eb6248e594e1a2297acbbb39d502f1a8c6eb6f1ce22b3de1a1f40cc24554119a831a9aad6079cad88425de6bde1a9187ebb6092cf67bf2b13fd65f27088d78b7e883c8759d2c4f5c65adb7553878ad575f9fad878e80a0c9ba63bcbcc2732e69485bbc9c90bfbd62481d9089beccf80cfe2df16a2cf65bd92dd597b0707e0917af48bbb75fed413d238f5555a7a569d80c3414a8d0859dc65a46128bab27af87a71314f318c782b23ebfe808b82b0ce26401d2e22f04d83d1255dc51addd3b75a2b1ae0784504df543af8969be3ea7082ff7fc9888c144da2af58429ec96031dbcad3dad9af0dcbaaaf268cb8fcffead94f3c7ca495e056a9b47acdb751fb73e666c6c655ade8297297d07ad1ba5e43f1bca32301651339e22904cc8c42f58c30c04aafdb038dda0847dd988dcda6f3bfd15c4b4c4525004aa06eeff8ca61783aacec57fb3d1f92b0fe2fd1a85f6724517b65e614ad6808d6f6ee34dff7310fdc82aebfd904b01e1dc54b2927094b2db68d6f903b68401adebf5a7e08d78ff4ef5d63653a65040cf9bfd4aca7984a74d37145986780fc0b16ac451649de6188a7dbdf191f64b5fc5e2ab47b57f7f7276cd419c17a3ca8e1b939ae49e488acba6b965610b5480109c8b17b80e1b7b750dfc7598d5d5011fd2dcc5600a32ef5b52a1ecc820e308aa342721aac0943bf6686b64b2579376504ccc493d97e6aed3fb0f9cd71a43dd497f01f17c0e2cb3797aa2a2f256656168e6c496afc5fb93246f6b1116398a346f1a641f3b041e989f7914f90cc2c7fff357876e506b50d334ba77c225bc307ba537152f3f1610e4eafe595f6d9d90d11faa933a15ef1369546868a7f3a45a96768d40fd9d03412c091c6315cf4fde7cb68606937380db2eaaa707b4c4185c32eddcdd306705e4dc1ffc872eeee475a64dfac86aba41c0618983f8741c5ef68d3a101e8a3b8cac60c905c15fc910840b94c00a0b9d0");
          let signedMessage = await service.signEd25519(message, privkey);
          expect(signedMessage.slice(0,64)).toEqual(Encoding.fromHex("0aab4c900501b3e24d7cdf4663326a3a87df5e4843b2cbdb67cbf6e460fec350aa5371b1508f9f4528ecea23c436d94b5e8fcd4f681e30a6ac00a9704a188a03"));
          expect(signedMessage.slice(64)).toEqual(message);
        }
      })();
    })));
  });

  describe('Public-key encryption', () => {
    it('can generate keypair', async(inject([CryptoService], (service: CryptoService) => {
      service.generateEncryptionKeypair().then(keypair => {
        expect(keypair).toBeTruthy()
        expect(keypair.pubkey).toBeTruthy()
        expect(keypair.privkey).toBeTruthy()
        expect(keypair.pubkey.data.length).toBeGreaterThan(0);
        expect(keypair.privkey.data.length).toBeGreaterThan(0);
      });
    })));

    it('can encrypt and decrypt', async(inject([CryptoService], (service: CryptoService) => {
      (async () => {
        let keypairAlice = await service.generateEncryptionKeypair();
        let keypairBob = await service.generateEncryptionKeypair();
        expect(keypairAlice).toBeTruthy();
        expect(keypairBob).toBeTruthy();

        let message = Encoding.fromHex('AABBCCDD');

        let encrypted = await service.encryptWithPubkey(message, keypairBob.pubkey);
        expect(encrypted.length).toBeGreaterThan(0);

        let decrypted = await service.decryptWithPrivkey(encrypted, keypairBob)
        expect(decrypted).toEqual(message);
      })();
    })));

    it('decrypt failure', async(inject([CryptoService], (service: CryptoService) => {
      (async () => {
        let keypairAlice = await service.generateEncryptionKeypair();
        let keypairBob = await service.generateEncryptionKeypair();

        let message = Encoding.fromHex('AABBCCDD');

        let encrypted = await service.encryptWithPubkey(message, keypairBob.pubkey);

        let corruptedNonce = new Uint8Array(encrypted)
        corruptedNonce[0] ^= 0x01
        await service.decryptWithPrivkey(corruptedNonce, keypairBob)
          .then(() => fail("must not resolve"))
          .catch(e => expect(e).toMatch(/incorrect key pair/));

        let corruptedMessageBegin = new Uint8Array(encrypted)
        corruptedMessageBegin[24] ^= 0x01
        await service.decryptWithPrivkey(corruptedMessageBegin, keypairBob)
          .then(() => fail("must not resolve"))
          .catch(e => expect(e).toMatch(/incorrect key pair/));

        let corruptedMessageEnd = new Uint8Array(encrypted)
        corruptedMessageEnd[corruptedMessageEnd.length-1] ^= 0x01
        await service.decryptWithPrivkey(corruptedMessageBegin, keypairBob)
          .then(() => fail("must not resolve"))
          .catch(e => expect(e).toMatch(/incorrect key pair/));
        })();
    })));
  });

  describe('Symmetric encryption', () => {
    it('can generate encryption key', async(inject([CryptoService], (service: CryptoService) => {
      service.generateSymmetricKey().then(key => {
        expect(key).toBeTruthy()
        expect(key.data).toBeTruthy()
        expect(key.data.length).toEqual(32 /* 256 bit */);
      })
    })));

    it('can generate encryption nonce', async(inject([CryptoService], (service: CryptoService) => {
      service.generateSymmetricEncrytionNonce().then(nonce => {
        expect(nonce).toBeTruthy()
        expect(nonce.length).toEqual(12 /* 96 bit */);
      })
    })));

    it('can encrypt/decrypt', async(inject([CryptoService], (service: CryptoService) => {
      service.generateSymmetricKey().then(async key => {
        { // some message
          let testData = new Uint8Array([0x44, 0x55, 0x66, 0x77, 0x88, 0x99]);
          let encryted = await service.encryptWithSymmetricKey(testData, key);
          expect(encryted.length).toEqual(12 /* nonce */ + 6 /* ciphertext */ + 16 /* mac */);
          let decrypted = await service.decryptWithSymmetricKey(encryted, key);
          expect(decrypted).toEqual(testData);
        }
        { // empty message
          let testData = new Uint8Array([]);
          let encryted = await service.encryptWithSymmetricKey(testData, key);
          expect(encryted.length).toEqual(12 /* nonce */ + 0 /* ciphertext */ + 16 /* mac */);
          let decrypted = await service.decryptWithSymmetricKey(encryted, key);
          expect(decrypted).toEqual(testData);
        }
        { // long message
          let testData = new Uint8Array([
            0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF,
            0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF,
            0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF,
            0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF,
            0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF,
            0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF,
            0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF,
            0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF,
            0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF,
            0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF,
            0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF,
            0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF,
            0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF,
            0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF,
            0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF,
            0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF,
          ]);
          let encryted = await service.encryptWithSymmetricKey(testData, key);
          expect(encryted.length).toEqual(12 /* nonce */ + 256 /* ciphertext */ + 16 /* mac */);
          let decrypted = await service.decryptWithSymmetricKey(encryted, key);
          expect(decrypted).toEqual(testData);
        }
      })
    })));

    it('chacha20Poly1305IetfEncrypt conforms to Botan implementation ', async(inject([CryptoService], (service: CryptoService) => {
      // echo -n "" | ./botan encryption --mode=chacha20poly1305 --iv=000000000000000000000000 --ad= --key=0000000000000000000000000000000000000000000000000000000000000000 | xxd -p

      { // zero key, zero nonce
        let key = Encoding.fromHex("0000000000000000000000000000000000000000000000000000000000000000");
        let nonce = Encoding.fromHex("000000000000000000000000");

        service.chacha20Poly1305IetfEncrypt(Encoding.fromHex(""), key, nonce).then(cipher => {
          expect(cipher).toEqual(Encoding.fromHex("4eb972c9a8fb3a1b382bb4d36f5ffad1"));
        });

        service.chacha20Poly1305IetfEncrypt(Encoding.fromHex("61"), key, nonce).then(cipher => {
          expect(cipher).toEqual(Encoding.fromHex("fe5d60e2e3898937158409d13ee78aa0bd"));
        });

        service.chacha20Poly1305IetfEncrypt(Encoding.fromHex("6162"), key, nonce).then(cipher => {
          expect(cipher).toEqual(Encoding.fromHex("fe65cf6de21853d705bc5d128bca78c9d78b"));
        });

        service.chacha20Poly1305IetfEncrypt(Encoding.fromHex("064da8e7bec4d505afe9ad1c491b1110bfd92fe244f776a02ab3c19fe9e5a0846f6cecade3a06cb9d4e81f1b022ac6e6a62c3a75fa62b25dde1c201e8ce7331d7092603627637a4083606be21ba254b88be85e9a12491989970c2b30ce157f14e02cf59eff63cfe550b35ece224b1afab7dab9b56baa977be08ba40cd809cc725d2ef345fe64e35d783adfb6ef5bf6b215261ee523ac2f7144c0b00c6c0381838362369296687713e241fb9a7172e459e41af00651701cabc7ef969d59295ff09633c8dc0356cd570b4e0a49e62db3bdbed375a60940cecda5651f3072fa4b2082ceb4d916c76fede20362f8943a68453d71cceb15a3df86b38c2299bf64110b2921b76d3cb5aee168db554dc7f66965af044c853d500746055364c446f6551fcf492b403ba730703f96480fcdfd0b5c0540034a930d9e5b3d86050bb30c0501e3feb7262207e708243cb6c7ee6e76dac596c42bb9ffcf691a7ddbb2461bfcd9698df133b6fc7585bdb50faaf9d115c836a35838cac92ea9bc122704d4014d60939b69e27404afc6d31e7db00d7f969d69ca083f09125c23a8faab7e1f0f3e4eb9263bb14251aa4678974b372f972265731df35b3d63069619d1f52c36666063449b93ebfb5db7c390b8abb9d8df8308306a919d4460416a395a4fdc0daecd3bf2b9143123f44e4ff06d8720cdad07fe55a1fd6c832146c571ce7b0b3fd13497ce5f1802e0c7ffb28e9a54b5f02c43e63d1ec96c36ca18182b860ff0a629ac521b806098907c71083edc1f2cbdf628ef7dc1a28bbd98eafce9527bf3ffe2c37f7e779d5d5d89fcf3c54212d4df04cb580a4474d066264a1a7ba6f7c3128d0a799f518e45e8a5810e8196ace4641ecdcc2181b7c71048159165f67ff5a24b9a3c7eab367c82ad1ffe4356294b4e540ca6d2070dbbabef6e1d6f5fed5b7deddb1a35911840c90971ec35c6f37bf496bba49da7ca10ee8650103ef1b77a43f2d8ab8e2c0836711887187ef3235f711d589a769c63522db697de4d2410c22c1b191c195584a6a1c45015f9cd2614cd0f9c5e81df1d40430f8eb7c772222c36a0d440b8004f9731547dcba2001eb5291c6e4573ee10e4f66afb684d06cd8022aaf5aa31c1cd428e3438fdb0333229649820727a963e842d00daf33fe472d9c6cb8fe8280025dabda1013dfa18a003d1f2d8b2efa482a2f95ac47cc0ab8d6a8436e83d7250b808851340e65190a2b02d4405dafb7383880adbb1b573abce1c918d4f448cc13df51ec85e98b5e0246d09951a969ec5a2f443df875a206eb1565cf0e563fcc6a037d7a1aa6aad7b0965aa3120b1a17f5ff8dbdc4471469082e3eab5acf509978913d8ff11e83c9473b73eb2757343fa066dcf1104dd1e633caebbb54d644491f9d2dcbb1c9a5a5687d9438d37fa96b780ae745fd7787612fa9e46d26c31"), key, nonce).then(cipher => {
          expect(cipher).toEqual(Encoding.fromHex("994a4f59eb95ed7f37533a603a36191d74d606420c1413c9387592a1db0bda6946dbcddb7f4622fa01992cab76f2ff3397c1255dab68491872fd2a01c79e7e725d9bc0d0444516a12d1ebaea02caf4cd0599d003699a7b4f27cf6d0467b5cc49e10bc2f6e01892ea78ad6433c613a6e4c4086aa6a26503bbbf78d56e98ab84804e0e531d29d7b536ad1a051cd18949b8d09eafc5d829080287a32738d85f1027aeb6fd116eec7a3d0ff0a38961104866fb3608f93cbd04fd2f8588f1684e498e739540a8281108faf017de9690d0ae0c5bcd959d15e936e76f7221ebf988d867cc702cd6868a7f24f44749bf179a81c1bb7d7a22421043be5e03735645c29b46c93192cea0e5eba7d107414b601d4170b1551c528f54bde11c87945544e442c493b89e8877e8976ab80058ae6b68a70e791b553dd966147a976e838e35820c4d1160432f28f04e04e4423ed0443cf1b9bcebf81892980522db6dbf9e674a109e87093abff4242a955f1dc4b23a662697104b9ba2d8789268cc6350b3b5393e4e7e31deafd545a00686f47b3c9496b097a2293ff0542c5cc61bd9a480c404a7493ef6fcbf49afebde92f013ea75f6d93a9f300adace78e9774a29e83b2071e4b85813b13ec78c59be258a9df1f062770c802a39418142b2b9e0c0a3978df92083a2b02593e7d96143a765c030c6fa5324a9fe40d4179aa9df5c2fdb74b471f02ed76f08640d7bfad9f5d24acffc6a6a9d864654f1937c6dbe59b81adef84a089c18cefe1b75f67032ce3b2a030a66adfb9e72738fb093539f5ac7309094bd17c0137d30e7a59c81f5ef8936cc1e726f2d5b5f41139007c04c134cac05e7c68dfb67e2ceb5e2643fb4dff461874e622a4cbdf3e1cfbcedfa2e19b78dc2c6749cfce7d9316b9f45780795c19615e855161a1c6b81608afcfacfaf723da01d368136223d25889171d8e7d8fefaa04df811f0bb5b44bee3ab35d414b62872c5ba6686462dd01c47775ad891d0613cb1ab19e72901c74a3a0e1ab6a8c26157e9daf72c8cbda55484e0e21e1dd1cd4dc91d78434797997feab062cdfabd438733e18373aed3b5166036eec85c975fe307cc0b9e3d5210b4193f780ce387dfca0a5f35b922e2e2fec759c577955b57520cf5526642bc2484bd30cd2e968df55d8471d517de611a8f811a22011e753aed42555fde1a4d6a8bebeb48d13018ce4d36d6aa43bd360fc632d3d16b95eb7d4107422f05fc60b381c4a1efe9e2d5cf74a1ec46f3478858cf73e4f068b03e5c57930ee493a6db73c0ce4b6b3fa8012d5d3d6cb7a6affea086bb22cb18142a8bbe6fdfe0f319e17d09c1d41f02dca6932e6736ccedcd6879abb4fdfc8e11b956955ac86a7ae448ff836a7f7afdaf935063627b8e1a7fbcd953f148750ddc6045ff05ed018f16f684da2976409afbe722ba6c7f75f98fbfbbf1659b84d2f9fda6fd02c814df"));
        });
      }

      { // zero key, random nonce
        let key = Encoding.fromHex("0000000000000000000000000000000000000000000000000000000000000000");
        let nonce = Encoding.fromHex("d11d1244d3869bf101a22e4b");

        service.chacha20Poly1305IetfEncrypt(Encoding.fromHex(""), key, nonce).then(cipher => {
          expect(cipher).toEqual(Encoding.fromHex("46ac80adac69b7b804fff77d34c68323"));
        });
      }

      { // random key, zero nonce
        let key = Encoding.fromHex("e72a0daf24c5faa2353fccf451abae4d46593850a88139ea6a1874724b3502df");
        let nonce = Encoding.fromHex("000000000000000000000000");

        service.chacha20Poly1305IetfEncrypt(Encoding.fromHex(""), key, nonce).then(cipher => {
          expect(cipher).toEqual(Encoding.fromHex("15e7308594883afaed358addb037aa95"));
        });
      }

      { // random key, random nonce
        let key = Encoding.fromHex("e72a0daf24c5faa2353fccf451abae4d46593850a88139ea6a1874724b3502df");
        let nonce = Encoding.fromHex("d11d1244d3869bf101a22e4b");

        service.chacha20Poly1305IetfEncrypt(Encoding.fromHex(""), key, nonce).then(cipher => {
          expect(cipher).toEqual(Encoding.fromHex("677650287e617fd6afc88aaa50f4bc99"));
        });
      }
    })));

    it('chacha20Poly1305IetfDecrypt conforms to Botan implementation ', async(inject([CryptoService], (service: CryptoService) => {
      { // zero key, zero nonce
        let key = Encoding.fromHex("0000000000000000000000000000000000000000000000000000000000000000");
        let nonce = Encoding.fromHex("000000000000000000000000");

        service.chacha20Poly1305IetfDecrypt(Encoding.fromHex("4eb972c9a8fb3a1b382bb4d36f5ffad1"), key, nonce).then(cipher => {
          expect(cipher).toEqual(Encoding.fromHex(""));
        });

        service.chacha20Poly1305IetfDecrypt(Encoding.fromHex("fe5d60e2e3898937158409d13ee78aa0bd"), key, nonce).then(cipher => {
          expect(cipher).toEqual(Encoding.fromHex("61"));
        });

        service.chacha20Poly1305IetfDecrypt(Encoding.fromHex("fe65cf6de21853d705bc5d128bca78c9d78b"), key, nonce).then(cipher => {
          expect(cipher).toEqual(Encoding.fromHex("6162"));
        });

        service.chacha20Poly1305IetfDecrypt(Encoding.fromHex("994a4f59eb95ed7f37533a603a36191d74d606420c1413c9387592a1db0bda6946dbcddb7f4622fa01992cab76f2ff3397c1255dab68491872fd2a01c79e7e725d9bc0d0444516a12d1ebaea02caf4cd0599d003699a7b4f27cf6d0467b5cc49e10bc2f6e01892ea78ad6433c613a6e4c4086aa6a26503bbbf78d56e98ab84804e0e531d29d7b536ad1a051cd18949b8d09eafc5d829080287a32738d85f1027aeb6fd116eec7a3d0ff0a38961104866fb3608f93cbd04fd2f8588f1684e498e739540a8281108faf017de9690d0ae0c5bcd959d15e936e76f7221ebf988d867cc702cd6868a7f24f44749bf179a81c1bb7d7a22421043be5e03735645c29b46c93192cea0e5eba7d107414b601d4170b1551c528f54bde11c87945544e442c493b89e8877e8976ab80058ae6b68a70e791b553dd966147a976e838e35820c4d1160432f28f04e04e4423ed0443cf1b9bcebf81892980522db6dbf9e674a109e87093abff4242a955f1dc4b23a662697104b9ba2d8789268cc6350b3b5393e4e7e31deafd545a00686f47b3c9496b097a2293ff0542c5cc61bd9a480c404a7493ef6fcbf49afebde92f013ea75f6d93a9f300adace78e9774a29e83b2071e4b85813b13ec78c59be258a9df1f062770c802a39418142b2b9e0c0a3978df92083a2b02593e7d96143a765c030c6fa5324a9fe40d4179aa9df5c2fdb74b471f02ed76f08640d7bfad9f5d24acffc6a6a9d864654f1937c6dbe59b81adef84a089c18cefe1b75f67032ce3b2a030a66adfb9e72738fb093539f5ac7309094bd17c0137d30e7a59c81f5ef8936cc1e726f2d5b5f41139007c04c134cac05e7c68dfb67e2ceb5e2643fb4dff461874e622a4cbdf3e1cfbcedfa2e19b78dc2c6749cfce7d9316b9f45780795c19615e855161a1c6b81608afcfacfaf723da01d368136223d25889171d8e7d8fefaa04df811f0bb5b44bee3ab35d414b62872c5ba6686462dd01c47775ad891d0613cb1ab19e72901c74a3a0e1ab6a8c26157e9daf72c8cbda55484e0e21e1dd1cd4dc91d78434797997feab062cdfabd438733e18373aed3b5166036eec85c975fe307cc0b9e3d5210b4193f780ce387dfca0a5f35b922e2e2fec759c577955b57520cf5526642bc2484bd30cd2e968df55d8471d517de611a8f811a22011e753aed42555fde1a4d6a8bebeb48d13018ce4d36d6aa43bd360fc632d3d16b95eb7d4107422f05fc60b381c4a1efe9e2d5cf74a1ec46f3478858cf73e4f068b03e5c57930ee493a6db73c0ce4b6b3fa8012d5d3d6cb7a6affea086bb22cb18142a8bbe6fdfe0f319e17d09c1d41f02dca6932e6736ccedcd6879abb4fdfc8e11b956955ac86a7ae448ff836a7f7afdaf935063627b8e1a7fbcd953f148750ddc6045ff05ed018f16f684da2976409afbe722ba6c7f75f98fbfbbf1659b84d2f9fda6fd02c814df"), key, nonce).then(cipher => {
          expect(cipher).toEqual(Encoding.fromHex("064da8e7bec4d505afe9ad1c491b1110bfd92fe244f776a02ab3c19fe9e5a0846f6cecade3a06cb9d4e81f1b022ac6e6a62c3a75fa62b25dde1c201e8ce7331d7092603627637a4083606be21ba254b88be85e9a12491989970c2b30ce157f14e02cf59eff63cfe550b35ece224b1afab7dab9b56baa977be08ba40cd809cc725d2ef345fe64e35d783adfb6ef5bf6b215261ee523ac2f7144c0b00c6c0381838362369296687713e241fb9a7172e459e41af00651701cabc7ef969d59295ff09633c8dc0356cd570b4e0a49e62db3bdbed375a60940cecda5651f3072fa4b2082ceb4d916c76fede20362f8943a68453d71cceb15a3df86b38c2299bf64110b2921b76d3cb5aee168db554dc7f66965af044c853d500746055364c446f6551fcf492b403ba730703f96480fcdfd0b5c0540034a930d9e5b3d86050bb30c0501e3feb7262207e708243cb6c7ee6e76dac596c42bb9ffcf691a7ddbb2461bfcd9698df133b6fc7585bdb50faaf9d115c836a35838cac92ea9bc122704d4014d60939b69e27404afc6d31e7db00d7f969d69ca083f09125c23a8faab7e1f0f3e4eb9263bb14251aa4678974b372f972265731df35b3d63069619d1f52c36666063449b93ebfb5db7c390b8abb9d8df8308306a919d4460416a395a4fdc0daecd3bf2b9143123f44e4ff06d8720cdad07fe55a1fd6c832146c571ce7b0b3fd13497ce5f1802e0c7ffb28e9a54b5f02c43e63d1ec96c36ca18182b860ff0a629ac521b806098907c71083edc1f2cbdf628ef7dc1a28bbd98eafce9527bf3ffe2c37f7e779d5d5d89fcf3c54212d4df04cb580a4474d066264a1a7ba6f7c3128d0a799f518e45e8a5810e8196ace4641ecdcc2181b7c71048159165f67ff5a24b9a3c7eab367c82ad1ffe4356294b4e540ca6d2070dbbabef6e1d6f5fed5b7deddb1a35911840c90971ec35c6f37bf496bba49da7ca10ee8650103ef1b77a43f2d8ab8e2c0836711887187ef3235f711d589a769c63522db697de4d2410c22c1b191c195584a6a1c45015f9cd2614cd0f9c5e81df1d40430f8eb7c772222c36a0d440b8004f9731547dcba2001eb5291c6e4573ee10e4f66afb684d06cd8022aaf5aa31c1cd428e3438fdb0333229649820727a963e842d00daf33fe472d9c6cb8fe8280025dabda1013dfa18a003d1f2d8b2efa482a2f95ac47cc0ab8d6a8436e83d7250b808851340e65190a2b02d4405dafb7383880adbb1b573abce1c918d4f448cc13df51ec85e98b5e0246d09951a969ec5a2f443df875a206eb1565cf0e563fcc6a037d7a1aa6aad7b0965aa3120b1a17f5ff8dbdc4471469082e3eab5acf509978913d8ff11e83c9473b73eb2757343fa066dcf1104dd1e633caebbb54d644491f9d2dcbb1c9a5a5687d9438d37fa96b780ae745fd7787612fa9e46d26c31"));
        });
      }

      { // zero key, random nonce
        let key = Encoding.fromHex("0000000000000000000000000000000000000000000000000000000000000000");
        let nonce = Encoding.fromHex("d11d1244d3869bf101a22e4b");

        service.chacha20Poly1305IetfDecrypt(Encoding.fromHex("46ac80adac69b7b804fff77d34c68323"), key, nonce).then(cipher => {
          expect(cipher).toEqual(Encoding.fromHex(""));
        });
      }

      { // random key, zero nonce
        let key = Encoding.fromHex("e72a0daf24c5faa2353fccf451abae4d46593850a88139ea6a1874724b3502df");
        let nonce = Encoding.fromHex("000000000000000000000000");

        service.chacha20Poly1305IetfDecrypt(Encoding.fromHex("15e7308594883afaed358addb037aa95"), key, nonce).then(cipher => {
          expect(cipher).toEqual(Encoding.fromHex(""));
        });
      }

      { // random key, random nonce
        let key = Encoding.fromHex("e72a0daf24c5faa2353fccf451abae4d46593850a88139ea6a1874724b3502df");
        let nonce = Encoding.fromHex("d11d1244d3869bf101a22e4b");

        service.chacha20Poly1305IetfDecrypt(Encoding.fromHex("677650287e617fd6afc88aaa50f4bc99"), key, nonce).then(cipher => {
          expect(cipher).toEqual(Encoding.fromHex(""));
        });
      }
    })));
  });

});
