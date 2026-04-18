import { Component, ContentChild } from "@angular/core";
import { ErrorDirective } from "../../directives/error.directive";
import { ErrorService } from "src/app/services/error.service";

@Component({
  standalone: false,
  selector: "nectar-form-field",
  templateUrl: "./form-field.component.html",
})
export class FormFieldComponent {
  constructor(private errorService: ErrorService) {}
  @ContentChild(ErrorDirective, { static: true })
  errorDirective: ErrorDirective;
}
