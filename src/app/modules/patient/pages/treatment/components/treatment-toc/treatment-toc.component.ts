import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-treatment-toc',
  templateUrl: './treatment-toc.component.html',
  styleUrls: ['./treatment-toc.component.scss']
})
export class TreatmentTocComponent {
  @Input() sections: Array<{ id: string; label: string }> = [];
  @Input() activeSection: string = '';
  @Output() sectionClick = new EventEmitter<string>();

  onSectionClick(id: string): void {
    this.sectionClick.emit(id);
  }
}
