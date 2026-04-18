import { Component, EventEmitter, HostListener, OnInit, Output, QueryList, ViewChildren } from "@angular/core";
import { MatMenuTrigger } from "@angular/material/menu";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { BehvaiourEventService } from "src/app/services/behvaiour-event.service";
import { EventService } from "src/app/services/event.service";

@Component({
  standalone: false,
  selector: "nectar-filters",
  templateUrl: "./filters.component.html",
  styleUrls: ["./filters.component.scss"],
})
export class FiltersComponent implements OnInit {
  @Output() filterEvents = new EventEmitter();
  @ViewChildren(MatMenuTrigger) moreTrigger: QueryList<MatMenuTrigger>;
  constructor(
    private apiService: ApiService,
    private eventService: EventService,
    private behaviourSub: BehvaiourEventService) { }
  ngOnInit(): void {
    this.getSpecialityListing();
    this.subscribingObservables();
  }
  selectedMasterData: any = {};

  subscribingObservables() {
    this.behaviourSub.subscribeFilterData("filter").subscribe((res: any) => {
      if (res?.speciality) {
        this.masterSpecialityArray = JSON.parse(
          JSON.stringify(res?.speciality)

        );
        this.selectedSpecialityArray = JSON.parse(
          JSON.stringify(res?.speciality)
        );
      }
      if (res?.availability) this.availabilityFilter(res?.availability);
      if (res?.consult) {
        this.masterConsultArray = JSON.parse(JSON.stringify(res?.consult));
        this.selectedConsultArray = JSON.parse(JSON.stringify(res?.consult));
      }
      if (res?.time) {
        this.masterTimeArray = JSON.parse(JSON.stringify(res.time));
        this.selectedTimeArray = JSON.parse(JSON.stringify(res.time));
      }
      if (res?.sort) {
        this.masterSortArray = JSON.parse(JSON.stringify(res.sort));
        this.sortArray.forEach((element: any) => {
          if (element.id == res?.sort) element.checked = true;
        });
      }
    });
  }
  specialityArray: any;
  availabilityArray = [
    { id: 1, name: "Available Today", checked: false },
    { id: 2, name: "Available Tomorrow", checked: false },
    { id: 3, name: "Available in next 7 days", checked: false },
  ];
  CounsltationType = [
    { id: 1, name: "In-Clinic Consultation", checked: false },
    { id: 2, name: "Video Consultation", checked: false },
  ];
  timeArray = ["Morning", "Afternoon", "Evening"];
  sortArray = [
    { id: 1, name: "Relevance", checked: false },
    { id: 2, name: "Earliest Available", checked: false },
    { id: 3, name: "Price - Low to High", checked: false },
    { id: 4, name: "Price - High to Low", checked: false },
    { id: 5, name: "Years of Experience", checked: false },
    { id: 6, name: "Recommendation", checked: false },
  ];
  consultArray = ["Free", "1 - 200", "201 - 500", "501+"];
  stopClosing(event: any) {
    event.stopPropagation();
  }
  selectedSpecialityArray = [];
  masterSpecialityArray: any = [];

  selectSpeciality(e: any) {
    let index = this.selectedSpecialityArray.indexOf(e?.target?.value);
    if (index == -1) {
      this.selectedSpecialityArray.push(e?.target.value);
    } else {
      this.selectedSpecialityArray.splice(index, 1);
    }
  }

  applySpecialityFilter() {
    this.masterSpecialityArray = JSON.parse(
      JSON.stringify(this.selectedSpecialityArray)
    );
    this.selectedMasterData.speciality = this.masterSpecialityArray;
    this.behaviourSub.broadcastEvent("filter", this.selectedMasterData);
    this.applyingFilters();
  }

  checkingSpecilaity(e: any) {
    return this.masterSpecialityArray.includes(e);
  }

  selectedAvailability: any;
  availabilityFilter(e: any) {
    this.selectedAvailability = e;
    this.availabilityArray.forEach((element: any) => {
      if (element.id == e) {
        element.checked = true;
      } else {
        element.checked = false;
      }
    });
  }

  clearAvailability() {
    this.availabilityArray.forEach((element: any) => {
      element.checked = false;
    });
    this.selectedAvailability = "";
  }

  selectedConsultArray = [];
  masterConsultArray: any = [];

  selectConsultancy(e: any) {
    let index = this.selectedConsultArray.indexOf(e);
    if (index == -1) {
      this.selectedConsultArray.push(e);
    } else {
      this.selectedConsultArray.splice(index, 1);
    }
  }
  applyConsultFilter() {
    this.masterConsultArray = JSON.parse(
      JSON.stringify(this.selectedConsultArray)
    );
    this.selectedMasterData.consult = this.masterConsultArray;
    this.behaviourSub.broadcastEvent("filter", this.selectedMasterData);

    this.applyingFilters();
  }

