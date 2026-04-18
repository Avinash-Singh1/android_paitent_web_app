import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  standalone: false, name: 'highlightSearch' })
export class HighlightSearchPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string, searchTerm: string): SafeHtml {
    if (!value || !searchTerm || searchTerm.length < 2) {
      return value || '';
    }
    // Escape regex special chars in the search term
    const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const highlighted = value.replace(regex, '<mark class="highlight-hit">$1</mark>');
    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }
}
