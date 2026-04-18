import {
  Directive,
  EventEmitter,
  HostBinding,
  HostListener,
  Output,
} from "@angular/core";

@Directive({
  standalone: false,
  selector: "[nectarDragDrop]",
})
export class DragDropDirective {
  @Output() filesDropped = new EventEmitter<any>();

  @HostBinding("class.file-over") fileOver: boolean = false;

  @HostListener("dragover", ["$event"]) onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.fileOver = true;
  }

  @HostListener("dragleave", ["$event"]) onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.fileOver = false;
  }

  @HostListener("drop", ["$event"]) onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.fileOver = false;
    const files = event.dataTransfer?.files;
    if (files) {
      this.filesDropped.emit(event);
    }
  }
}
