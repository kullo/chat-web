/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CurrentDeviceService } from '../../current-device';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.less']
})
export class LogoutComponent implements OnInit {

  constructor(
    private currentDevice: CurrentDeviceService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.currentDevice.clearDevice();
    this.currentDevice.clearLoginKey();
    this.currentDevice.clearEncryptionPrivkeyEncryptingKey();
    this.currentDevice.clearEncryptionKeypair();

    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 1000)
  }
}
