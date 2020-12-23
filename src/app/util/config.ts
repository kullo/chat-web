/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { environment } from '../../environments/environment';

export class Config {
  //static readonly API_BASE_URL = "http://localhost:8000";
  //static readonly API_BASE_URL = `http://localhost:8080/v1/${window.location.hostname}`;
  static readonly API_BASE_URL = `https://${environment.backendHost}/v1/${window.location.hostname}`;

  // possible placeholders: ":api_base_url", ":id"
  static readonly BLOB_DOWNLOAD_URL_PATTERN = `https://${environment.backendHost}/blob/:id`;
}
