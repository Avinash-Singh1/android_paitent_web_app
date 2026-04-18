import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  standalone: false,
  selector: 'app-treatment-types',
  templateUrl: './treatment-types.component.html',
  styleUrls: ['./treatment-types.component.scss']
})
export class TreatmentTypesComponent {
  @Input() treatment: any;

  constructor(private sanitizer: DomSanitizer) {}

  sanitize(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
