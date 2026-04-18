import { Component, Input, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { API_ENDPOINTS } from 'src/app/config/api.constant';
import { ApiService } from 'src/app/services/api.service';

@Component({
  standalone: false,
  selector: 'app-treatment-related',
  templateUrl: './treatment-related.component.html',
  styleUrls: ['./treatment-related.component.scss']
})
export class TreatmentRelatedComponent implements OnInit {
  @Input() relatedTreatments: any[] = [];
  @Input() city: string = '';
  @Input() slug: string = '';
  @Input() department: string = '';
  @Input() subtopics: any;
  @Input() treatmentTitle: string = '';

  allDepartments: any[] = [];
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly topCities = [
    'delhi', 'mumbai', 'bangalore', 'hyderabad', 'chennai',
    'kolkata', 'pune', 'ahmedabad', 'jaipur', 'lucknow',
    'chandigarh', 'patna', 'gurgaon', 'noida', 'ghaziabad'
  ];

  constructor(
    private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadAllDepartments();
  }

  loadAllDepartments() {
this.apiService.get(API_ENDPOINTS.patient.getDepartments, {})
      .subscribe({
        next: (res: any) => {
          this.allDepartments = res?.result || [];
        } });
  }

  get otherDepartments(): any[] {
    return this.allDepartments.filter(
      (d: any) => d.slug && d.slug !== this.department && d.countOfSurgery > 0
    );
  }

  getCityLabel(c: string): string {
    return c.charAt(0).toUpperCase() + c.slice(1).replace(/-/g, ' ');
  }

  scrollToTop() {
    if (this.isBrowser) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }
}
