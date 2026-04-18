import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  standalone: false,
  selector: 'app-treatment-symptoms',
  templateUrl: './treatment-symptoms.component.html',
  styleUrls: ['./treatment-symptoms.component.scss']
})
export class TreatmentSymptomsComponent {
  @Input() treatment: any;

  checkedSymptoms: Set<number> = new Set();
  showResult = false;

  constructor(private sanitizer: DomSanitizer) {}

  sanitize(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  get symptomLines(): string[] {
    if (!this.treatment?.symptoms) return [];
    // Extract list items from HTML or split by newlines
    const text = this.treatment.symptoms.replace(/<[^>]+>/g, '\n');
    return text.split('\n')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 3);
  }

  toggleSymptom(index: number): void {
    if (this.checkedSymptoms.has(index)) {
      this.checkedSymptoms.delete(index);
    } else {
      this.checkedSymptoms.add(index);
    }
    this.showResult = false;
  }

  checkSymptoms(): void {
    this.showResult = true;
  }

  get checkedCount(): number { return this.checkedSymptoms.size; }

  get resultLevel(): string {
    const ratio = this.symptomLines.length > 0
      ? this.checkedCount / this.symptomLines.length : 0;
    if (ratio >= 0.5) return 'high';
    if (ratio >= 0.25) return 'moderate';
    return 'low';
  }

  get resultMessage(): string {
    if (this.resultLevel === 'high') {
      return `You checked ${this.checkedCount} symptoms. We recommend consulting a specialist.`;
    }
    if (this.resultLevel === 'moderate') {
      return `You checked ${this.checkedCount} symptoms. Consider a consultation for proper diagnosis.`;
    }
    return `You checked ${this.checkedCount} symptom(s). Monitor and consult if symptoms persist.`;
  }
}
