import { Pipe, PipeTransform } from "@angular/core";
import { ErrorDirective } from "../directives/error.directive";
import { ErrorService } from "src/app/services/error.service";

@Pipe({
  standalone: false,
  name: "error",
})
export class ErrorPipe implements PipeTransform {
  constructor(private errorService: ErrorService) {}
  transform(
    errorObj: any,
    errorDirective: ErrorDirective,
    inputTouched: any
  ): any {
    const errors = Object.entries(errorObj || {});
    if (!inputTouched) return "";
    if (!errors.length) {
      return null;
    }
    const passedControlName =
      errorDirective?.controlName ?? errorDirective.formControlName;

    return this.errorService.getErrorValidationMessage(
      passedControlName,
      errors
    );
  }
}
