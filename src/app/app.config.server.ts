import { mergeApplicationConfig, ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { serverRoutes } from './app.routes.server';
import { appConfig } from './app.config';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Server-side TranslateLoader that reads JSON files from the filesystem
 * instead of making HTTP requests. This prevents a deadlock during SSR
 * route extraction where TranslateHttpLoader would request assets from
 * the same server that is blocked waiting for route extraction to finish.
 */
class ServerTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<Record<string, unknown>> {
    try {
      // In production build: dist/nectar/browser/assets/i18n/
      // In dev mode: src/assets/i18n/ (served by Vite, but we read from disk)
      const paths = [
        join(process.cwd(), 'dist', 'nectar', 'browser', 'assets', 'i18n', `${lang}.json`),
        join(process.cwd(), 'src', 'assets', 'i18n', `${lang}.json`),
      ];
      for (const filePath of paths) {
        try {
          const content = readFileSync(filePath, 'utf-8');
          return of(JSON.parse(content));
        } catch {
          continue;
        }
      }
      return of({});
    } catch {
      return of({});
    }
  }
}

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: ServerTranslateLoader,
        },
      })
    ),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
