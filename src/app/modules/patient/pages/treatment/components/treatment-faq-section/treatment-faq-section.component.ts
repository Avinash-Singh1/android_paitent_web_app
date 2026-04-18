import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  standalone: false,
  selector: 'app-treatment-faq-section',
  templateUrl: './treatment-faq-section.component.html',
  styleUrls: ['./treatment-faq-section.component.scss']
})
export class TreatmentFaqSectionComponent {
  @Input() faqArray: any[] = [];
  @Input() faqOverviewArray: any[] = [];
  @Input() treatmentTitle: string = '';

  constructor(private sanitizer: DomSanitizer) {}

  sanitize(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
