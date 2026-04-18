import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { OwlOptions } from "ngx-owl-carousel-o";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { EventService } from "src/app/services/event.service";
import { LocalStorageService } from "src/app/services/storage.service";

@Component({
  standalone: false,
  selector: "nectar-reschedule-appointment",
  templateUrl: "./reschedule-appointment.component.html",
  styleUrls: ["./reschedule-appointment.component.scss"],
})
export class RescheduleAppointmentComponent implements OnInit {
  customOptions: OwlOptions = {
    loop: false,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    // stagePadding:40,
    margin: 0,
    center: true,
    navText: [
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.5 17l-5-5 5-5" stroke="#45197c" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.5 7l5 5-5 5" stroke="#45197c" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    ],
    responsive: {
      0: {
        items: 1,
      },
      400: {
        items: 1,
      },
      740: {
        items: 1,
      },
      940: {
        items: 1,
      },
    },
    nav: true,
  };

  constructor(
    private apiService: ApiService,
    private activateRoute: ActivatedRoute,
    private datePipe: DatePipe,
    private locaStorage: LocalStorageService,
    private router: Router,
    private eventService: EventService
  ) {}
  appointmentId: any;
  ngOnInit(): void {
    this.getSavedData();
    this.activateRoute.queryParams.subscribe((res: any) => {
      this.appointmentId = res?.id;
      if (res?.id) {
        this.getAvailableSlots(res?.id);
      }
    });
  }
  selectedTime: any;
  selectedDate: any;
  timings: any = [];
  slots: any = [];

  doctorDetail: any;
  timing: any;
  getSavedData() {
    this.doctorDetail =
      JSON.parse(this.locaStorage.getItem("doctor-detail")) || {};
    this.timing = JSON.parse(this.locaStorage.getItem("appoint-time")) || {};
    this.timing.date = new Date(this.timing?.date);
    this.timing.date = this.datePipe.transform(
      this.timing.date,
      "MMM dd, yyyy"
    );
  }
  formatDate(date: any): string {
    let formattedDate: string;
    if (date == "today") {
      formattedDate = this.datePipe.transform(new Date(), "MMM d");
    } else {
      formattedDate = this.datePipe.transform(new Date(date), "MMM d");
    }

    return formattedDate;
  }
  selectedSlot: any = [];
  masterTimeSlots: any;
  getAvailableSlots(id: any) {
    this.apiService
      .get(`${API_ENDPOINTS.patient.getSlotsReschedule}/${id}`, {})
      .subscribe((res: any) => {
        this.masterTimeSlots = res?.result?.timeSlots;
        this.timings = this.masterTimeSlots.map((el: any) => {
          let dateArray = el.date.split(" / ");
          dateArray[0] = this.formatDate(dateArray[0]);
          dateArray[1] = this.formatDate(dateArray[1]);
          el.date = dateArray.join(" - ");
          return el.date;
        });
        this.selectedSlot = this.masterTimeSlots[0].slots;
      });
  }

  carouselChange(e: any) {
    this.selectedSlot = this.masterTimeSlots[e?.startPosition].slots;
  }

  getTime(time: any, date: any) {
    this.selectedDate = date;
    this.selectedTime = time;
  }

  confirmAppointment() {
    if (this.appointmentId && this.selectedDate && this.selectedTime) {
      const payload: any = {
        date: this.selectedDate,
        time: this.selectedTime,
      };
      let obj = {
        date: this.datePipe.transform(this.selectedDate, "MMMM d, yyyy"),
        time: { time: this.selectedTime },
        establishmentId: this.timing?.establishmentId,
        consultFee: this.timing?.consultFee,
      };
      this.locaStorage.setItem("appoint-time", JSON.stringify(obj));
      this.apiService
        .post(
          `${API_ENDPOINTS.patient.rescheduleAppointment}/${this.appointmentId}`,
          payload
        )
        .subscribe((res: any) => {
          this.router.navigate(["/confirm-booking"], {
            queryParams: { id: res?.result?._id },
            replaceUrl: true,
          });
        });
    }
  }

  viewDoctor() {
    this.eventService.broadcastEvent("view-doctor", true);
    const city = this.doctorDetail?.city.split(" ").join("-").toLowerCase();
    this.router.navigate([
      `${city}/doctor/${this.doctorDetail?.doctorProfileSlug}`,
    ]);
  }
}
