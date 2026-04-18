import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nectar-doctor-card-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="doctor-skeleton" *ngFor="let i of cards">
      <div class="doctor-skeleton__left">
        <!-- Profile pic circle -->
        <div class="skeleton-bone circle avatar"></div>
        <!-- Doctor details -->
        <div class="doctor-skeleton__info">
          <div class="skeleton-bone text name-line"></div>
          <div class="skeleton-bone text spec-line"></div>
          <div class="skeleton-bone text edu-line"></div>
          <div class="skeleton-bone text exp-line"></div>
          <div class="doctor-skeleton__badges">
            <div class="skeleton-bone rounded badge-box"></div>
            <div class="skeleton-bone rounded badge-box"></div>
          </div>
          <div class="skeleton-bone text addr-line"></div>
          <div class="skeleton-bone text clinic-line"></div>
        </div>
      </div>
      <div class="doctor-skeleton__right">
        <div class="skeleton-bone rounded slot-box" *ngFor="let j of slots"></div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .doctor-skeleton {
      display: grid;
      grid-template-columns: 36% 64%;
      gap: 5px;
      padding: 12px 10px;
      border: 1px solid #e0e0e0;
      border-bottom: none;
    }
    .doctor-skeleton:last-child { border-bottom: 1px solid #e0e0e0; }

    @media screen and (max-width: 991px) {
      .doctor-skeleton { grid-template-columns: 1fr; }
      .doctor-skeleton__right { display: none; }
    }

    .doctor-skeleton__left {
      display: flex;
      gap: 20px;
    }

    .doctor-skeleton__info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .doctor-skeleton__badges {
      display: flex;
      gap: 8px;
    }

    .doctor-skeleton__right {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      padding-top: 8px;
    }

    .skeleton-bone {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
    }
    .skeleton-bone.circle { border-radius: 50%; }
    .skeleton-bone.text { border-radius: 4px; }
    .skeleton-bone.rounded { border-radius: 8px; }

    .avatar { width: 106px; height: 106px; flex-shrink: 0; }
    @media screen and (max-width: 1120px) { .avatar { width: 80px; height: 80px; } }
    @media screen and (max-width: 576px) { .avatar { width: 64px; height: 64px; } }

    .name-line { width: 60%; height: 18px; }
    .spec-line { width: 40%; height: 14px; }
    .edu-line { width: 50%; height: 14px; }
    .exp-line { width: 45%; height: 14px; }
    .badge-box { width: 80px; height: 28px; }
    .addr-line { width: 55%; height: 14px; }
    .clinic-line { width: 35%; height: 14px; }
    .slot-box { width: 64px; height: 72px; }

    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `]
})
export class DoctorCardSkeletonComponent {
  @Input() count: number = 5;

  get cards(): number[] {
    return Array.from({ length: this.count }, (_, i) => i);
  }

  readonly slots = [0, 1, 2, 3, 4, 5, 6];
}
