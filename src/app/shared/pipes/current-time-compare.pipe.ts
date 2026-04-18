import { Pipe, PipeTransform } from "@angular/core";
import { getTimeFromString } from "./timecompare.pipe";

@Pipe({
  standalone: false,
  name: "currentTimeCompare",
})
export class CurrentTimeComparePipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    const currentTime = new Date().setSeconds(0, 0);
    const filterdTimeList = value.filter((item: any) => {
      return getTimeFromString(item.label) > currentTime;
    });
    return filterdTimeList;
  }
}
