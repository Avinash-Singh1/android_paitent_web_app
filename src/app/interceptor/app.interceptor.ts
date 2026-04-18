import { inject, Injectable, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse } from "@angular/common/http";
import { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { LocalStorageService } from "../services/storage.service";
import { EventService } from "../services/event.service";
@Injectable()
export class AppInterceptor implements HttpInterceptor {
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  constructor(
    private storage: LocalStorageService,
    private eventService: EventService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // On the server, skip LOADER events and token handling — just add API key and pass through
    if (!this.isBrowser) {
      if (request.url.includes(environment.baseUrl)) {
        request = this.addApikey(request, environment.API_KEY);
      }
      return next.handle(request);
    }

    this.eventService.count = 0;
    this.eventService.broadcastEvent("LOADER", {
      display: true,
      req: request.url,
    });

    const accessToken = this.storage.getItem("token")
      ? this.storage.getItem("token")
      : "";

    if (request.url.includes(environment.baseUrl)) {
      request = accessToken ? this.addToken(request, accessToken) : request;

      request = this.addApikey(request, environment.API_KEY);
    }

    return next.handle(request).pipe(
      map<HttpEvent<any>, any>((evt: HttpEvent<any>) => {
        if (
          evt instanceof HttpResponse &&
          this.eventService.checkList(request.url)
        ) {
          this.eventService.broadcastEvent("LOADER", {
            display: false,
            req: null,
          });
        }
        return evt;
      }),
      tap((data: any) => {})
    );
  }
  private addApikey(request: HttpRequest<any>, apikey: string) {
    return request.clone({
      setHeaders: {
        // api_key: `${apikey}`,
        "x-api-key": `${apikey}`,
      },
    });
  }
  private addToken(request: HttpRequest<any>, accessToken: string): any {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }
}
