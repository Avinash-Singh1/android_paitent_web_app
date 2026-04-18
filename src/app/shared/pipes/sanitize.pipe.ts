import { Pipe, PipeTransform } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { Observable, of } from "rxjs";

@Pipe({
  standalone: false,
  name: "sanitize",
})
export class SanitizePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): Observable<SafeResourceUrl> {
    return value
      ? of(this.sanitizer.bypassSecurityTrustResourceUrl(value))
      : null;
  }
}
