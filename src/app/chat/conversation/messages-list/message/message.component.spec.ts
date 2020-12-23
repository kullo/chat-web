/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EncryptionPubkey } from '../../../../crypto';
import { User } from '../../../../server-types';
import { Encoding, UtilModule } from '../../../../util';

import { MessagesElement } from '../../../conversation/messages-list/messages-list.service';
import { BlobService, FakeBlobService } from '../../../messages/blob.service';
import { TextPlainMessage } from '../../../messages/plain-message';
import { UserPictureComponent } from '../../../users/user-picture/user-picture.component';

import { MessageComponent, ThumbnailDirective } from './message.component';

describe('MessageComponent', () => {
  let component: MessageComponent;
  let fixture: ComponentFixture<MessageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        UtilModule,
      ],
      declarations: [
        MessageComponent,
        ThumbnailDirective,
        UserPictureComponent,
      ],
      providers: [
        { provide: BlobService, useClass: FakeBlobService },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create empty', () => {
    expect(component).toBeTruthy();
  });

  it('can have data', () => {
    let author = new User(222, "active", "Max", "", new EncryptionPubkey(Encoding.fromBase64("AAAA")));
    let data = new MessagesElement(new TextPlainMessage("huhu"), author, false, 1, new Date(), []);
    component.data = data;
    expect(component).toBeTruthy();
  });
});
