import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-treatment-hero',
  templateUrl: './treatment-hero.component.html',
  styleUrls: ['./treatment-hero.component.scss']
})
export class TreatmentHeroComponent {
  @Input() treatment: any;
  @Input() city: string = '';
  @Input() slug: string = '';
  @Input() department: string = '';
  @Input() whatsappLink: string = '';
  @Output() enquirySubmit = new EventEmitter<{ name: string; phone: string; city: string }>();

  enquiryForm = { name: '', phone: '', city: '' };
  formSubmitted = false;

  get cityLabel(): string {
    if (!this.city) return '';
    return this.city.charAt(0).toUpperCase() + this.city.slice(1).replace(/-/g, ' ');
  }

  get breadcrumbs(): Array<{ label: string; link?: string[] }> {
    const c = this.city || 'delhi';
    const cLabel = c.charAt(0).toUpperCase() + c.slice(1).replace(/-/g, ' ');
    // Always use the treatment's actual department for breadcrumb consistency
    const deptSlug = this.treatment?.departmentId?.slug || this.department || '';
    const deptName = this.treatment?.departmentId?.name || '';
    const crumbs: Array<{ label: string; link?: string[] }> = [
      { label: 'Home', link: ['/'] },
      { label: cLabel, link: ['/', c] },
      { label: 'Treatments', link: ['/', c, 'treatment'] },
    ];
    if (deptName && deptSlug) {
      crumbs.push({ label: deptName, link: ['/', c, 'treatment', deptSlug] });
    }
    crumbs.push({ label: this.treatment?.title || '' });
    return crumbs;
  }

  submitEnquiry(): void {
    if (!this.enquiryForm.name || !this.enquiryForm.phone) return;
    this.enquirySubmit.emit({ ...this.enquiryForm });
    this.formSubmitted = true;
  }
}
