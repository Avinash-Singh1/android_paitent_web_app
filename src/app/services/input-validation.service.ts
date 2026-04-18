import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class InputValidationService {
  alphabetOnly(event: any): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (event.keyCode === 32) {
      if (event.target.value.length > 0) {
        return true;
      } else {
        if (event.keyCode === 32) {
          return false;
        }
      }
    }
    if (
      (charCode >= 97 && charCode <= 122) ||
      (charCode >= 65 && charCode <= 90)
    ) {
      return true;
    } else {
      return false;
    }
  }

  alphaNumericOnly(event: any): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (event.target.value.length > 0 && charCode == 32) {
      return true;
    } else if (
      (charCode >= 65 && charCode <= 90) ||
      (charCode >= 97 && charCode <= 122)
    ) {
      return true;
    } else if (charCode >= 48 && charCode <= 57) {
      return true;
    } else {
      return false;
    }
  }

  alphaNumericOnlyWithDot(event: any) {
    const charCode = event.which ? event.which : event.keyCode;
    if (event.target.value.length > 0 && charCode == 32) {
      return true;
    } else if (
      (charCode >= 65 && charCode <= 90) ||
      (charCode >= 97 && charCode <= 122)
    ) {
      return true;
    } else if (charCode == 46) {
      return true;
    } else if (charCode >= 48 && charCode <= 57) {
      return true;
    } else {
      return false;
    }
  }
  breakspace(event: any) {
    if (event.keyCode === 32) {
      return false;
    }
    return true;
  }
  numbersOnly(event: any) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode >= 48 && charCode <= 57) {
      return true;
    } else {
      return false;
    }
  }
  twoDecimalOnly($event: any) {
    const regexp = /^\d\d*(\.\d{0,2})?$/;
    let newNum = $event?.target?.value + $event.key;
    if (regexp.test(newNum) || $event.keyCode == 8 || $event.keyCode == 46) {
      return true;
    } else {
      return false;
    }
  }
}
