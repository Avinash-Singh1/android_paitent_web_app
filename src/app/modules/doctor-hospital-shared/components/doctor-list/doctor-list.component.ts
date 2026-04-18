import { Component, Input, OnInit } from "@angular/core";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { EventService } from "src/app/services/event.service";

@Component({
  standalone: false,
  selector: "nectar-doctor-list",
  templateUrl: "./doctor-list.component.html",
  styleUrls: ["./doctor-list.component.scss"],
})
export class DoctorListComponent implements OnInit {
  constructor(
    private eventService: EventService,
    private apiService: ApiService
  ) {}
  currentDoctor: number = 0;
  @Input() viewmode: string;
  doctorList = [];
  payload = {
    page: 1,
    size: 10,
  };
  closeDrawer() {
    this.eventService.broadcastEvent("showDoctorList", false);
    this.eventService.broadcastEvent("showArrow", false);
  }
  getDoctorList() {
    this.apiService.get(API_ENDPOINTS.hospital.doctorList, {}).subscribe({
      next: (res: any) => {
        const { data } = res.result;
        this.doctorList = data;
      },
      error: (error: any) => {
        this.doctorList = [];
      },
    });
  }
  ngOnInit(): void {
    this.getDoctorList();
  }
  onSelectDoctor(all: boolean, index, doctor: any = null) {
    this.currentDoctor = index;
    this.eventService.broadcastEvent("doctorChange", {
      all,
      doctorId: doctor?.doctorId,
    });
  }
}
