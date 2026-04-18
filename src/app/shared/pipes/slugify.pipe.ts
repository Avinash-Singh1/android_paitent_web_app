import { Pipe, PipeTransform } from '@angular/core';
import slugify from 'slugify';

/**
 * Pure pipe replacement for `commonService.replaceSpaceWithHyphen()` calls in templates.
 * Being a pure pipe, Angular memoizes the result and only recomputes when the input changes,
 * eliminating redundant slugify computations on every change detection cycle.
 *
 * Usage: {{ value | slugify }}
 */
@Pipe({
  standalone: false,
  name: 'slugify',
  pure: true
})
export class SlugifyPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    return slugify(value.replace(/[/&]+/g, '-'), { lower: true, strict: true });
  }
}
