import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  standalone: false,
  selector: 'app-treatment-recovery',
  templateUrl: './treatment-recovery.component.html',
  styleUrls: ['./treatment-recovery.component.scss']
})
export class TreatmentRecoveryComponent {
  @Input() treatment: any;

  constructor(private sanitizer: DomSanitizer) {}

  sanitize(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  get timelineItems(): Array<{ phase: string; detail: string }> {
    if (!this.treatment?.recoveryTimeline) return [];
    const text = this.treatment.recoveryTimeline.replace(/<[^>]+>/g, '\n');
    const lines = text.split('\n').map((s: string) => s.trim()).filter((s: string) => s.length > 3);
    return lines.map((line: string) => {
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0 && colonIdx < 40) {
        return { phase: line.substring(0, colonIdx).trim(), detail: line.substring(colonIdx + 1).trim() };
      }
      return { phase: '', detail: line };
    });
  }

  readonly phaseIcons = ['🏥', '🏠', '🚶', '💪', '✅', '🎉'];

  get successRateNum(): number {
    const raw = this.treatment?.successRate;
    if (!raw) return 0;
    if (typeof raw === 'number') return raw;
    const text = String(raw).replace(/<[^>]+>/g, '');
    const match = text.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  get successRateText(): string {
    const raw = this.treatment?.successRate;
    if (!raw) return '';
    if (typeof raw === 'number') return '';
    return String(raw).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }
}
