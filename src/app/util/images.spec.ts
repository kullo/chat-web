/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { TestBed, async } from '@angular/core/testing';

import { Images } from './images';

describe('Images', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('can resize SVG', async(() => {
    (async () => {
      let svgUrl = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzEyIj48ZyBmaWxsPSIjZTg4ZDAzIj48cGF0aCBkPSJNNzMuMzc5NyAxMi43NzAxQzc0LjE4OTQgNC4zNDc1IDgyLjg4NjgtLjAzODkgOTguMjg4LjAwMDNsMTMuODIxMi4wMzAyYzYuNzIxNy4wMTgxIDIyLjUxMjUuODU4IDIyLjQ4MjMgMTIuNDgyOEwxMDQuNzk1MiAyNjkuNDI5Yy0uODAzNiA4LjQxOTYtMi4yOTMgMTIuODAzLTE3LjY5MSAxMi43NzI4bC0xMy44MTgxLS4wMzkyYy02LjcyNDgtLjAxODItMjIuNTI0Ny0uODU4LTIyLjQ5MTQtMTIuNDc5OEw3My4zNzk3IDEyLjc3eiIvPjxwYXRoIGQ9Ik0yODIuNzg4MiA2MS41NTNjOC41NTI0LS4yOSAxMy45MzU5IDcuMTE3NSAxNS42MjE2IDIxLjE5NTRsMS4wOTA2IDkuMjE3MWMuNzMxIDYuMTQ0OCAyLjA0NTIgMTQuNDY3Ni05LjY0MyAxNS44NjY0bC0yNjEuNDk1NSA2LjYxOWMtOC41NDk1LjI5LTEzLjkzNi03LjEyMDUtMTUuNjE1Ni0yMS4xODk0bC0xLjUwMTQtMTIuNjM2OGMtLjcyNS02LjEzMjctMS42NDY1LTIwLjY1NzcgMTAuMDUzOS0yMi4wNTM0bDI2MS40ODk0IDIuOTgxN3oiLz48cGF0aCBkPSJNMTkzLjQ2MTggMTQuMTkyMWMxLjIyMDUtOC4xMjM1IDYuMTAyNC0xMi4xODY4IDIxLjEzNS0xMi4xODY4aDE5LjUwMzZjMTQuNjIxNyAwIDE5LjA4OTcgNC40NjgxIDE5LjA4OTcgMTAuOTc1NCAwIDAtMjcuNDg4MSAyMzYuNDYzMy0yNy40ODgxIDIzOC4wODg2IDAgOS4zMzUgMy42NTI0IDEzLjQwMTIgMTIuMTg2NyAxMy40MDEyIDUuNjg4NiAwIDEwLjE1OTctMi40NDEgMTEuNzg4LTIuNDQxIDIuNDM1IDAgMy4yMzg1LjgxMjcgMy4yMzg1IDQuNDY4MSAwIC44MTU3LS4zOTg4IDEwLjE1NjYtMi44Mzk3IDI0LjM3OTZDMjQ3LjYzNzUgMzA1LjkxNTcgMjI4LjU0NzggMzEyIDIxNC4zMTg4IDMxMmMtMzEuNjcyMiAwLTQ5LjE1NDgtMTUuMDI5NS00OS4xNTQ4LTUxLjU5NTggMC0xMi41ODg1IDI4LjI5NzgtMjQ2LjIxMjEgMjguMjk3OC0yNDYuMjEyMSIvPjxwYXRoIGQ9Ik0yNzEuOTc4NCAxNjAuNjUyYzguNTQ5NC0uMjkgMTMuOTQ1LS4wODQ1IDE1LjYxNTYgMTMuOTkwNGwxLjUwNzUgMTIuNjMzOGMuNzI1IDYuMTM1NyAxLjYzNDMgMjAuNjYzNy0xMC4wNiAyMi4wNTA0TDE3LjU2MTIgMjIzLjE1OThjLTguNTYxNi4yOTYtMTMuOTUxLTcuMTI2Ni0xNS42MjE3LTIxLjE5NTRMLjQzODEgMTg5LjMzMDVjLS43NDAxLTYuMTMyNi0xLjY1NTUtMjAuNjYwNyAxMC4wNTctMjIuMDU2NGwyNjEuNDgzMy02LjYyMnoiLz48L2c+PC9zdmc+";
      let svgBlob: Blob = await (await fetch(svgUrl)).blob();
      let thumbnail = await Images.resize(svgBlob, 50, 30);

      let thumbnailImage = await Images.blobToLoadedImage(thumbnail);
      expect(thumbnailImage.complete).toBeTruthy();
      expect(thumbnailImage.width).toEqual(50);
      expect(thumbnailImage.height).toEqual(30);
    })();
  }));

  it('can resize PNG', async(() => {
    (async () => {
      let pngUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAA8AQMAAACq8Y2NAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4gMHCRIewAUkfwAAAAxpVFh0Q29tbWVudAAAAAAAvK6ymQAAAANQTFRF////p8QbyAAAAA9JREFUGBljGAWjYBRQDAADSAABHEpB9wAAAABJRU5ErkJggg==";
      let pngBlob: Blob = await (await fetch(pngUrl)).blob();
      let thumbnail = await Images.resize(pngBlob, 50, 30);

      let thumbnailImage = await Images.blobToLoadedImage(thumbnail);
      expect(thumbnailImage.complete).toBeTruthy();
      expect(thumbnailImage.width).toEqual(50);
      expect(thumbnailImage.height).toEqual(30);
    })();
  }));

  it('can resize JPEG', async(() => {
    (async () => {
      let jpegUrl = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCAA8AGQDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/2Q==";
      let jpegBlob: Blob = await (await fetch(jpegUrl)).blob();
      let thumbnail = await Images.resize(jpegBlob, 50, 30);

      let thumbnailImage = await Images.blobToLoadedImage(thumbnail);
      expect(thumbnailImage.complete).toBeTruthy();
      expect(thumbnailImage.width).toEqual(50);
      expect(thumbnailImage.height).toEqual(30);
    })();
  }));
});
