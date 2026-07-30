import { Component, OnInit } from '@angular/core';
import { API_ENDPOINTS } from 'src/app/config/api.constant';
import { ApiService } from 'src/app/services/api.service';

@Component({
  standalone: false,
  selector: 'nectar-prescriptions',
  templateUrl: './prescriptions.component.html',
  styleUrls: ['./prescriptions.component.scss'],
})
export class PrescriptionsComponent implements OnInit {
  prescriptions: any[] = [];
  loading = true;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadPrescriptions();
  }

  loadPrescriptions(): void {
    this.loading = true;
    this.apiService
      .get(`${API_ENDPOINTS.patient.prescriptions}/list`, { page: 1, size: 50 })
      .subscribe({
        next: (res: any) => {
          this.prescriptions = res?.result?.data || [];
          this.loading = false;
        },
        error: () => {
          this.prescriptions = [];
          this.loading = false;
        },
      });
  }

  doctorName(item: any): string {
    return item?.doctorId?.userId?.fullName || 'Doctor';
  }

  openDocument(document: any): void {
    if (document?.url) window.open(document.url, '_blank', 'noopener,noreferrer');
  }
}
