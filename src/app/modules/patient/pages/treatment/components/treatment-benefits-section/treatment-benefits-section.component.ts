import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  standalone: false,
  selector: 'app-treatment-benefits-section',
  templateUrl: './treatment-benefits-section.component.html',
  styleUrls: ['./treatment-benefits-section.component.scss']
})
export class TreatmentBenefitsSectionComponent {
  @Input() treatment: any;

  constructor(private sanitizer: DomSanitizer) {}

  sanitize(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  get benefitItems(): string[] {
    if (!this.treatment?.benefits) return [];
    const text = this.treatment.benefits.replace(/<[^>]+>/g, '\n');
    return text.split('\n')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 3);
  }

  readonly benefitIcons = ['✅', '🎯', '⚡', '💪', '🏥', '♻️', '🔬', '💊', '🩺', '🌟'];
}
