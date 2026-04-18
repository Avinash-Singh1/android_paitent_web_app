import {
  ApplicationConfig,
  importProvidersFrom,
  PLATFORM_ID,
  provideZoneChangeDetection,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { provideRouter, withPreloading, PreloadAllModules, withInMemoryScrolling } from '@angular/router';
import { environment } from '../environments/environment';
import { provideToastr } from 'ngx-toastr';
import { routes } from './app.routes';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi,
} from '@angular/common/http';

import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { DatePipe, IMAGE_CONFIG } from '@angular/common';
import { provideClientHydration, withEventReplay, withHttpTransferCacheOptions } from '@angular/platform-browser';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AppInterceptor } from './interceptor/app.interceptor';
import { ErrorInterceptor } from './interceptor/error.interceptor';
import { SsrTimeoutInterceptor } from './interceptor/ssr-timeout.interceptor';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { StarRatingConfigService } from 'angular-star-rating';
import { provideStore } from '@ngrx/store';
import {provideStoreDevtools} from '@ngrx/store-devtools';
import { isDevMode } from '@angular/core';
import { appReducer } from './store/counter.reducer';
import { shareIcons } from 'ngx-sharebuttons/icons';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }), ...(environment.production ? [withPreloading(PreloadAllModules)] : [])),
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    provideClientHydration(withEventReplay(), withHttpTransferCacheOptions({ includePostRequests: true })),
    provideToastr(),
    shareIcons(),
    DatePipe,
    TranslateService,
    StarRatingConfigService,
    TranslateStore,
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    { provide: HTTP_INTERCEPTORS, useClass: SsrTimeoutInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: AppInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    {
      provide: IMAGE_CONFIG,
      useValue: {
        disableImageSizeWarning: true,
        disableImageLazyLoadWarning: false
      }
    },

    // ✅ NgRx Store setup
    // provideStore({ counter: counterReducer, app: appReducer }),
    provideStore({app: appReducer }),

    // DevTools only in dev mode AND only in browser
    ...(isDevMode() && typeof window !== 'undefined' ? [provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
    })] : []),

    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: (http: HttpClient) =>
            new TranslateHttpLoader(http, 'assets/i18n/', '.json'),
          deps: [HttpClient],
        },
      })
    ),
  ],
};
