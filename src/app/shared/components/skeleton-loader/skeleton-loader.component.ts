import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nectar-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-wrapper" [ngStyle]="{'width': width, 'height': height}">
      <div class="skeleton-bone" [ngClass]="type" [ngStyle]="customStyle"></div>
    </div>
  `,
  styles: [`
    .skeleton-wrapper {
      display: inline-block;
    }
    .skeleton-bone {
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
      border-radius: 4px;
    }
    .skeleton-bone.circle {
      border-radius: 50%;
    }
    .skeleton-bone.rounded {
      border-radius: 12px;
    }
    .skeleton-bone.text {
      border-radius: 4px;
    }
    .skeleton-bone.card {
      border-radius: 12px;
    }
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `]
})
export class SkeletonLoaderComponent {
  @Input() width: string = '100%';
  @Input() height: string = '16px';
  @Input() type: 'text' | 'circle' | 'rounded' | 'card' = 'text';
  @Input() customStyle: { [key: string]: string } = {};
}
