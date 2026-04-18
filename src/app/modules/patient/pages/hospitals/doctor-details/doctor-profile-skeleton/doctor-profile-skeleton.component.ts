import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonLoaderComponent } from 'src/app/shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'nectar-doctor-profile-skeleton',
  standalone: true,
  imports: [CommonModule, SkeletonLoaderComponent],
  template: `
    <div class="skeleton-profile">
      <!-- Breadcrumb skeleton -->
      <div class="skeleton-breadcrumb">
        <nectar-skeleton-loader width="300px" height="14px" type="text"></nectar-skeleton-loader>
      </div>

      <div class="skeleton-grid">
        <div class="skeleton-main">
          <div class="skeleton-header">
            <!-- Profile image -->
            <nectar-skeleton-loader width="130px" height="130px" type="rounded"></nectar-skeleton-loader>

            <div class="skeleton-info">
              <!-- Name -->
              <nectar-skeleton-loader width="280px" height="28px" type="text"></nectar-skeleton-loader>
              <!-- Education -->
              <nectar-skeleton-loader width="220px" height="16px" type="text"></nectar-skeleton-loader>
              <!-- Specialization -->
              <nectar-skeleton-loader width="180px" height="16px" type="text"></nectar-skeleton-loader>
              <!-- Experience -->
              <nectar-skeleton-loader width="200px" height="16px" type="text"></nectar-skeleton-loader>
              <!-- Rating -->
              <div class="skeleton-rating">
                <nectar-skeleton-loader width="100px" height="20px" type="text"></nectar-skeleton-loader>
                <nectar-skeleton-loader width="80px" height="20px" type="text"></nectar-skeleton-loader>
              </div>
              <!-- Fees -->
              <div class="skeleton-fees">
                <nectar-skeleton-loader width="60px" height="24px" type="rounded"></nectar-skeleton-loader>
                <nectar-skeleton-loader width="80px" height="18px" type="text"></nectar-skeleton-loader>
                <nectar-skeleton-loader width="80px" height="18px" type="text"></nectar-skeleton-loader>
              </div>
            </div>
          </div>

          <!-- Tabs skeleton -->
          <div class="skeleton-tabs">
            <nectar-skeleton-loader width="80px" height="32px" type="rounded"></nectar-skeleton-loader>
            <nectar-skeleton-loader width="80px" height="32px" type="rounded"></nectar-skeleton-loader>
            <nectar-skeleton-loader width="80px" height="32px" type="rounded"></nectar-skeleton-loader>
            <nectar-skeleton-loader width="80px" height="32px" type="rounded"></nectar-skeleton-loader>
            <nectar-skeleton-loader width="80px" height="32px" type="rounded"></nectar-skeleton-loader>
          </div>

          <!-- Content skeleton -->
          <div class="skeleton-content">
            <nectar-skeleton-loader width="100%" height="16px" type="text"></nectar-skeleton-loader>
            <nectar-skeleton-loader width="95%" height="16px" type="text"></nectar-skeleton-loader>
            <nectar-skeleton-loader width="88%" height="16px" type="text"></nectar-skeleton-loader>
            <nectar-skeleton-loader width="92%" height="16px" type="text"></nectar-skeleton-loader>
            <nectar-skeleton-loader width="70%" height="16px" type="text"></nectar-skeleton-loader>
          </div>
        </div>

        <!-- Sidebar skeleton (desktop) -->
        <div class="skeleton-sidebar">
          <nectar-skeleton-loader width="100%" height="350px" type="card"></nectar-skeleton-loader>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }
    .skeleton-profile {
      max-width: 1200px;
      margin: 0 auto;
      padding: 16px 24px;
    }
    .skeleton-breadcrumb {
      margin-bottom: 20px;
    }
    @media (max-width: 767px) {
      .skeleton-breadcrumb { padding-top: 56px; }
    }
    .skeleton-grid {
      display: grid;
      grid-template-columns: 1fr 360px;
      gap: 24px;
    }
    .skeleton-header {
      display: flex;
      gap: 20px;
      margin-bottom: 24px;
    }
    @media (max-width: 767px) {
      .skeleton-header {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
    }
    .skeleton-info {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .skeleton-rating {
      display: flex;
      gap: 12px;
      align-items: center;
    }
    .skeleton-fees {
      display: flex;
      gap: 12px;
      align-items: center;
    }
    .skeleton-tabs {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    .skeleton-content {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    @media (max-width: 767px) {
      .skeleton-profile {
        padding: 12px 16px;
      }
      .skeleton-grid {
        grid-template-columns: 1fr;
      }
      .skeleton-sidebar {
        display: none;
      }
      .skeleton-header nectar-skeleton-loader:first-child {
        min-width: 80px;
      }
    }
  `]
})
export class DoctorProfileSkeletonComponent {}
