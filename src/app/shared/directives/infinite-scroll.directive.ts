import { Directive, ElementRef, NgZone, OnDestroy, OnInit } from "@angular/core";
import { Subject, fromEvent } from "rxjs";
import { debounceTime, takeUntil } from "rxjs/operators";
import { EventService } from "src/app/services/event.service";

@Directive({
  standalone: false,
  selector: "[nectarInfiniteScroll]",
})
export class InfiniteScrollDirective implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private eventService: EventService,
    private elementRef: ElementRef,
    private ngZone: NgZone) {}

  ngOnInit(): void {
    this.ngZone.runOutsideAngular(() => {
      fromEvent(document, "scroll")
        .pipe(debounceTime(100), takeUntil(this.destroy$))
        .subscribe(() => {
          const boundedRect = this.elementRef.nativeElement.getBoundingClientRect();
          const { bottom, height } = boundedRect;
          if (bottom - height < 0) {
            this.ngZone.run(() => {
              this.eventService.broadcastEvent("list-scroll", true);
            });
          }
        });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