  checkingConsultFee(item: any) {
    return this.masterConsultArray.includes(item);
  }

  masterSortArray: any;
  selectSorting(e: any) {
    this.sortArray.forEach((element: any) => {
      if (element.id == e) {
        element.checked = !element.checked;
      } else {
        element.checked = false;
      }
    });
    const allCheckedFalse = this.sortArray.every(
      (item) => item.checked === false
    );
    if (allCheckedFalse) {
      this.masterSortArray = "";
    }
  }
  selectedTimeArray = [];
  masterTimeArray: any = [];
  selectTime(e: any) {
    let index = this.selectedTimeArray.indexOf(e);
    if (index == -1) {
      this.selectedTimeArray.push(e);
    } else {
      this.selectedTimeArray.splice(index, 1);
    }
  }

  applyMoreFilter() {
    this.masterTimeArray = JSON.parse(JSON.stringify(this.selectedTimeArray));
    this.sortArray.forEach((el: any) => {
      if (el.checked) {
        this.masterSortArray = el.id;
      }
    });
    this.selectedMasterData.time = this.masterTimeArray;
    this.selectedMasterData.sort = this.masterSortArray;
    this.behaviourSub.broadcastEvent("filter", this.selectedMasterData);

    this.applyingFilters();
  }
  checkingTime(item: any) {
    return this.masterTimeArray.includes(item);
  }

  openMatMenu(name: string) {
    switch (name) {
      case "speciality":
        {
          this.specialityArray = JSON.parse(
            JSON.stringify(this.specialityArray)
          );
          this.selectedSpecialityArray = [...this.masterSpecialityArray];
        }
        break;
      case "availability":
        {
        }
        break;
      case "consultFee":
        {
          this.consultArray = JSON.parse(JSON.stringify(this.consultArray));
          this.selectedConsultArray = [...this.masterConsultArray];
        }
        break;
      case "moreFilter": {
        this.sortArray = JSON.parse(JSON.stringify(this.sortArray));
        this.timeArray = JSON.parse(JSON.stringify(this.timeArray));
      }
    }
  }

  closeMatMenu(name: string) {
    switch (name) {
      case "speciality":
        {
          if (!this.masterSpecialityArray.length) {
            this.masterSpecialityArray = [];
            this.selectedSpecialityArray = [];
          }
          this.specialityArray = JSON.parse(
            JSON.stringify(this.specialityArray)
          );
        }
        break;
      case "availability":
        {
          this.applyingFilters();
          this.selectedMasterData.availability = this.selectedAvailability;
          this.behaviourSub.broadcastEvent("filter", this.selectedMasterData);
        }
        break;
      case "consultFee":
        {
          if (!this.masterConsultArray.length) {
            this.masterConsultArray = [];
            this.selectedConsultArray = [];
          }
          this.consultArray = JSON.parse(JSON.stringify(this.consultArray));
        }
        break;
      case "moreFilter": {
        if (!this.masterSortArray) {
          this.sortArray.forEach((element: any) => {
            element.checked = false;
          });
        }
      }
    }
  }

  applyingFilters() {
    let obj: any = {};
    if (this.selectedSpecialityArray.length) {
      this.masterSpecialityArray = this.masterSpecialityArray.map((e) => {
        if (e) {
          return e;
        }
      });
      obj.specialty = this.masterSpecialityArray;
    }
    if (this.selectedAvailability) {
      obj.availability = this.selectedAvailability;
    }
    if (this.masterConsultArray.length) {
      this.masterConsultArray = this.masterConsultArray.map((e) => {
        if (e) {
          return e;
        }
      });
      obj.consultationFee = this.masterConsultArray;
    }
    if (this.masterTimeArray.length) {
      this.masterTimeArray = this.masterTimeArray.map((e) => {
        if (e) {
          return e;
        }
      });
      obj.timeOfDay = this.masterTimeArray;
    }
    if (this.masterSortArray) {
      obj.sortBy = this.masterSortArray;
    }
    this.eventService.broadcastEvent("filter-doctor-list", obj);
  }

  getSpecialityListing() {
    this.apiService
      .get(API_ENDPOINTS.doctor.criticalIssues, {})
      .subscribe((res: any) => {
        this.specialityArray = res?.result;
      });
  }

  @HostListener("window:scroll")
  onScroll() {
    this.moreTrigger.forEach((menuTrigger) => {
      if (menuTrigger?.menuOpen) {
        menuTrigger.closeMenu();
      }
    });
  }

}
