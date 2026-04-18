import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonLoaderComponent } from '../skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'nectar-hospital-card-skeleton',
  standalone: true,
  imports: [CommonModule, SkeletonLoaderComponent],
  template: `
    <div class="skeleton-hospital-section" *ngFor="let i of skeletonItems">
      <div class="skeleton-hospital-detail">
        <div class="d-flex justify-content-between align-items-center">
          <div class="d-flex gap-3" style="align-items: center;">
            <!-- Profile icon skeleton -->
            <nectar-skeleton-loader
              [width]="isMobile ? '72px' : '102px'"
              [height]="isMobile ? '72px' : '52px'"
              [type]="isMobile ? 'circle' : 'rounded'"
            ></nectar-skeleton-loader>

            <div style="flex: 1;">
              <!-- Name -->
              <nectar-skeleton-loader width="220px" height="22px" type="text"></nectar-skeleton-loader>
              <!-- Type + Location -->
              <div class="d-flex gap-3 my-2">
                <nectar-skeleton-loader width="100px" height="16px" type="text"></nectar-skeleton-loader>
                <nectar-skeleton-loader width="160px" height="16px" type="text"></nectar-skeleton-loader>
              </div>
              <!-- Beds + Ambulance (mobile) -->
              <div class="d-flex gap-2" *ngIf="isMobile">
                <nectar-skeleton-loader width="80px" height="16px" type="text"></nectar-skeleton-loader>
                <nectar-skeleton-loader width="100px" height="16px" type="text"></nectar-skeleton-loader>
              </div>
            </div>
          </div>

          <!-- Desktop: beds/ambulance/rating on right -->
          <div *ngIf="!isMobile" class="d-flex flex-column align-items-end gap-2">
            <nectar-skeleton-loader width="120px" height="20px" type="text"></nectar-skeleton-loader>
            <nectar-skeleton-loader width="140px" height="20px" type="text"></nectar-skeleton-loader>
            <nectar-skeleton-loader width="80px" height="28px" type="rounded"></nectar-skeleton-loader>
          </div>
        </div>
      </div>

      <!-- Doctor cards skeleton row -->
      <div class="skeleton-card-wrapper">
        <div class="d-flex gap-3" style="overflow: hidden;">
          <div *ngFor="let j of cardItems" class="skeleton-doc-card">
            <nectar-skeleton-loader width="84px" height="84px" type="circle"></nectar-skeleton-loader>
            <nectar-skeleton-loader width="130px" height="16px" type="text" [customStyle]="{'margin-top': '12px'}"></nectar-skeleton-loader>
            <nectar-skeleton-loader width="100px" height="14px" type="text" [customStyle]="{'margin-top': '6px'}"></nectar-skeleton-loader>
            <nectar-skeleton-loader width="80px" height="14px" type="text" [customStyle]="{'margin-top': '6px'}"></nectar-skeleton-loader>
            <div class="d-flex align-items-center justify-content-between mt-2" style="width: 100%;">
              <nectar-skeleton-loader width="60px" height="28px" type="rounded"></nectar-skeleton-loader>
              <nectar-skeleton-loader width="70px" height="16px" type="text"></nectar-skeleton-loader>
            </div>
            <nectar-skeleton-loader width="100%" height="36px" type="rounded" [customStyle]="{'margin-top': '10px'}"></nectar-skeleton-loader>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .skeleton-hospital-section {
      border: 1px solid rgba(0, 0, 0, 0.12);
      margin-bottom: 14px;
      max-width: 1155px;

      @media (max-width: 776px) {
        border: none;
        margin-bottom: 0;
        border-bottom: 1px solid rgba(0, 0, 0, 0.12);
        border-top: 1px solid rgba(0, 0, 0, 0.12);
      }
    }

    .skeleton-hospital-detail {
      padding: 24px 24px 0;

      @media (max-width: 776px) {
        padding: 16px;
      }
    }

    .skeleton-card-wrapper {
      padding: 24px;

      @media (max-width: 776px) {
        padding: 0 0 16px 16px;
      }
    }

    .skeleton-doc-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 12px;
      padding: 12px;
      min-width: 260px;
      width: 260px;
      flex-shrink: 0;
    }
  `]
})
export class HospitalCardSkeletonComponent {
  @Input() count: number = 3;
  @Input() isMobile: boolean = false;

  get skeletonItems(): number[] {
    return Array(this.count).fill(0);
  }

  get cardItems(): number[] {
    return this.isMobile ? [0] : [0, 1, 2, 3];
  }
}
