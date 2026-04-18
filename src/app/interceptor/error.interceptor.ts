import { Injectable } from "@angular/core";
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { Router } from "@angular/router";

import { LocalStorageService } from "../services/storage.service";
import { EventService } from "../services/event.service";
import { ToastrService } from "ngx-toastr";
import { environment } from 'src/environments/environment';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private localStorage: LocalStorageService,
    private router: Router,
    private eventService: EventService,
    private toastr: ToastrService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Skip toast for external API calls (IP geolocation, etc.)
        const isOwnApi = request.url.startsWith(environment.baseUrl);

        this.eventService.broadcastEvent("LOADER", {
          display: false,
          req: null,
        });
        if (error.status === 401 && isOwnApi) {
          this.localStorage.removeAllItem();
          this.router.navigate(["/"]);
        }
        if (isOwnApi) {
          this.toastr.error(error?.error?.message ?? "Something went wrong");
        }
        return throwError(() => error);
      })
    );
  }
}
