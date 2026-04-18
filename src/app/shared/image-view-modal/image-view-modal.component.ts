import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

export interface LightboxData {
  images: string[];
  index: number;
}

@Component({
  standalone: false,
  selector: "nectar-image-view-modal",
  templateUrl: "./image-view-modal.component.html",
  styleUrls: ["./image-view-modal.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageViewModalComponent implements OnInit {
  images: string[] = [];
  currentIndex = 0;
  isGallery = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ImageViewModalComponent>,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    if (this.data && typeof this.data === 'object' && Array.isArray(this.data.images)) {
      this.images = this.data.images;
      this.currentIndex = this.data.index || 0;
      this.isGallery = this.images.length > 1;
    } else {
      // Legacy single-URL mode
      this.images = [this.data];
      this.currentIndex = 0;
      this.isGallery = false;
    }
  }

  get currentUrl(): string {
    return this.images[this.currentIndex] || '';
  }

  get isPdf(): boolean {
    return this.currentUrl.slice(-4) === '.pdf';
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  prev(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.cdr.markForCheck();
    }
  }

  next(): void {
    if (this.currentIndex < this.images.length - 1) {
      this.currentIndex++;
      this.cdr.markForCheck();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') this.prev();
    else if (event.key === 'ArrowRight') this.next();
    else if (event.key === 'Escape') this.onNoClick();
  }
}
