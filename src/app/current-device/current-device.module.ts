/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { NgModule } from '@angular/core';
import { CurrentDeviceService } from './current-device.service';
import { DeviceGeneratorService } from './device-generator.service';
import { DevicePublisherService } from './device-publisher.service';

@NgModule({
  imports: [],
  declarations: [],
  providers: [
    CurrentDeviceService,
    DeviceGeneratorService,
    DevicePublisherService,
  ]
})
export class CurrentDeviceModule { }
