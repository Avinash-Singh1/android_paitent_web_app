
import { Inject, inject, Injectable, PLATFORM_ID, DOCUMENT } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import slugify from "slugify";
import { DeviceService } from "./device.service";

@Injectable({
  providedIn: "root",
})
export class CommonService {
  private readonly deviceService = inject(DeviceService);

  constructor(
    @Inject(DOCUMENT) private _document: Document,
  ) {}

  // replaceSpaceWithHyphen(str: string = "") {
  //   return slugify(str, {
  //     lower: true,
  //     remove: undefined,
  //     strict: true,
  //   });
  // }

  replaceSpaceWithHyphen(str?: string): string {
  const safeStr = (str ?? "").replace(/[/&]+/g, '-');
  return slugify(safeStr, {
    lower: true,
    strict: true,
  });
}

  replaceHyphenWithSpace(str: string = ""): string {
    return str.split("-").join(" ");
  }

  titleCase(str: string = ""): string {
    return str
      .toLowerCase()
      .split(" ")
      .map(function (word) {
        return word.replace(word[0], word[0]?.toUpperCase());
      })
      .join(" ");
  }

  gettingWinowWidth(): number {
    return this.deviceService.getWidth();
  }
}
