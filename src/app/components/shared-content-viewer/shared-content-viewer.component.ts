import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  HostListener,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { ChatAttachment } from 'src/app/services/persistent-video-call.service';

/**
 * Shared content viewer for images and documents.
 * Opens in a modal overlay while keeping the video call active.
 * 
 * Features:
 * - Image zoom (pinch, scroll, buttons)
 * - Image pan (drag)
 * - PDF preview
 * - Keyboard shortcuts (ESC, arrow keys)
 * - Download button
 * - Picture-in-picture video continues in background
 */
@Component({
  standalone: false,
  selector: 'app-shared-content-viewer',
  templateUrl: './shared-content-viewer.component.html',
  styleUrls: ['./shared-content-viewer.component.scss'],
})
export class SharedContentViewerComponent implements OnInit, OnDestroy {
  @Input() attachment: ChatAttachment | null = null;
  @Input() allAttachments: ChatAttachment[] = []; // For navigation
  @Output() close = new EventEmitter<void>();

  @ViewChild('imageContainer') imageContainer?: ElementRef<HTMLDivElement>;
  @ViewChild('image') image?: ElementRef<HTMLImageElement>;

  // Zoom state
  scale = 1;
  minScale = 0.5;
  maxScale = 5;
  scaleStep = 0.25;

  // Pan state
  translateX = 0;
  translateY = 0;
  isPanning = false;
  startX = 0;
  startY = 0;

  // Touch state
  initialDistance = 0;
  initialScale = 1;

  // Loading state
  loading = false;
  error = false;

  constructor() {}

  ngOnInit(): void {
    this.resetTransform();
  }

  ngOnDestroy(): void {
    // Cleanup
  }

  // ── Keyboard Shortcuts ─────────────────────────────────────────────────
  @HostListener('document:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent): void {
    if (!this.attachment) return;

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.onClose();
        break;
      
      case '+':
      case '=':
        event.preventDefault();
        this.zoomIn();
        break;
      
      case '-':
      case '_':
        event.preventDefault();
        this.zoomOut();
        break;
      
      case '0':
        event.preventDefault();
        this.resetZoom();
        break;
      
      case 'ArrowLeft':
        event.preventDefault();
        this.navigatePrevious();
        break;
      
      case 'ArrowRight':
        event.preventDefault();
        this.navigateNext();
        break;
    }
  }

  // ── Mouse Events (Desktop) ─────────────────────────────────────────────
  onMouseDown(event: MouseEvent): void {
    if (!this.isImage) return;
    
    this.isPanning = true;
    this.startX = event.clientX - this.translateX;
    this.startY = event.clientY - this.translateY;
    event.preventDefault();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.isPanning) return;

    this.translateX = event.clientX - this.startX;
    this.translateY = event.clientY - this.startY;
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    this.isPanning = false;
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent): void {
    if (!this.isImage) return;

    event.preventDefault();
    
    // Zoom with mouse wheel
    const delta = event.deltaY > 0 ? -1 : 1;
    const newScale = this.scale + (delta * this.scaleStep);
    
    if (newScale >= this.minScale && newScale <= this.maxScale) {
      this.scale = newScale;
    }
  }

  // ── Touch Events (Mobile) ──────────────────────────────────────────────
  onTouchStart(event: TouchEvent): void {
    if (!this.isImage) return;

    if (event.touches.length === 1) {
      // Single touch - pan
      this.isPanning = true;
      this.startX = event.touches[0].clientX - this.translateX;
      this.startY = event.touches[0].clientY - this.translateY;
    } else if (event.touches.length === 2) {
      // Two fingers - pinch zoom
      this.isPanning = false;
      this.initialDistance = this.getDistance(event.touches[0], event.touches[1]);
      this.initialScale = this.scale;
    }
  }

  onTouchMove(event: TouchEvent): void {
    if (!this.isImage) return;

    if (event.touches.length === 1 && this.isPanning) {
      // Pan
      this.translateX = event.touches[0].clientX - this.startX;
      this.translateY = event.touches[0].clientY - this.startY;
    } else if (event.touches.length === 2) {
      // Pinch zoom
      event.preventDefault();
      const currentDistance = this.getDistance(event.touches[0], event.touches[1]);
      const scale = (currentDistance / this.initialDistance) * this.initialScale;
      
      if (scale >= this.minScale && scale <= this.maxScale) {
        this.scale = scale;
      }
    }
  }

  onTouchEnd(): void {
    this.isPanning = false;
    this.initialDistance = 0;
  }

  private getDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // ── Zoom Controls ──────────────────────────────────────────────────────
  zoomIn(): void {
    if (this.scale < this.maxScale) {
      this.scale += this.scaleStep;
    }
  }

  zoomOut(): void {
    if (this.scale > this.minScale) {
      this.scale -= this.scaleStep;
    }
  }

  resetZoom(): void {
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;
  }

  fitToScreen(): void {
    // Fit image to screen while maintaining aspect ratio
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;
  }

  private resetTransform(): void {
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;
  }

  // ── Navigation ─────────────────────────────────────────────────────────
  navigatePrevious(): void {
    if (!this.attachment || this.allAttachments.length <= 1) return;

    const currentIndex = this.allAttachments.findIndex(a => a.id === this.attachment?.id);
    if (currentIndex > 0) {
      this.attachment = this.allAttachments[currentIndex - 1];
      this.resetTransform();
    }
  }

  navigateNext(): void {
    if (!this.attachment || this.allAttachments.length <= 1) return;

    const currentIndex = this.allAttachments.findIndex(a => a.id === this.attachment?.id);
    if (currentIndex < this.allAttachments.length - 1) {
      this.attachment = this.allAttachments[currentIndex + 1];
      this.resetTransform();
    }
  }

  get canNavigatePrevious(): boolean {
    if (!this.attachment || this.allAttachments.length <= 1) return false;
    const currentIndex = this.allAttachments.findIndex(a => a.id === this.attachment?.id);
    return currentIndex > 0;
  }

  get canNavigateNext(): boolean {
    if (!this.attachment || this.allAttachments.length <= 1) return false;
    const currentIndex = this.allAttachments.findIndex(a => a.id === this.attachment?.id);
    return currentIndex < this.allAttachments.length - 1;
  }

  get currentPosition(): string {
    if (!this.attachment || this.allAttachments.length <= 1) return '';
    const currentIndex = this.allAttachments.findIndex(a => a.id === this.attachment?.id);
    return `${currentIndex + 1} / ${this.allAttachments.length}`;
  }

  // ── Actions ────────────────────────────────────────────────────────────
  onClose(): void {
    this.close.emit();
  }

  download(): void {
    if (!this.attachment?.url) return;

    const link = document.createElement('a');
    link.href = this.attachment.url;
    link.download = this.attachment.fileName;
    link.target = '_blank';
    link.click();
  }

  onImageLoad(): void {
    this.loading = false;
    this.error = false;
  }

  onImageError(): void {
    this.loading = false;
    this.error = true;
  }

  // ── Computed Properties ────────────────────────────────────────────────
  get isImage(): boolean {
    return this.attachment?.fileType === 'image';
  }

  get isPdf(): boolean {
    return this.attachment?.mimeType === 'application/pdf';
  }

  get isDocument(): boolean {
    return !!this.attachment && !this.isImage && !this.isPdf;
  }

  get transformStyle(): string {
    return `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
  }

  get zoomPercentage(): number {
    return Math.round(this.scale * 100);
  }

  get canZoomIn(): boolean {
    return this.scale < this.maxScale;
  }

  get canZoomOut(): boolean {
    return this.scale > this.minScale;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}
