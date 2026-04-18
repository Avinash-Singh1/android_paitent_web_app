import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pure pipe replacement for `capitalizeFirstLetter()` calls in templates.
 * Capitalizes the first letter of the input string.
 *
 * Usage: {{ value | capitalizeFirst }}
 */
@Pipe({
  standalone: false,
  name: 'capitalizeFirst',
  pure: true
})
export class CapitalizeFirstPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
