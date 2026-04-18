import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Pure pipe that sanitizes HTML content using DomSanitizer.
 * Replaces sanitizeHtml() function calls in [innerHTML] bindings,
 * preventing redundant sanitization on every change detection cycle.
 *
 * Usage: [innerHTML]="htmlContent | safeHtml"
 */
@Pipe({
  standalone: false,
  name: 'safeHtml',
  pure: true
})
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string | null | undefined): SafeHtml {
    if (!value) return '';
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }
}
