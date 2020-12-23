/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConversationHeaderComponent } from './conversation-header.component';

describe('ConversationHeaderComponent', () => {
  let component: ConversationHeaderComponent;
  let fixture: ComponentFixture<ConversationHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConversationHeaderComponent ],
      providers: [
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConversationHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render title in a h2 tag', async(() => {
    const fixture = TestBed.createComponent(ConversationHeaderComponent);
    const compiled = fixture.debugElement.nativeElement;

    fixture.componentInstance.title = "Off topic";
    fixture.detectChanges();
    expect(compiled.querySelector('h2').textContent).toContain('Off topic');

    fixture.componentInstance.title = "Marketing";
    fixture.detectChanges();
    expect(compiled.querySelector('h2').textContent).toContain('Marketing');
  }));
});
