import { Injectable } from "@angular/core";
import { FormGroup, ValidatorFn } from "@angular/forms";

@Injectable({
  providedIn: "root",
})
export class FormValidationService {
  atleastOneDay(...args: string[]) {
    return (formGroup: FormGroup) => {
      let flag = false;
      args.forEach((day) => {
        if (formGroup.controls[day].status != "DISABLED") flag = true;
      });
      return !flag ? { atleastOneDay: true } : null;
    };
  }
  atleastOne(): ValidatorFn {
    return (formGroup: FormGroup) => {
      let flag = false;
      Object.keys(formGroup.controls).forEach((key) => {
        const control = formGroup.controls[key];
        if (control.value.from && control.value.to) {
          flag = true;
        }
      });

      return !flag ? { atleatOnetiming: true } : null;
    };
  }
  fromToValidation(from: string, to: string) {
    return (formGroup: FormGroup) => {
      const fromControl = formGroup.controls[from];
      const toControl = formGroup.controls[to];
      if (fromControl.value && !toControl.value) {
        toControl.setErrors({ mustHaveValue: true });
        return;
      } else if (!fromControl.value && toControl.value) {
        fromControl.setErrors({ mustHaveValue: true });
        return;
      }
      toControl.setErrors(null);
      fromControl.setErrors(null);
    };
  }
}
