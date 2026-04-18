import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-treatment-hospitals-section',
  templateUrl: './treatment-hospitals-section.component.html',
  styleUrls: ['./treatment-hospitals-section.component.scss']
})
export class TreatmentHospitalsSectionComponent {
  @Input() hospitals: any[] = [];
  @Input() treatmentTitle: string = '';
  @Input() city: string = '';

  get cityLabel(): string {
    if (!this.city) return '';
    return this.city.charAt(0).toUpperCase() + this.city.slice(1).replace(/-/g, ' ');
  }

  get visibleHospitals(): any[] {
    return this.hospitals?.slice(0, 6) || [];
  }
}
