import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, ViewChild, DOCUMENT } from "@angular/core";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { FormatTimeService } from "src/app/services/format-time.service";
import { ClinicappointmentComponent } from "../clinicappointment/clinicappointment.component";
import { MatDialog } from "@angular/material/dialog";
import { DatePipe } from "@angular/common";
import { LocalStorageService } from "src/app/services/storage.service";
import { EventService } from "src/app/services/event.service";
import { Router } from "@angular/router";
import { debounceTime, distinctUntilChanged, fromEvent, map } from "rxjs";
import { BottomSheetClinicVisitComponent } from "../bottom-sheet-clinic-visit/bottom-sheet-clinic-visit.component";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { NoopScrollStrategy } from "@angular/cdk/overlay";
import { CommonService } from "src/app/services/common.service";

@Component({
  standalone: false,
  selector: "nectar-procedure-section",
  templateUrl: "./procedure-section.component.html",
  styleUrls: ["./procedure-section.component.scss"],
})
export class ProcedureSectionComponent implements OnInit, AfterViewInit {
  letters: any;
  // selectedItem: string = "A";
  @Input() id: any;
  @Input() name: any;
  @Input() address: any;
  totalCount: number;
  @Input() tab: any = 1;
  @Output() valueChange: any = new EventEmitter<void>();
  deviceWidth: any;
  @ViewChild("search", { static: false }) search!: ElementRef;
  payload: any = {
    page: 1,
    size: 10,
  };
  constructor(
    private apiService: ApiService,
    private formatTime: FormatTimeService,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private localStorage: LocalStorageService,
    private eventService: EventService,
    private router: Router,
    private _bottomSheet: MatBottomSheet,
    private commonService: CommonService,
    @Inject(DOCUMENT) private _document: Document) {}

  ngOnInit(): void {
    this.deviceWidth = this.commonService.gettingWinowWidth();
    if (this.tab == 0) {
      this.payload.size = 5;
    }
    this.getAlphabetListing();
  }
  ngAfterViewInit(): void {
    if (true && this.deviceWidth < 767) {
      this.searchFunction();
    }
  }

  searchFunction() {
    if (this.search) {
      fromEvent(this.search?.nativeElement, "keyup")
        .pipe(
          map((event: any) => {
            return event?.target?.value;
          }),
          debounceTime(200),
          distinctUntilChanged()
        )
        .subscribe((text: string) => {
          if (text.length) {
            this.payload.search = text;
            this.payload.page = 1;
            this.getListing();
          } else {
            delete this.payload.search;
            this.getListing();
          }
        });
    }
  }

  selectedLetter(letter: any) {
    if (letter?.status == 0) {
      return;
    }
    this.payload.page = 1;
    this.payload.filter = letter?.name;
    this.getListing();
  }
  specialityList: any;
  doctorList: any;
  getListing() {
    this.apiService
      .get(
        `${API_ENDPOINTS.patient.hospitalProcedure}/${this.id}`,
        this.payload
      )
      .subscribe((res: any) => {
        this.specialityList =
          this.deviceWidth > 767
            ? res?.result?.procedures
            : res?.result?.mobileProcedures;
        this.totalCount = res?.result?.data[0]?.count;
        this.doctorList = res?.result?.data[0]?.data;
        this.doctorList?.forEach((element: any) => {
          //timing Part
          let days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
          Object.keys(element.establishmentTiming).forEach((key) => {
            if (!days.includes(key)) delete element.establishmentTiming[key];
          });
          element.establishmentTiming = this.formatTime.dateTimeConversion(
            element.establishmentTiming
          );
        });
      });
  }
  getAlphabetListing() {
    this.apiService
      .get(`${API_ENDPOINTS.patient.specialityFirstLetter}/${this.id}`, {})
      .subscribe((res: any) => {
        this.letters = res?.result;
        let data = this.letters?.find((el: { status: number; name: string }) => {
          return el.status == 1;
        });
        if (this.deviceWidth > 767) {
          this.payload.filter = data?.name;
        }
        this.getListing();
      });
  }

  changingPage(e: any) {
    this.payload.page = e;
    this.getListing();
    const element = this._document.getElementById("list-section");
    element?.scrollIntoView();
  }

  bookAppointment(data: any) {
    if (!data?.isActive) {
      return;
    }
    let date = this.datePipe.transform(new Date(), "EEE, d MMM");
    let obj: any = {
      fullname: data?.fullName,
      specialization: data?.specialization,
      address: `${data?.establishmentMaster?.address?.locality || ""}, ${
        data?.establishmentMaster?.address?.city || ""
      }  `,
      city: data?.establishmentMaster?.address?.city,
      doctorProfileSlug: data?.doctorProfileSlug,
      doctorId: data.doctorId,
      doctorPic: data?.profilePic || "assets/images/svg/Nectar Favicon.svg",
      establishmentId: data?.establishmentId,
      consultationFees: data?.consultationFees,
      videoConsultationFees: data?.videoConsultationFees,
      profilePic:data?.profilePic || "assets/images/svg/Nectar Favicon.svg"
    };
    this.localStorage.setItem("doctor-detail", JSON.stringify(obj));

    if (this.deviceWidth > 767) {
      this.dialog.open(ClinicappointmentComponent, {
        width: "490px",
        panelClass: "yespost",
        data: {
          date: date,
          id: data.doctorId,
          establishmentId: data?.establishmentId,
        },
        autoFocus: false,
        scrollStrategy: new NoopScrollStrategy(),
      });
    } else if (this.deviceWidth < 767) {
      this._bottomSheet.open(BottomSheetClinicVisitComponent, {
        data: {
          newsId: data.doctorId,
          establishmentIds: data?.establishmentId,
        },
      });
      data._id = data?.establishmentId;
      this.eventService.broadcastEvent("hospital-data", data);
    }
  }

  viewDoctor(data: any) {
    this.eventService.broadcastEvent("view-doctor", true);
    const city = data?.establishmentMaster?.address?.city
      .split(" ")
      .join("-")
      .toLowerCase();
    this.router.navigate([`${city}/doctor/${data?.doctorProfileSlug}`]);
  }
  selectedProcedure: any;
  selectProcedure(item: any) {
    if (this.deviceWidth < 767) {
      this.selectedProcedure = item?._id;
      this.payload.filter = item?.name;
      this.getListing();
    }
  }
}
