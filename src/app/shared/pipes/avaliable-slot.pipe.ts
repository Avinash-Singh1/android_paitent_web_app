import { DatePipe } from "@angular/common";
import { Pipe, PipeTransform } from "@angular/core";
import { of } from "rxjs";
import { getTimeFromStringDate } from "src/app/services/helper.service";

@Pipe({
  standalone: false,
  name: "avaliableSlot",
})
export class AvaliableSlotPipe implements PipeTransform {
  constructor(private datepipe: DatePipe) {}
  transform(value: any, bookedSlot: any[], date: Date): any {
    if (value?.length) {
      let currentTime: any = new Date().getTime();
      let avaliableSlot = [];
      avaliableSlot = value.filter((slot: { label: string }) => {
        return !bookedSlot?.includes(slot.label);
      });
      if (
        this.datepipe.transform(date, "yyyy-MM-dd") ==
        this.datepipe.transform(new Date(currentTime), "yyyy-MM-dd")
      ) {
        avaliableSlot = avaliableSlot.filter((item: any) => {
          return getTimeFromStringDate(item.label, date) > currentTime;
        });
      }
      return of(avaliableSlot);
    }
    return of([]);
  }
}
