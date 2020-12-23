/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Assert } from "../../util";

export class ServerAttachment {
  constructor(
    public id: string,
    public uploadUrl: string,
  ) {
    Assert.isSet(id, "id must be set");
    Assert.isSet(uploadUrl, "uploadUrl must be set");
  }

  static fromJson(json: any): ServerAttachment {
    Assert.isSet(json, "json must be set");
    return new ServerAttachment(json.id, json.uploadUrl);
  }
}
