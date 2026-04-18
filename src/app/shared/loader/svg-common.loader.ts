import { isPlatformServer } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { inject, PLATFORM_ID } from "@angular/core";
import { SvgHttpLoader, SvgLoader } from "angular-svg-icon";
import { Observable, of } from "rxjs";

export function svgLoaderFactory(http: HttpClient): SvgLoader {
  const platformId = inject(PLATFORM_ID);
  if (isPlatformServer(platformId)) {
    return { getSvg: (_url: string): Observable<string> => of('<svg></svg>') } as SvgLoader;
  }
  return new SvgHttpLoader(http);
}
