import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  standalone: false,
  name: "nitifcationTime",
})
export class NitifcationTimePipe implements PipeTransform {
  transform(value: string): string {
    const keyTimestamp = new Date(value);
    const currentTime = new Date();

    const timeDifference = Math.floor(
      (currentTime.getTime() - keyTimestamp.getTime()) / 1000
    ); // Time difference in seconds

    if (timeDifference < 60) {
      return `${timeDifference} seconds ago`;
    } else if (timeDifference < 3600) {
      const minutes = Math.floor(timeDifference / 60);
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else if (timeDifference < 86400) {
      const hours = Math.floor(timeDifference / 3600);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else {
      const days = Math.floor(timeDifference / 86400);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    }
  }
}
