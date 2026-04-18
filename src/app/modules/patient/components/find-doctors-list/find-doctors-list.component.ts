import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";

@Component({
  standalone: false,
  selector: "nectar-find-doctors-list",
  templateUrl: "./find-doctors-list.component.html",
  styleUrls: ["./find-doctors-list.component.scss"],
})
export class FindDoctorsListComponent implements OnInit {
  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.getListing();
  }
  list1: any = [];
  list2: any = [];
  list3: any = [];
  list4: any = [];
  getListing() {
    this.apiService
      .get(API_ENDPOINTS.doctor.doctorByCity, {})
      .subscribe((res: any) => {
        let data = res?.result;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i]) {
            this.list1.push(data[i]);
          }
          if (data[i + 1]) {
            this.list2.push(data[i + 1]);
          }
          if (data[i + 2]) {
            this.list3.push(data[i + 2]);
          }
          if (data[i + 3]) {
            this.list4.push(data[i + 3]);
          }
        }
      });
  }

  redirection(speciality, location) {
    let obj: any = {};
    obj.location = location;
    if (speciality !== "Doctors") {
      obj.filter = speciality;
    }

    this.router.navigate(["/doctor-list"], {
      queryParams: obj,
    });
  }
}
