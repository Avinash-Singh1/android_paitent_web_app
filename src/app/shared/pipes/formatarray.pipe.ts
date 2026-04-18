import { Injectable, Pipe, PipeTransform } from "@angular/core";
@Pipe({
  standalone: true,
  name: "formatarray",
})
@Injectable({
  providedIn: "root",
})
export class FormatarrayPipe implements PipeTransform {
  transform(value: any[], field: string): string {
    if (!value || (value && !value.length)) {
      return null;
    }
    return value.map((item: any) => item[field]).join(", ");
  }
}
