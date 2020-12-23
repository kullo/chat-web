/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { LinkifyPipe } from './linkify.pipe';

describe('LinkifyPipePipe', () => {
  it('create an instance', () => {
    const pipe = new LinkifyPipe();
    expect(pipe).toBeTruthy();
  });
});
