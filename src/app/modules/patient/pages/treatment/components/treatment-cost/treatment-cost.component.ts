import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-treatment-cost',
  templateUrl: './treatment-cost.component.html',
  styleUrls: ['./treatment-cost.component.scss']
})
export class TreatmentCostComponent {
  @Input() treatment: any;
  @Input() city: string = '';
  @Input() slug: string = '';
  @Input() department: string = '';

  get cityLabel(): string {
    if (!this.city) return '';
    return this.city.charAt(0).toUpperCase() + this.city.slice(1).replace(/-/g, ' ');
  }

  get avgCost(): number {
    const min = this.treatment?.costRange?.min || 0;
    const max = this.treatment?.costRange?.max || 0;
    return min && max ? Math.round((min + max) / 2) : 0;
  }

  readonly costFactors = [
    { icon: '🏥', label: 'Hospital Type', desc: 'Government vs private facility' },
    { icon: '👨‍⚕️', label: 'Doctor Experience', desc: 'Senior surgeon vs junior' },
    { icon: '🌆', label: 'City', desc: 'Metro cities cost more' },
    { icon: '🛏️', label: 'Room Type', desc: 'General vs private room' },
    { icon: '🔬', label: 'Technique Used', desc: 'Open vs Laparoscopic' },
    { icon: '🛡️', label: 'Insurance Cover', desc: 'Your policy coverage' }
  ];
}
