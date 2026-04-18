import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { CommonService } from 'src/app/services/common.service';
import { API_ENDPOINTS } from 'src/app/config/api.constant';
import { hospitalTypeToSlug } from 'src/app/config/hospital-types.constant';

/**
 * Backward-compatibility redirect component.
 * Handles old URLs like /:city/hospital/:slug
 * and redirects to /:city/:hospitalType/:slug
 *
 * Fetches the hospital profile to determine its type, then redirects.
 */
@Component({
  standalone: false,
  selector: 'nectar-hospital-redirect',
  template: '<div class="p-4 text-center">Redirecting...</div>',
})
export class HospitalRedirectComponent implements OnInit {
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private commonService: CommonService,
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      const city = params['city'];
      const slug = params['slug'];

      if (!slug) {
        this.router.navigate(['/page-not-found'], { replaceUrl: true });
        return;
      }

      this.apiService
        .get(API_ENDPOINTS.patient.hospitalProfile, {
          establishmentProfileSlug: slug,
        })
        .subscribe({
          next: (res: any) => {
            const hospitalType = res?.result?.[0]?.hospitalType;
            this.doRedirect(city, slug, hospitalType);
          },
          error: () => {
            // Fallback to "hospital" type on error
            this.router.navigate(['/', city, 'hospital', slug], {
              replaceUrl: true,
              skipLocationChange: true,
            });
          },
        });
    });
  }

  private doRedirect(city: string, slug: string, hospitalType: string): void {
    const typeSlug = hospitalTypeToSlug(hospitalType || 'Hospital');
    this.router.navigate(['/', city, typeSlug, slug], { replaceUrl: true });
  }
}
