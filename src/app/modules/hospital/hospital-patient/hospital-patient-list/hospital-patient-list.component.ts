import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { EventService } from "src/app/services/event.service";
import { HistoryViewComponent } from "../components/history-view/history-view.component";
import { ApiService } from "src/app/services/api.service";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { Subject, debounceTime } from "rxjs";
import { ngxCsv } from "ngx-csv/ngx-csv";

@Component({
  standalone: false,
  selector: "nectar-hospital-patient-list",
  templateUrl: "./hospital-patient-list.component.html",
  styleUrls: ["./hospital-patient-list.component.scss"],
})
export class HospitalPatientListComponent implements OnInit {
  constructor(
    private eventService: EventService,
    private matdialog: MatDialog,
    private apiService: ApiService
  ) {}
  payload: any = {
    page: 1,
    size: 10,
  };
  GENDER = {
    1: "Male",
    2: "Female",
    3: "Other",
  };
  BLOOD_GROUP = {
    1: "A+",
    2: "A-",
    3: "B+",
    4: "B-",
    5: "O+",
    6: "O-",
    7: "AB+",
    8: "AB-",
  };
  searchSubject = new Subject();
  totalItems: number = 0;
  patientList: any = [];
  ngOnInit(): void {
    this.getPatientList();
    this.searchPatient();
  }
  openSidenav() {
    this.eventService.broadcastEvent("sidenav", true);
  }
  onSorting(columnName: string, order: string) {
    this.payload.page = 1;
    this.payload.sort = columnName;
    this.payload.sortOrder = order;
    this.getPatientList();
  }
  onPageChange(event) {
    this.payload.page = event;
    this.getPatientList();
  }
  showHistory(patientId: string) {
    this.apiService
      .get(API_ENDPOINTS.hospital.patientHistory, { patientId })
      .subscribe({
        next: (res: any) => {
          const { count, data } = res.result;
          this.matdialog.open(HistoryViewComponent, {
            autoFocus: false,
            width: "60vw",
            data: {
              patientHistory: count ? data : [],
              patientId,
              totalItems: count ?? 0,
            },
          });
        },
      });
  }
  onSearch(event: any) {
    const search = event.target.value;
    this.searchSubject.next(search);
  }
  getPatientList() {
    const payload = JSON.parse(JSON.stringify(this.payload));
    for (let key in payload) {
      if (!payload[key]) {
        delete payload[key];
      }
    }
    this.apiService.get(API_ENDPOINTS.hospital.patientList, payload).subscribe({
      next: (res: any) => {
        const { count, data } = res.result;
        if (count) {
          this.patientList = data;
          this.totalItems = count;
          return;
        }
        this.patientList = [];
        this.totalItems = 0;
      },
    });
  }
  searchPatient() {
    this.searchSubject.pipe(debounceTime(500)).subscribe((search: string) => {
      this.payload.search = search;
      this.getPatientList();
    });
  }
  onExport() {
    const payload = { ...this.payload, isExport: true };
    delete payload.page;
    delete payload.size;
    this.apiService.get(API_ENDPOINTS.hospital.patientList, payload).subscribe({
      next: (res: any) => {
        const { count, data } = res.result;
        if (count) {
          const options = {
            headers: [
              "Patient Name",
              "Age",
              "Gender",
              "Blood Group",
              "Phone",
              "Email",
            ],
          };
          const csvData = data.map((patient: any) => {
            return {
              patientName: patient.fullName,
              age: patient.age ?? "N/A",
              gender: this.GENDER[patient.gender],
              bloodGroup: patient.bloodGroup
                ? this.BLOOD_GROUP[patient.bloodGroup]
                : "N/A",
              phone: patient.phone,
              email: patient.email ?? "Not Avaliable",
            };
          });
          return new ngxCsv(csvData, "AppointmentList", options);
        }
        return null;
      },
    });
  }
}
