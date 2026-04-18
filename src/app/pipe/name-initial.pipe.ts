import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nameInitial',
  standalone: true 
})
export class NameInitialPipe implements PipeTransform {
  transform(value: string | undefined | null): string {
    if (!value) {
      return '';
    }
    return value.charAt(0);
  }
}