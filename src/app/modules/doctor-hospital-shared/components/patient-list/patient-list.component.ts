import {
  AfterViewInit,
  Component,
  Inject,
  OnInit,
  ViewContainerRef,
  DOCUMENT
} from "@angular/core";
import tippy from "tippy.js";
import { PatientDetialsComponent } from "../patient-detials/patient-detials.component";


@Component({
  standalone: false,
  selector: "nectar-patient-list",
  templateUrl: "./patient-list.component.html",
  styleUrls: ["./patient-list.component.scss"],
})
export class PatientListComponent implements OnInit, AfterViewInit {
  constructor(
    private containerRef: ViewContainerRef,
    @Inject(DOCUMENT) private _document: Document
  ) {}

  tooltips: HTMLElement[] = [];
  patientList = [];

  ngOnInit(): void {}

  attachTooltips() {
    const cells = Array.from(this._document.querySelectorAll(".patient"));

    cells.forEach((cell: HTMLElement, i: number) => {
      const component = this.containerRef.createComponent(PatientDetialsComponent);
      component.instance.data = JSON.parse(
        cell.attributes.getNamedItem("data-patients").value
      );
      component.changeDetectorRef.detectChanges();
      const tooltip = tippy(cell, {
        content: component.location.nativeElement,
        placement: "top",
        trigger: "click",
        arrow: false,
        interactive: true,
        offset: [0, 0],
        zIndex: 8,
        appendTo: () => this._document.body,
        theme: "custom-patient", // Use a custom theme
      });
      

      this.tooltips.push(tooltip.popper);
    });
  }

  ngAfterViewInit(): void {
    this.attachTooltips();
  }
}
