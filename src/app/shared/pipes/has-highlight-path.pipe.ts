import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ standalone: false, name: 'hasHighlightPath' })
export class HasHighlightPathPipe implements PipeTransform {
  transform(highlights: any[], path: string): boolean {
    if (!highlights || !path) return false;
    return highlights.some((hl: any) => hl.path === path);
  }
}
