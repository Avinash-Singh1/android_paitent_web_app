import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable, timeout, catchError, EMPTY } from 'rxjs';

const SSR_TIMEOUT_MS = 3000;

@Injectable()
export class SsrTimeoutInterceptor implements HttpInterceptor {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.isBrowser) {
      return next.handle(req);
    }

    return next.handle(req).pipe(
      timeout(SSR_TIMEOUT_MS),
      catchError(() => EMPTY)
    );
  }
}
