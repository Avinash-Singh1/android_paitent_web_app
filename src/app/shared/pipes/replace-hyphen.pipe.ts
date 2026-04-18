import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: false,
  name: 'replaceHyphen'
})
export class ReplaceHyphenPipe implements PipeTransform {

  transform(value: string): string {
    if (!value) return value;
    
    // Replace hyphens with spaces and capitalize each word
    return value
      .replace(/-/g, ' ')           // Replace hyphens with spaces
      .replace(/\b\w/g, char => char.toUpperCase());  // Capitalize each word
  }
}
