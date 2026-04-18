import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  standalone: false,
  name: "filterAppointment",
})
export class FilterAppointmentPipe implements PipeTransform {
  transform(value: any[], ...args: any[]): any[] {
    return value.reduce((accu, curr: any) => {
      return accu.concat(
        curr.data.filter((item: any) => {
          return item[args[0]] == args[1];
        })
      );
    }, []);
  }
}
