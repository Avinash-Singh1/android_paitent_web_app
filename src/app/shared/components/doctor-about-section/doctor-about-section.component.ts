import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { FormatTimeService } from "src/app/services/format-time.service";
import { GoogleMapsService } from "src/app/services/google-maps.service";
import { ImageViewModalComponent } from "../../image-view-modal/image-view-modal.component";
import { MatDialog } from "@angular/material/dialog";
import { NoopScrollStrategy } from "@angular/cdk/overlay";

@Component({
  standalone: false,
  selector: "nectar-doctor-about-section",
  templateUrl: "./doctor-about-section.component.html",
  styleUrls: ["./doctor-about-section.component.scss"],
})
export class DoctorAboutSectionComponent implements OnChanges {
  @Input() id: any;
  @Input() hospitalData: any;
  isExpanded: boolean = false;
  data: any;
  isvideo: any;
  galleryOffset = 0;
  galleryPageSize = 4;

  get visibleImages(): any[] {
    if (!this.data?.images) return [];
    return this.data.images.slice(this.galleryOffset, this.galleryOffset + this.galleryPageSize);
  }

  constructor(
    private formatTimeService: FormatTimeService,
    public gService: GoogleMapsService,
    private dialog: MatDialog,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['hospitalData'] && this.hospitalData) {
      this.processData(JSON.parse(JSON.stringify(this.hospitalData)));
    }
  }

  private processData(raw: any) {
    this.data = raw;
    this.isvideo = this.data?.name;

    // Format address into multi-line string
    if (this.data?.address && typeof this.data.address === 'object') {
      const addr = this.data.address;
      const lines: string[] = [];
      if (addr.landmark) lines.push(addr.landmark);
      if (addr.locality) lines.push(addr.locality);
      const cityParts: string[] = [];
      if (addr.city) cityParts.push(addr.city);
      if (addr.state && addr.state.toLowerCase() !== addr.city?.toLowerCase()) cityParts.push(addr.state);
      if (addr.pincode) cityParts.push(addr.pincode);
      if (cityParts.length) lines.push(cityParts.join(', '));
      this.data.address = lines.join('\n');
    }

    // Ensure about is an array before using map
    if (Array.isArray(this.data?.about)) {
      this.isExpanded = this.data.about.map(() => false);
    }

    // Process timing
    if (this.data?.establishmentTiming) {
      const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
      Object.keys(this.data.establishmentTiming).forEach((key) => {
        if (!days.includes(key)) delete this.data.establishmentTiming[key];
      });
      this.data.establishmentTiming = this.formatTimeService.dateTimeConversion(
        this.data.establishmentTiming
      );
    }
  }

  viewImage(index: number) {
    const urls = (this.data?.images || []).map((img: any) => img?.url).filter(Boolean);
    this.dialog.open(ImageViewModalComponent, {
      data: { images: urls, index },
      autoFocus: false,
      scrollStrategy: new NoopScrollStrategy(),
    });
  }

  galleryPrev() {
    this.galleryOffset = Math.max(0, this.galleryOffset - this.galleryPageSize);
  }

  galleryNext() {
    if (this.data?.images && this.galleryOffset + this.galleryPageSize < this.data.images.length) {
      this.galleryOffset += this.galleryPageSize;
    }
  }

  toggleReadMore(): void {
    this.isExpanded = !this.isExpanded;
  }
}
