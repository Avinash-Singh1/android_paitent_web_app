import { DatePipe } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { LocalStorageService } from "src/app/services/storage.service";
import { ClinicappointmentComponent } from "../clinicappointment/clinicappointment.component";
import { EventService } from "src/app/services/event.service";
import { ActivatedRoute, Router } from "@angular/router";
import { ScrollStrategy, ScrollStrategyOptions } from "@angular/cdk/overlay";
import { CommonService } from "src/app/services/common.service";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { HttpClient } from "@angular/common/http";

interface DoctorRecord {
  service: Array<{ name: string }>;
  doctorId: string;
  specialization: string[];
  specializationName?: string;
  doctorName?: string;
  doctorProfilePicture?: string;
  address?: { locality?: string; city?: string };
  rating?: number;
  totalReview?: number;
  consultationFees?: number;
  videoConsultationFees?: number;
  timeTaken?: string;
  recommended?: number;
  slug?: string;
  [key: string]: unknown;
}

@Component({
  standalone: false,
  selector: 'nectar-doctorsurgreycard',
  templateUrl: './doctorsurgreycard.component.html',
  styleUrls: ['./doctorsurgreycard.component.scss'] })
export class DoctorsurgreycardComponent implements OnInit {
  @Output() emitDoctorCount = new EventEmitter<{ count: number; getdoctor: number }>();

  @Input() type = 0;
  @Input() data: { doctorProfilePicture?: string; [key: string]: unknown };
  @Input() city: string = '';
  @Input() surgeriesname: string = '';

  filterCity: string = ''; // Holds the city filter value
  getDoctors: DoctorRecord[] = [];
  allDoctors: any[] = []; // Original list of all doctors
  serviceName: string;
  doctorsCountChange: any;

  constructor(
    private localStorage: LocalStorageService,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private eventService: EventService,
    private router: Router,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private http: HttpClient) { }
  scrollStrategy: ScrollStrategy;
  specailization: any;
  deviceWidth: any;
  ngOnInit(): void {
    this.city = this.city.toLowerCase()
    this.getDocSurgery();
    this.deviceWidth = this.commonService.gettingWinowWidth();
    if (!this.data?.doctorProfilePicture) {
      this.data.doctorProfilePicture = "assets/images/svg/Nectar Favicon.svg";
    }
  }
  newDoctorsData: DoctorRecord[] = []
  getDocSurgery() {
    let slug: string;
    this.route.params.subscribe((data) => {
      slug = data['slug'];
    });
    slug = slug.replace('-', "").toLowerCase();
    const payload = {
      page: 1,
      size: 10 };
    const url = `${API_ENDPOINTS.doctor.doctorsBySurgery}?page=${payload.page}&size=${payload.size}`;
    this.http.get<any>(url).subscribe((data) => {
      let doctors = data.result;
      this.allDoctors = []; // Store the original list
      const addedDoctorIds = new Set<string>(); // Track added doctor IDs

      doctors.forEach((element: DoctorRecord) => {
        element.service.forEach((services: { name: string }) => {
          this.serviceName = services.name.split(' ').join('').toLowerCase();
          if (this.serviceName === slug) {
            const doctorId = element.doctorId; // Unique identifier for each doctor
            if (!addedDoctorIds.has(doctorId)) {
              this.specailization = element.specialization[0] || 'N/A'; // Get the first specialization if it exists
              element.specializationName = this.specailization;
              this.allDoctors.push(element);
              addedDoctorIds.add(doctorId); // Mark doctor as added
            }
          }
        });
      });

      this.getDoctors = [...this.allDoctors];

      this.newDoctorsData = this.getDoctors.filter((res: any, index, self) => {
        let newCity = res?.address?.city.split(' ').join('').toLowerCase();
        if (newCity === 'newdelhi') {
          newCity = 'delhi';
        }
        if (newCity === this.city) {
          // Remove duplicates by unique doctorId
          return index === self.findIndex((d) => d.doctorId === res.doctorId);
        }
        return false; // Explicitly return false if the condition is not met
      });

      const count = this.newDoctorsData.length;
      const getdoctor = this.getDoctors.length
      this.emitDoctorCount.emit({ count, getdoctor });
    });
  }

  bookAppointment(doctor: any) {
    let date = this.datePipe.transform(new Date(), "EEE, d MMM");
    let arr: any = [];

    doctor?.specialization.forEach((element: any) => {
      arr.push({ name: element });
    });
    let obj: any = {
      fullname: doctor?.doctorName,
      specialization: arr,
      address: `${doctor?.address?.locality || ""}, ${doctor?.address?.city || ""
        }  `,
      doctorId: doctor?._id,
      city: doctor?.address?.city,
      doctorProfileSlug: doctor?.doctorProfileSlug,
      doctorPic:
        doctor?.doctorProfilePicture ||
        "assets/images/svg/Nectar Favicon.svg" };
    this.localStorage.setItem("doctor-detail", JSON.stringify(obj));

    this.dialog.open(ClinicappointmentComponent, {
      // maxHeight: "600px",
      width: "490px",
      panelClass: "yespost",
      data: {
        date: date,
        id: doctor._id,
        establishmentId: doctor?.establishmentId },
      autoFocus: false });
  }

  viewDoctor(doctor: any) {
    this.eventService.broadcastEvent("view-doctor", true);
    const city = this.commonService.replaceSpaceWithHyphen(
      doctor?.address?.city
    );
    this.router.navigate([`${city}/doctor/${doctor?.doctorProfileSlug}`]);
  }
  formatName(value: any, maxLength: number) {
    if (value.length > maxLength) {
      return value.slice(0, maxLength) + "...";
    }
    return value;
  }

  filterDoctorsByCity() {
    if (!this.filterCity.trim()) {
      this.getDoctors = [...this.allDoctors];
      return;
    }
    this.getDoctors = this.allDoctors.filter(doctor => {
      const cityName = doctor?.address?.city?.toLowerCase() || '';
      return cityName.includes(this.filterCity.toLowerCase());

    });
    if (this.getDoctors.length === 0) {
    }
  }
  handleDoctorCount(data: { count: number; getdoctor: number }) {
  }

  trackByIndex(index: number): number { return index; }
}