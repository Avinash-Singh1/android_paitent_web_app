import { Injectable } from "@angular/core";
import { ErrorTypes, ERROR_MESSAGES } from "../config/error.message";
@Injectable({
  providedIn: "root",
})
export class ErrorService {
  getErrorValidationMessage(
    formControlName: string,
    errors: [string, any][]
  ): string {
    switch (true) {
      case this.checkErrorType(errors, "required"):
        return ERROR_MESSAGES["required"](formControlName);
      case this.checkErrorType(errors, "invalidYear"):
        return ERROR_MESSAGES["invalidYear"]();
      case this.checkErrorType(errors, "invalidDate"):
        return ERROR_MESSAGES["invalidDate"]();

      case this.checkErrorType(errors, "email"):
        return ERROR_MESSAGES["email"]();

      case this.checkErrorType(errors, "minlength"):
        const minRequirement = this.getErrorMessage(
          errors,
          "minlength"
        )?.requiredLength;
        return ERROR_MESSAGES["minlength"](formControlName, minRequirement);
      case this.checkErrorType(errors, "maxlength"):
        const maxRequirement = this.getErrorMessage(
          errors,
          "maxlength"
        )?.requiredLength;
        return ERROR_MESSAGES["maxlength"](formControlName, maxRequirement);
      default:
        return "";
    }
  }

  checkErrorType(errors: [string, any][], key: ErrorTypes) {
    return errors.some(([errorKey, value]) => errorKey === key);
  }

  getErrorMessage(errors: [string, any][], key: ErrorTypes) {
    return errors.find(([k, v]) => k === key)?.[1];
  }
}
