import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  standalone: true,
  name: "nameInitial",
})
export class NameInitialPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return '';
    }
    const splitArray = value.replace(/dr\./i, "").trim().split(" ");
    let nameInitial = "";
    for (let i = 0; i < splitArray.length; i++) {
      if (i >= 2) {
        break;
      }
      nameInitial += splitArray[i].substring(0, 1);
    }
    return nameInitial;
  }
}
