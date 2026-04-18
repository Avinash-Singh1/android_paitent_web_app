import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { Router, NavigationEnd } from '@angular/router';
import { SeoService } from './app/services/seo.service';
import { filter } from 'rxjs/operators';

const browserConfig = {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    provideAnimations(),
  ],
};

bootstrapApplication(AppComponent, browserConfig)
  .then((appRef) => {
    // Setup SEO canonical URL updates after bootstrap
    const router = appRef.injector.get(Router);
    const seoService = appRef.injector.get(SeoService);
    
    router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      seoService.setCanonicalUrl();
    });
  })
  .catch((err) => console.error(err));
