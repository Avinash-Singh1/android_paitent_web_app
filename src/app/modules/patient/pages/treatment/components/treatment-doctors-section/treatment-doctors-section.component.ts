import { Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-treatment-doctors-section',
  templateUrl: './treatment-doctors-section.component.html',
  styleUrls: ['./treatment-doctors-section.component.scss']
})
export class TreatmentDoctorsSectionComponent {
  @Input() doctors: any[] = [];
  @Input() treatmentTitle: string = '';
  @Input() city: string = '';
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLElement>;

  get cityLabel(): string {
    if (!this.city) return '';
    return this.city.charAt(0).toUpperCase() + this.city.slice(1).replace(/-/g, ' ');
  }

  get visibleDoctors(): any[] {
    return this.doctors?.slice(0, 6) || [];
  }

  scrollLeft(): void {
    this.scrollContainer?.nativeElement.scrollBy({ left: -300, behavior: 'smooth' });
  }

  scrollRight(): void {
    this.scrollContainer?.nativeElement.scrollBy({ left: 300, behavior: 'smooth' });
  }
}
