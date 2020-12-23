/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Injectable } from '@angular/core';
import { Assert, Encoding } from '../util';
import { Job, Result } from '../../../worker-interchange';

@Injectable()
export class HeavyCryptoService {

  private readonly cryptoWorkerModule = require(
    'file-loader?name=cryptoworker.[hash:20].[ext]!../../../workers/cryptoworker.js');

  constructor() { }

  async pkdfStep1(password: string): Promise<Uint8Array> {
    return await this.argon2id(
      32, /* key length in bytes */
      Encoding.toUtf8(password),
      Encoding.fromHex("00000000000000000000000000000000"),
      20,
      64*1024*1024, /* 64 MiB */
    )
  }

  async estimatePkdfStep1Time(): Promise<number> {
    return new Promise<number>(async (resolve, reject) => {
      let benchmarkSetup: number;
      let benchmarkPerformance: number;
      {
        let start = Date.now();
        await this.benchmarkArgon2Setup();
        let end = Date.now();
        benchmarkSetup = end-start;
        console.log("Worker setup time (ms):", benchmarkSetup);
      }
      {
        let start = Date.now();
        await this.benchmarkArgon2Performance();
        let end = Date.now();
        benchmarkPerformance = (end-start) - benchmarkSetup;
        console.log("Performance time (ms):", benchmarkPerformance);
      }

      let estimationMs = benchmarkSetup + 4.0 * benchmarkPerformance;
      resolve(estimationMs / 1000);
    });
  }

  private async benchmarkArgon2Setup(): Promise<void> {
    await this.argon2id(
      16, /* key length in bytes */
      new Uint8Array([]),
      Encoding.fromHex("00000000000000000000000000000000"),
      1, // crypto_pwhash_argon2id_OPSLIMIT_MIN
      8*1024, // 8 KiB = crypto_pwhash_argon2id_MEMLIMIT_MIN
    );
    return
  }

  private async benchmarkArgon2Performance(): Promise<void> {
    await this.argon2id(
      32, /* key length in bytes */
      new Uint8Array([0x12]),
      Encoding.fromHex("00000000000000000000000000000000"),
      10,
      32*1024*1024,
    );
    return
  }

  async argon2id(tagLength: number, password: Uint8Array, salt: Uint8Array, opsLimit: number, memLimit: number): Promise<Uint8Array> {
    Assert.isSet(tagLength);
    Assert.isSet(password);
    Assert.isSet(salt);

    let worker: Worker

    let startTime = Date.now();

    let pendingResult = new Promise<Uint8Array>((resolve, relect): void => {
      worker = new Worker(this.cryptoWorkerModule);
      let workerCreationDuration = (Date.now()-startTime);

      worker.onmessage = (event) => {
        worker.terminate();

        let result = event.data as Result;

        let endTime = Date.now();

        let postFromWorkerDuration = endTime-result.creationTime;
        let runDuration = (endTime-startTime)

        let overhead = runDuration - result.computationDuration;
        let overheadRelative = (runDuration / result.computationDuration) - 1;

        // time we don't know how it was spent
        let remainingDuration = runDuration
          - workerCreationDuration
          - result.setupDuration
          - result.computationDuration
          - result.postToWokerDuration
          - postFromWorkerDuration;

        //console.log(
        //  "Received result from worker:", result,
        //  "Creating worker took:", workerCreationDuration,
        //  "Setup took:", result.setupDuration,
        //  "Computation took:", result.computationDuration,
        //  "Post to woker took:", result.postToWokerDuration,
        //  "Post from woker took:", postFromWorkerDuration,
        //  "Remaining:", remainingDuration,
        //  "Overhead abs:", overhead,
        //  "Overhead rel:", overheadRelative);

        resolve(result.data);
      }

      let job = new Job(1, startTime, "crypto_pwhash", [
        tagLength,
        password,
        salt,
        opsLimit,
        memLimit,
        2, // value of crypto_pwhash_ALG_ARGON2ID13
      ])
      worker.postMessage(job);
    });

    return await pendingResult;
  }

}
