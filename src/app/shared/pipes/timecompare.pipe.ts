import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  standalone: false,
  name: "timecompare",
})
export class TimecomparePipe implements PipeTransform {
  transform(value: any, controlData: any, lesser: boolean = false): any {
    if (controlData) {
      const filterData = value.filter((item: any) => {
        return lesser
          ? getTimeFromString(item.name) < getTimeFromString(controlData)
          : getTimeFromString(item.name) > getTimeFromString(controlData);
      });
      return filterData;
    } else {
      return value;
    }
  }
}

export function getTimeFromString(value: string) {
  const currentDate = new Date();

  // Extract the hour and minute from the time string
  const timeString = value;
  const timeComponents = timeString?.split(":");
  let hour = parseInt(timeComponents[0], 10);
  let minute = parseInt(timeComponents[1]?.split(" ")[0] ?? "00", 10);
  // Adjust the hour value for AM/PM
  if (timeString.indexOf("PM") !== -1 && hour < 12) {
    hour += 12;
  } else if (timeString.indexOf("AM") !== -1 && hour === 12) {
    hour = 0;
  }

  // Set the hour and minute to the current date
  currentDate.setHours(hour, minute, 0);
  return currentDate.getTime();
}
