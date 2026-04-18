import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  standalone: false,
  selector: 'app-treatment-overview',
  templateUrl: './treatment-overview.component.html',
  styleUrls: ['./treatment-overview.component.scss']
})
export class TreatmentOverviewComponent {
  @Input() treatment: any;

  constructor(private sanitizer: DomSanitizer) {}

  sanitize(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private stripHtml(html: string): string {
    return (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  get quickFacts(): Array<{ label: string; value: string; icon: string }> {
    const facts: Array<{ label: string; value: string; icon: string }> = [];
    if (this.treatment?.costRange?.min || this.treatment?.costRange?.max) {
      const min = this.treatment.costRange.min?.toLocaleString('en-IN') || '';
      const max = this.treatment.costRange.max?.toLocaleString('en-IN') || '';
      facts.push({ label: 'Cost Range', value: `₹${min} - ₹${max}`, icon: '💰' });
    }
    if (this.treatment?.successRate) {
      const sr = this.treatment.successRate;
      const srText = typeof sr === 'number' ? `${sr}%` : String(sr).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      facts.push({ label: 'Success Rate', value: srText, icon: '📊' });
    }
    if (this.treatment?.recoveryTimeline) {
      facts.push({ label: 'Recovery Time', value: this.stripHtml(this.treatment.recoveryTimeline), icon: '⏱️' });
    }
    return facts;
  }
}
