import { Directive, ElementRef, EventEmitter, HostListener, Inject, OnInit, Output, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { fromEvent, take } from "rxjs";

@Directive({
  standalone: false,
  selector: "[nectarClickOutside]",
})
export class ClickOutsideDirective implements OnInit {
  private isBrowser: boolean;
  constructor(
    private elementRef: ElementRef,
  ) {
    this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  }
  @Output() clickOutside: EventEmitter<boolean> = new EventEmitter();
  captured: boolean = false;
  @HostListener("document:click", ["$event"]) toggle(event: Event) {
    if (!this.captured) {
      return;
    }
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.clickOutside.emit();
    }
  }
  ngOnInit(): void {
    if (!this.isBrowser) return;
    fromEvent(document, "click")
      .pipe(take(1))
      .subscribe(() => (this.captured = true));
  }
}
