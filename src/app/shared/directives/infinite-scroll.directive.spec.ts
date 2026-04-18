import { ElementRef } from '@angular/core';
import { InfiniteScrollDirective } from './infinite-scroll.directive';
import { EventService } from 'src/app/services/event.service';

describe('InfiniteScrollDirective', () => {
  it('should create an instance', () => {
    const mockEventService = { broadcastEvent: () => {} } as unknown as EventService;
    const mockElementRef = new ElementRef(document.createElement('div'));
    const directive = new InfiniteScrollDirective(mockEventService, mockElementRef);
    expect(directive).toBeTruthy();
  });
});
