import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: false,
  name: 'firstCharCapital'
})
export class FirstCharCapitalPipe implements PipeTransform {

  transform(value: string | null | undefined): string {
    if (!value) return '';

    return value
      .replace(/-/g, ' ')
      .replace(/^./, char => char.toUpperCase());
  }
}
