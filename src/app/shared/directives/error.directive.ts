import { Directive, Input, Optional, Self } from "@angular/core";
import { NgControl } from "@angular/forms";

@Directive({
  standalone: false,
  selector: "[nectarError]",
})
export class ErrorDirective {
  @Input() controlName: string;
  @Input() formControlName: string;
  constructor(@Optional() @Self() public ngControl: NgControl) {}
}
