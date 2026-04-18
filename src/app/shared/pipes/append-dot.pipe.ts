import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  standalone: false,
  name: "appendDot",
})
export class AppendDotPipe implements PipeTransform {
  transform(value: string, ...args: any[]): string {
    return value?.length > (args[0] ?? 15)
      ? value.slice(0, args[0] ?? 15).trim() + "..."
      : value;
  }
}
