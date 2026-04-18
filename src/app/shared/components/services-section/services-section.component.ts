import { ChangeDetectorRef, Component, inject, Input, OnInit, OnChanges, PLATFORM_ID, SimpleChanges, OnDestroy } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { Router } from "@angular/router";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { CommonService } from "src/app/services/common.service";
import { EventService } from "src/app/services/event.service";
import { Subscription } from "rxjs";
import { LocalStorageService } from "src/app/services/storage.service";

@Component({
  standalone: false,
  selector: "nectar-services-section",
  templateUrl: "./services-section.component.html",
  styleUrls: ["./services-section.component.scss"],
})
export class ServicesSectionComponent implements OnInit, OnChanges, OnDestroy {
  @Input() tab = 1;
  @Input() id: string | null = null;
  @Input() type: string = "doctor";
  @Input() city: string = "";
  @Input() doc_procedure: any[] = [];
  @Input() services: any[] = [];

  viewMore: boolean = false;
  showAll: boolean = false;
  deviceWidth: number; // Set in constructor via commonService.gettingWinowWidth()
  itemPerView: number = 10;
  data: any[] = [];
  serviceArray: any[] = [];
  combinedList: any[] = [];
  validServiceNames: Set<string> = new Set();
  private servicesValidated = false;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private onChangeTimeout: any;
  private eventSubscription: Subscription = new Subscription();

  constructor(
    private apiService: ApiService,
    private eventService: EventService,
    private commonService: CommonService,
    private router: Router,
    private localStorage: LocalStorageService,
    private cdr: ChangeDetectorRef
  ) {
    // browser-safe: returns UA-based width (375/768/1440) during initial render,
    // window.innerWidth in browser — so initial render and hydration agree.
    this.deviceWidth = this.commonService.gettingWinowWidth();
  }

  ngOnInit(): void {
    this.eventSubscription.add(
      this.eventService.getEvent("doctor-route").subscribe((res: any) => {
        if (res) {
          this.id = res;
          if (!this.services?.length) {
            this.getServices();
          }
        }
      })
    );

    this.eventSubscription.add(
      this.eventService.getEvent("hospital-route").subscribe((res: any) => {
        if (res) {
          this.id = res;
          if (!this.services?.length) {
            this.getServices();
          }
        }
      })
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    clearTimeout(this.onChangeTimeout);

    if (changes["services"] || changes["city"]) {
      this.servicesValidated = false;
      this.validServiceNames.clear();
    }

    // Use setTimeout only in browser to avoid Zone macrotask during SSR
    if (this.isBrowser) {
      this.onChangeTimeout = setTimeout(() => {
        if (this.services?.length && this.id) {
          this.data = this.services;
          this.serviceArray =
            this.deviceWidth < 767
              ? this.data.slice(0, this.itemPerView)
              : this.data;
          this.Combinearray();
          this.cdr.detectChanges();
        }
      }, 0);
    } else if (this.services?.length && this.id) {
      this.data = this.services;
      this.serviceArray = this.data;
      this.Combinearray();
    }

    if (changes["doc_procedure"]) {
      this.Combinearray();
    }
  }

  getServices() {
    if (!this.id) return;

    const endpoint =
      this.type === "doctor"
        ? `${API_ENDPOINTS.patient.doctorService}/${this.id}`
        : API_ENDPOINTS.patient.hospitalServices;

    const params = this.type === "doctor" ? {} : { establishmentId: this.id, type: 2 };

    this.apiService.get(endpoint, params).subscribe((res: any) => {
      this.data =
        this.type === "doctor" ? res?.result || [] : res?.result?.data || [];

      this.serviceArray =
        this.deviceWidth < 767
          ? this.data.slice(0, this.itemPerView)
          : this.data;

      this.Combinearray();
      this.cdr.detectChanges();
    });
  }

  Combinearray() {
    const combined = [...this.serviceArray, ...this.doc_procedure];
    this.combinedList = Array.from(
      new Map(combined.map((item) => [item._id || item.name, item])).values()
    );
    this.validateServices();
  }

  private validateServices() {
    if (this.servicesValidated || !this.city || !this.combinedList.length) return;
    this.servicesValidated = true;

    const serviceNames = this.combinedList.map((s: any) => s.name).filter(Boolean);
    if (!serviceNames.length) return;

    this.apiService
      .post(API_ENDPOINTS.patient.seoLinks, {
        city: this.city,
        services: serviceNames,
      })
      .subscribe({
        next: (res: any) => {
          const valid: string[] = res?.data?.validServices || [];
          this.validServiceNames = new Set(valid.map((n: string) => n.toLowerCase()));
          this.cdr.detectChanges();
        },
        error: () => {
          // On error, allow all links (graceful degradation)
          this.validServiceNames = new Set(
            this.combinedList.map((s: any) => s.name?.toLowerCase()).filter(Boolean)
          );
          this.cdr.detectChanges();
        },
      });
  }

  isServiceValid(name: string): boolean {
    if (!this.servicesValidated || !this.validServiceNames.size) return true;
    return this.validServiceNames.has(name?.toLowerCase());
  }

  viewMoreServices() {
    this.showAll = !this.showAll;
  }

  scrollToTop(): void {
    if (this.isBrowser) {
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 0);
    }
  }

  navigateToSearch(routeName: string) {
    const formattedRouteName = this.formatName(routeName);
    const cityname = this.commonService.replaceSpaceWithHyphen(this.city);
    this.router.navigate([`${cityname}/doctors-for-${formattedRouteName}`]);
  }

  formatName(name?: string): string {
  if (!name) return "";
  return name
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .toLowerCase()
    .replace(/-$/, "");
}

  ngOnDestroy(): void {
    //  Clear any pending timeouts created in ngOnChanges
    if (this.onChangeTimeout) {
      clearTimeout(this.onChangeTimeout);
      this.onChangeTimeout = null;
    }

    //  Unsubscribe from all active subscriptions to prevent memory leaks
    if (this.eventSubscription) {
      this.eventSubscription.unsubscribe();
    }
  }

}
