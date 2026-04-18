import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-treatment-eeat',
  templateUrl: './treatment-eeat.component.html',
  styleUrls: ['./treatment-eeat.component.scss']
})
export class TreatmentEeatComponent {
  @Input() treatment: any;
}
