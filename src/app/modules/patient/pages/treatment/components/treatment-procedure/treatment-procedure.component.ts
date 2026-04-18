import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  standalone: false,
  selector: 'app-treatment-procedure',
  templateUrl: './treatment-procedure.component.html',
  styleUrls: ['./treatment-procedure.component.scss']
})
export class TreatmentProcedureComponent {
  @Input() treatment: any;

  constructor(private sanitizer: DomSanitizer) {}

  sanitize(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  get procedureSteps(): string[] {
    if (!this.treatment?.procedureSteps) return [];
    const text = this.treatment.procedureSteps.replace(/<[^>]+>/g, '\n');
    return text.split('\n')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 3);
  }
}
