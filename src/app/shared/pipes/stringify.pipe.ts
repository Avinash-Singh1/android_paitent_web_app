import { Pipe, PipeTransform } from "@angular/core";
import { Observable, of } from "rxjs";

@Pipe({
  standalone: false,
  name: "stringify",
})
export class StringifyPipe implements PipeTransform {
  transform(value: any): Observable<string> {
    return value ? of(JSON.stringify(value)) : null;
  }
}
