/*
 * Copyright 2017–2018 Kullo GmbH
 *
 * This source code is licensed under the 3-clause BSD license. See LICENSE.txt
 * in the root directory of this source tree for details.
 */
import { Directive, ElementRef, Output, EventEmitter } from '@angular/core';

export class DropZoneDropped {
  files: File[];
  target: any;
}

@Directive({
  selector: '[appDropZone]'
})
export class DropZoneDirective {

  @Output()
  filesDropped: EventEmitter<DropZoneDropped> = new EventEmitter();

  constructor(el: ElementRef) {
    this.setupFileDrop(el.nativeElement);
  }

  private advancedUploadAvailable() {
    var div = document.createElement('div');
    return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div))
      && 'FormData' in window
      && 'FileReader' in window;
  }

  private setupFileDrop(domElement: any) {
    if (!this.advancedUploadAvailable()) {
      console.warn("Advanced upload APIs not available");
      return;
    }

    domElement.addEventListener('dragover', (e: any) => e.preventDefault());

    let enteredCount = 0;
    domElement.addEventListener('dragenter', (event: DragEvent) => {
      (event.target as any).classList.add('dragover')

      if (enteredCount == 0) {
        domElement.classList.add('dragover');
      }
      enteredCount += 1;
    });

    domElement.addEventListener('dragleave', (event: DragEvent) => {
      //console.log("Leave", event.target);
      enteredCount -= 1;

      (event.target as any).classList.remove('dragover')

      if (enteredCount == 0) {
        domElement.classList.remove('dragover');
      }
    });

    domElement.addEventListener('drop', (event: DragEvent) => {
      event.preventDefault();

      let droppedFiles = DropZoneDirective.fileListToListOfFiles(event.dataTransfer.files);

      //console.log(droppedFiles, "dropped at", event.target);
      this.filesDropped.emit({
        files: droppedFiles,
        target: event.target,
      });

      DropZoneDirective.removeDragoverClasses(domElement);
      enteredCount = 0;
    });
  }

  private static removeDragoverClasses(domElement: any) {
    domElement.classList.remove('dragover');
    for (let el of domElement.querySelectorAll('.dragover')) {
      el.classList.remove('dragover');
    }
  }

  static fileListToListOfFiles(filesAsFileList: FileList): File[] {
    let out: File[] = [];
    for (let index = 0; index < filesAsFileList.length; ++index) {
      let file = filesAsFileList[index];
      out.push(file);
    }
    return out;
  }
}
