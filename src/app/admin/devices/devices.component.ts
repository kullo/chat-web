/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Component, OnInit, NgZone, ElementRef, ViewChild } from '@angular/core';
import * as awesomplete from 'awesomplete';
import * as bip39 from 'bip39';
import * as bip39_wordlist_english from 'bip39/wordlists/english.json';
import { CryptoService } from '../../crypto';
import { ServerDevice } from '../../current-device';
import { RestApiService, User } from '../../server-types';

interface FingerprintParts {
  part1: string,
  part2: string,
}

class DeviceRow {
  constructor(
    public readonly id: string,
    public readonly shortId: string,
    public readonly fingerprint: FingerprintParts,
    public readonly owner: User,
  ) {}
}

@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.less']
})
export class DevicesComponent implements OnInit {

  @ViewChild('devicesTable') private usersTable: ElementRef;

  devices = new Array<DeviceRow>();

  private autocompleteInitialized = new WeakMap();
  private fingerprintPart2s = new Map<string, string>();

  constructor(
    private crypto: CryptoService,
    private restApi: RestApiService,
    private ngZone: NgZone,
  ) { }

  ngOnInit() {
    this.reload();
  }

  ngAfterViewChecked() {
    this.initializeAutocomplete();
  }

  initializeAutocomplete() {
    let mainZone = this.ngZone;
    mainZone.runOutsideAngular(() => {
      function regExpEscape(s: string) {
        return s.replace(/[-\\^$*+?.()|[\]{}]/g, "\\$&");
      }

      let inputs = this.usersTable.nativeElement.querySelectorAll(".fingerprint-autocomplete");
      for (let input of inputs) {

        if (this.autocompleteInitialized.get(input)) return;
        this.autocompleteInitialized.set(input, true);

        new awesomplete(input, {
          minChars: 3,
          autoFirst: true,
          replace: function(suggestion: any) {
            let words = (input.value as string).trim().split(/\s+/);
            let wordsBeforeSuggestion = words.slice(0, words.length-1);
            let lastWord = wordsBeforeSuggestion.length == 5;
            let newValue = (wordsBeforeSuggestion.join(" ") + " " + suggestion.value).trim()
              + ((!lastWord) ? " " : "");
            mainZone.run(() => {
              input.value = newValue;
              input.dispatchEvent(new Event('input'));
            });
          },
          filter: function(text: any, input: any) {
            var words = input.split(/\s+/);
            if (words.length == 0) return false;
            var lastWord = words[words.length-1];
            if (lastWord.length == 0) return false;
            return RegExp("^" + regExpEscape(lastWord), "i").test(text);
          },
          list: bip39_wordlist_english,
        });
      }
    });
  }

  setFingerprintPart2(deviceId: string, fingerprintPart2: string) {
    this.fingerprintPart2s.set(deviceId, fingerprintPart2);
  }

  async activate(userId: number, device: DeviceRow) {
    console.log("Activating user", userId, "with device", device.id, "...");

    let part2 = this.fingerprintPart2s.get(device.id) || "";
    let mnemonicNormalized = (device.fingerprint.part1 + " " + part2).trim().replace(/\s{2,}/g, " ");

    let isValid = bip39.validateMnemonic(mnemonicNormalized);
    console.log(mnemonicNormalized, "Valid:", isValid);
    if (!isValid) {
      alert("Fingerprint is not a valid value. Please check again.");
      return;
    }

    if (mnemonicNormalized !== device.fingerprint.part1 + " " + device.fingerprint.part2) {
      alert("Wrong fingerprint. Please check again.");
      return;
    }

    // Activate device
    await this.restApi.updateDevice(device.id, { "state": "active" });

    this.reload();
  }

  private reload() {
    this.restApi.getDevices("pending").then(async result => {
      this.devices.length = 0;

      for (let device of result.devices) {
        let owner = result.owners.find(u => u.id == device.ownerId);
        if (!owner) throw new Error("Device owner missing in REST result");

        if (owner.state != "active") continue; // skip inactive users

        let fingerprintParts = await this.fingerprint(device);

        this.devices.push(new DeviceRow(
          device.id,
          this.shortId(device),
          fingerprintParts,
          owner,
        ));
      }

      this.initializeAutocomplete();
    });
  }

  private shortId(device: ServerDevice) {
    return device.id.substr(0, 6);
  }

  private async fingerprint(device: ServerDevice): Promise<FingerprintParts> {
    let fingerprintAsHex = await this.crypto.makeFingerprint(device.pubkey.data);
    let words = (bip39.entropyToMnemonic(fingerprintAsHex) as string).split(" ");
    return {
      part1: words.slice(0, 6).join(" "),
      part2: words.slice(6).join(" "),
    }
  }
}
