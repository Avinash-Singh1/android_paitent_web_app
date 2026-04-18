import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ngxCsv } from "ngx-csv";
import { Subject, Subscription, debounceTime } from "rxjs";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { EventService } from "src/app/services/event.service";
import { DoctorProfileComponent } from "../components/doctor-profile/doctor-profile.component";
import { EditDoctorComponent } from "../components/edit-doctor/edit-doctor.component";
import { DoctorRequestListComponent } from "../components/doctor-request-list/doctor-request-list.component";
import { AddDoctorFirstComponent } from "../components/add-doctor-first/add-doctor-first.component";
import { FormatarrayPipe } from "src/app/shared/pipes/formatarray.pipe";

@Component({
  standalone: false,
  selector: "nectar-hospital-doctor-list",
  templateUrl: "./hospital-doctor-list.component.html",
  styleUrls: ["./hospital-doctor-list.component.scss"],
  providers: [FormatarrayPipe],
})
export class HospitalDoctorListComponent implements OnInit, OnDestroy {
  constructor(
    private eventService: EventService,
    private matdialog: MatDialog,
    private apiService: ApiService,
    private formatArray: FormatarrayPipe
  ) {}
  totalRequest: number = 0;
  doctorRequestList: any = [];
  payload: any = {
    page: 1,
    size: 10,
  };
  GENDER = {
    1: "Male",
    2: "Female",
    3: "Other",
  };
  searchSubject = new Subject();
  totalItems: number = 0;
  doctorList: any = [];
  request$: Subscription;
  ngOnInit(): void {
    this.getDoctorList();
    this.searchPatient();
    this.getDoctorRequestList();
    this.getEvents();
  }
  openSidenav() {
    this.eventService.broadcastEvent("sidenav", true);
  }
  onSorting(columnName: string, order: string) {
    this.payload.page = 1;
    this.payload.sortBy = columnName;
    this.payload.order = order;
    this.getDoctorList();
  }

  onPageChange(event) {
    this.payload.page = event;
    this.getDoctorList();
  }
  showHistory(userId: string) {
    this.apiService
      .get(API_ENDPOINTS.hospital.doctorProfile, {
        userId,
      })
      .subscribe({
        next: (res: any) => {
          this.matdialog.open(DoctorProfileComponent, {
            autoFocus: false,
            width: "720px",
            data: {
              doctorDetail: res.result[0],
            },
          });
        },
      });
  }
  onEdit(doctor: any) {
    const editDoctorDialog = this.matdialog.open(EditDoctorComponent, {
      width: "80vw",
      data: {
        doctorDetail: doctor,
      },
    });
    editDoctorDialog.afterClosed().subscribe((res: boolean) => {
      if (res) {
        this.getDoctorList();
      }
    });
  }
  onSearch(event: any) {
    const search = event.target.value;
    this.searchSubject.next(search);
  }
  getDoctorList() {
    const payload = JSON.parse(JSON.stringify(this.payload));
    for (let key in payload) {
      if (!payload[key]) {
        delete payload[key];
      }
    }
    this.apiService.get(API_ENDPOINTS.hospital.doctorList, payload).subscribe({
      next: (res: any) => {
        const { count, data } = res.result;
        if (count) {
          this.doctorList = data;
          this.totalItems = count;
          return;
        }
        this.doctorList = [];
        this.totalItems = 0;
      },
    });
  }
  searchPatient() {
    this.searchSubject.pipe(debounceTime(500)).subscribe((search: string) => {
      this.payload.search = search;
      this.getDoctorList();
    });
  }
  onExport() {
    const payload = { ...this.payload, isExport: true };
    delete payload.page;
    delete payload.size;
    this.apiService.get(API_ENDPOINTS.hospital.doctorList, payload).subscribe({
      next: (res: any) => {
        const { count, data } = res.result;
        if (count) {
          const options = {
            headers: [
              "Doctor Name",
              "Mobile",
              "Email",
              "Speciality",
              "Procedure",
            ],
          };
          const csvData = data.map((doctor: any) => {
            return {
              doctorName: doctor.doctorDetails.doctorName,
              phone: doctor.doctorDetails.phone,
              email: doctor.doctorDetails.email ?? "Not Avaliable",
              speciality:
                this.formatArray.transform(doctor.specility, "name") ?? "N/A",
              procedure:
                this.formatArray.transform(doctor.procedure, "name") ?? "N/A",
            };
          });
          return new ngxCsv(csvData, "AppointmentList", options);
        }
        return null;
      },
    });
  }
  getDoctorRequestList() {
    this.apiService
      .get(API_ENDPOINTS.hospital.doctorRequestList, { page: 1, size: 10 })
      .subscribe({
        next: (res: any) => {
          const { count, data } = res.result;
          if (count) {
            this.totalRequest = count;
            this.doctorRequestList = data;
          } else {
            this.doctorRequestList = [];
            this.totalRequest = 0;
          }
        },
      });
  }
  onRequestList() {
    this.matdialog.open(DoctorRequestListComponent, {
      data: {
        doctorList: this.doctorRequestList,
        totalItems: this.totalRequest,
      },
      autoFocus: false,
    });
  }
  getEvents() {
    this.request$ = this.eventService
      .getEvent("statusChanged")
      .subscribe((res: boolean) => {
        if (res) {
          this.getDoctorRequestList();
          this.getDoctorList();
        }
      });
  }
  onAdd() {
    this.matdialog.open(AddDoctorFirstComponent, {
      panelClass: "add-doctor-first",
      height: "90vh",
      autoFocus: false,
    });
  }
  onDelete(doctorId: string) {
    this.apiService
      .delteParams(API_ENDPOINTS.hospital.deleteDoctor, {
        doctorId,
      })
      .subscribe({
        next: (res: any) => {
          this.totalItems -= 1;
          if (this.totalItems) {
            if (
              this.totalItems ==
              (this.payload.page - 1) * this.payload.size
            ) {
              this.payload.page = this.payload.page - 1;
            }
            this.getDoctorList();
          } else {
            this.doctorList = [];
          }
        },
      });
  }
  ngOnDestroy(): void {
    this.request$?.unsubscribe();
  }
  onImportFile(event: any) {
    if (event.target.files?.length) {
      const file = event.target.files[0];

      this.apiService.importFile(file).subscribe({
        next: (res: any) => {},
      });
    }
  }
}
