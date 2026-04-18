import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  standalone: false,
  name: "appointmentStatus",
})
export class AppointmentStatusPipe implements PipeTransform {
  transform(status: string | number, ...args: unknown[]): string {
    const appointmentStatus: any = {
      0: "booked",
      "-1": "cancelled line-through",
      1: "completed",
      2: "pending",
      "-2": "rescheduled",
    };
    return appointmentStatus[status] || "";
  }
}
