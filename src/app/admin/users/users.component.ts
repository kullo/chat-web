/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import * as awesomplete from 'awesomplete';
import * as bip39 from 'bip39';
import * as bip39_wordlist_english from 'bip39/wordlists/english.json';
import { CryptoService } from '../../crypto';
import { ServerDevice, CurrentDeviceService } from '../../current-device';
import { RestApiService, User, PermissionPackerService, PlainPermission, ServerPermission } from '../../server-types';
import { Encoding } from '../../util';

interface FingerprintParts {
  part1: string,
  part2: string,
}

class PendingUserDevice {
  constructor(
    public readonly id: string,
    public readonly shortId: string,
    public readonly fingerprint: FingerprintParts,
    public readonly owner: User,
  ) {}
}

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.less']
})
export class UsersComponent implements OnInit {

  @ViewChild('pendingUsersTable') private pendingUsersTable: ElementRef;

  pendingDevices = new Array<PendingUserDevice>();
  activeUsers = new Array<User>();

  private autocompleteInitialized = new WeakMap();
  private fingerprintPart2s = new Map<string, string>();

  constructor(
    private crypto: CryptoService,
    private currentDevice: CurrentDeviceService,
    private permissionPacker: PermissionPackerService,
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

      let inputs = this.pendingUsersTable.nativeElement.querySelectorAll(".fingerprint-autocomplete");
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

  async activate(userId: number, device: PendingUserDevice) {
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

    // Create permissions if necessary
    let permissions = await this.createPermissions(userId);
    await this.restApi.activateUser(userId, permissions);

    // Activate device
    await this.restApi.updateDevice(device.id, { "state": "active" });

    this.reload();
  }

  private reload() {
    this.restApi.getUsers('active').then(async result => {
      this.activeUsers = result;
    });

    this.restApi.getDevices("pending").then(async result => {
      this.pendingDevices.length = 0;

      for (let device of result.devices) {
        let owner = result.owners.find(u => u.id == device.ownerId);
        if (!owner) throw new Error("Device owner missing in REST result");

        if (owner.state != "pending") continue; // skip active users

        let fingerprintParts = await this.fingerprint(device);

        this.pendingDevices.push(new PendingUserDevice(
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

  private async createPermissions(ownerId: number): Promise<ServerPermission[]> {
    let allUsers = await this.restApi.getUsers();
    let owner = allUsers.find(u => u.id == ownerId);
    if (!owner) return Promise.reject("Owner id not found in users list");
    let conversationsWithPermissions = await this.restApi.getConversations();
    let permissions = conversationsWithPermissions.permissions;
    let channels = conversationsWithPermissions.conversations.filter(c => c.type == "channel");

    let currentUserId = (await this.currentDevice.device()).ownerId;
    let currentUserEncryptionKeypair = await this.currentDevice.encryptionKeypair();
    let currentUserDevice = await this.currentDevice.device();

    let newPermissions = new Array<ServerPermission>();
    for (let channel of channels) {
      let channelPermissions = permissions.filter(p => p.conversationId == channel.id);
      for (let permission of channelPermissions) {
        let creator = allUsers.find(u => u.id == permission.creatorId);
        if (!creator) return Promise.reject("Creator not found in users list");

        let deviceId = permission.signature.deviceId;
        let creatingDevice = await this.restApi.getDevice(deviceId);

        let unpackedPermission = await this.permissionPacker.unpack(
          permission,
          currentUserEncryptionKeypair,
          creatingDevice.pubkey
        );

        let newPermission = new PlainPermission(
          unpackedPermission.conversationId,
          unpackedPermission.conversationKeyId,
          unpackedPermission.conversationKey,
          owner.id,
          creatingDevice.ownerId,
          unpackedPermission.validFrom,
        );

        let newPermissionPacked = await this.permissionPacker.pack(
          newPermission,
          owner,
          currentUserDevice);
        newPermissions.push(newPermissionPacked);
      }
    }
    return newPermissions;
  }
}
