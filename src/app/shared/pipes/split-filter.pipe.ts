import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pure pipe that splits a string by a delimiter and filters empty entries.
 * Replaces getFilteredLinks() function calls in *ngFor sources,
 * preventing new array creation on every change detection cycle.
 *
 * Usage: *ngFor="let item of content | splitFilter:'<br>'"
 */
@Pipe({
  standalone: false,
  name: 'splitFilter',
  pure: true
})
export class SplitFilterPipe implements PipeTransform {
  transform(value: string | null | undefined, delimiter: string = '<br>'): string[] {
    if (!value) return [];
    return value.split(delimiter).filter(item => item && item.trim());
  }
}
