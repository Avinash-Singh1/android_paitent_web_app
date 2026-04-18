import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, OnChanges, SimpleChanges, Output } from "@angular/core";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { EventService } from "src/app/services/event.service";
import { InputValidationService } from "src/app/services/input-validation.service";

@Component({
  standalone: false,
  selector: "nectar-review-section",
  templateUrl: "./review-section.component.html",
  styleUrls: ["./review-section.component.scss"],
})
export class ReviewSectionComponent implements OnInit, OnChanges {
  @Input() id: any;
  @Input() name: any;
  @Input() tab: any = 0;
  @Input() type: any = "doctor";
  @Input() services: any[] = [];
  @Output() valueChange: any = new EventEmitter<void>();
  payload: any = {
    page: 1,
    size: 10,
  };
  totalReview: any;
  constructor(
    private apiService: ApiService,
    public cValidator: InputValidationService,
    private eventService: EventService,
    private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Skip HTTP calls during initial render — reviews are non-critical for initial page render

    if (this.id) {
      if (!this.services?.length) {
        this.getServices();
      } else {
        this.applyServices(this.services);
      }
      this.getReviewList();
    }
    this.eventService.getEvent("hospital-route").subscribe((res: any) => {
      if (res) {
        this.id = res;
        if (!this.services?.length) this.getServices();
        this.getReviewList();
      }
    });
    this.eventService.getEvent("doctor-route").subscribe((res: any) => {
      if (res) {
        this.id = res;
        if (!this.services?.length) this.getServices();
        this.getReviewList();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['services'] && this.services?.length) {
      this.applyServices(this.services);
    }
  }

  private applyServices(services: any[]): void {
    this.serviceArray = services.map((s: any) => ({ ...s, name: s.name?.toLowerCase() }));
    this.filteredServiceArray = [...this.serviceArray];
  }

  allStories() {
    this.valueChange.emit({ count: this.totalReview, value: 1 });
  }
  reviewDetail: any;
  reviewList: any;
  getReviewList() {
    if (this.type == "doctor") {
      if (this.payload.establishmentId) {
        delete this.payload.establishmentId;
      }
      this.apiService
        .get(`${API_ENDPOINTS.patient.doctorReviews}/${this.id}`, this.payload)
        .subscribe((res: any) => {
          this.reviewDetail = res?.result;
          this.totalReview = this.reviewDetail?.data?.count;
          this.reviewList = this.reviewDetail?.data?.data;
          this.eventService.broadcastEvent("sharing-reviews", this.reviewList);
          this.cdr.detectChanges();
        });
    } else {
      this.payload.establishmentId = this.id;
      this.apiService
        .get(`${API_ENDPOINTS.patient.hospitalReviews}`, this.payload)
        .subscribe((res: any) => {
          this.reviewList = res?.result?.reviewList?.data;
          this.reviewDetail = res?.result;
          this.totalReview = res?.result?.reviewList?.count;
          this.reviewList.forEach((element: any) => {
            element.treatment = element?.treatment.join(", ");
            let arrayOfName: any = [];
            element.doctorDetails.specialization.forEach((el: any) => {
              arrayOfName.push(el.name);
            });
            element.doctorDetails.specialization = arrayOfName.join(" , ");
          });
          this.eventService.broadcastEvent("sharing-reviews", this.reviewList);
          this.cdr.detectChanges();
        });
    }
  }

  changingPage(e: any) {
    this.payload.page = e;
    this.getReviewList();
  }
  serviceArray: any = [];
  filteredServiceArray: any = [];
  searchValue = "";
  searchService(e: any) {
    let key = e.target.value.toLowerCase();
    if (e?.target?.value) {
      this.filteredServiceArray = this.serviceArray.filter((item: any) =>
        item?.name.includes(key)
      );
    } else {
      this.filteredServiceArray = this.serviceArray;
    }
  }

  selectService(e: any) {
    if (e?.name) {
      this.searchValue = e?.name;
      this.payload.search = this.searchValue;
    } else {
      delete this.payload.search;
    }

    this.getReviewList();
  }

  getServices() {
    if (this.type == "doctor") {
      this.apiService
        .get(`${API_ENDPOINTS.patient.doctorService}/${this.id}`, {})
        .subscribe((res: any) => {
          this.serviceArray = res?.result;
          this.serviceArray.forEach((el: any) => {
            el.name = el.name.toLowerCase();
          });
          this.filteredServiceArray = res?.result;
          this.cdr.detectChanges();
        });
    } else {
      this.apiService
        .get(`${API_ENDPOINTS.patient.hospitalServices}`, {
          establishmentId: this.id,
        })
        .subscribe((res: any) => {
          this.serviceArray = res?.result?.data;
          this.serviceArray.forEach((el: any) => {
            el.name = el.name.toLowerCase();
          });
          this.filteredServiceArray = res?.result?.data;
          this.cdr.detectChanges();
        });
    }
  }

  sort: any = "Most Recent";
  getSort(e: any) {
    this.sort = e?.name;
    this.payload.sort = e?.key;
    this.getReviewList();
  }

  getInitial(name: any): string {
    if (!name) return 'A';
    const str = Array.isArray(name) ? name[0] : name;
    return (str || 'A').charAt(0).toUpperCase();
  }
}
