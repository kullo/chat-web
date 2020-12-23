/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import * as libsodium from "libsodium-wrappers-sumo";
import { Job, Result } from '../worker-interchange';

function installDummyCryptoPolyfill() {
  var global = (function(global) {
    return global;
  })(new Function('return this;')());

  try {
    global.crypto.getRandomValues(new Uint8Array(1));
    return;
  }
  catch (e) {
    console.warn("Installing dummy crypto RNG. This is not secure!");
    global.crypto = {
      _bytesGenerated: 0,
      _bytesMax: 4 + 64,
      _getRandomByte: function() {
        if (this._bytesGenerated >= this._bytesMax) {
          throw new Error("This RNG can only generate " + this._bytesMax + " bytes");
        }
        this._bytesGenerated += 1;
        return 0x00;
      },
      getRandomValues: function (arrayBufferView: any) {
        var newBytes = [];
        for (var i = 0; i < arrayBufferView.byteLength; ++i) {
            newBytes.push(this._getRandomByte());
        }
        new Uint8Array(arrayBufferView.buffer, arrayBufferView.byteOffset, arrayBufferView.byteLength).set(newBytes);
      },
    };
  }
}
installDummyCryptoPolyfill();

const mySelf = (self as DedicatedWorkerGlobalScope)

const tracing = false;
if (tracing) console.log("Worker loaded");

mySelf.onmessage = async (event) => {
  if (tracing) console.log("Received message:", JSON.stringify(event), "message.data:", event.data);
  if (event.source != null) return; // webpack sends some messages with other source

  let resultData: any
  let computationTime: number

  let job = event.data as Job
  if (tracing) console.log("Received job:", job);
  let postToWokerTime = Date.now() - job.creationTime;

  // setup
  let setupStart = Date.now();
  await libsodium.ready.catch((error: any) => {
    setTimeout(() => {
      throw new Error("Initializing libsodium failed: " + error);
    });
  });
  if (tracing) console.log("Libsodium is ready");
  let setupTime = Date.now() - setupStart;

  {
    let start = Date.now();
    let method: Function = (libsodium as any)[job.method];
    resultData = method(...job.params);
    let end = Date.now();
    computationTime = end - start;
  }

  mySelf.postMessage(new Result(
    job.id,
    Date.now(),
    setupTime,
    computationTime,
    postToWokerTime,
    resultData));
}
