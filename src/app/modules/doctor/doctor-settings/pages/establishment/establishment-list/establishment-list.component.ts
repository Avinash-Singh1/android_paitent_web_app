import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { EstablishmentRequestComponent } from "../establishment-request/establishment-request.component";
import { ApiService } from "src/app/services/api.service";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { AddEstablishmentComponent } from "../add-establishment/add-establishment.component";
import { EventService } from "src/app/services/event.service";
import { Subscription } from "rxjs";
import { ConfirmEstablishmentComponent } from "../confirm-establishment/confirm-establishment.component";
import { GoogleMapsService } from "src/app/services/google-maps.service";

@Component({
  standalone: false,
  selector: "nectar-establishment-list",
  templateUrl: "./establishment-list.component.html",
  styleUrls: ["./establishment-list.component.scss"],
})
export class EstablishmentListComponent implements OnInit, OnDestroy {
  constructor(
    private matdialog: MatDialog,
    private apiService: ApiService,
    private eventService: EventService,
    public googleMaps: GoogleMapsService
  ) {}
  opened: boolean = false;
  requestList = [];
  totalRequest: number = 0;
  eventSubscription$: Subscription;
  dialogSubscription$: Subscription;
  payload = {
    page: 1,
    size: 10,
  };
  apiCalled: boolean = false;
  ngOnInit(): void {
    this.getRequestList();
    this.getEvents();
    this.getEsablishmentList();
  }
  ownEstablishment: any = [];
  visitEstablishment: any = [];
  onAddEstablishment(
    establishment: any,
    isOwner: number,
    edit: boolean = false
  ) {
    if (edit) {
      this.matdialog.open(AddEstablishmentComponent, {
        panelClass: "confirm-establishment-modal",
        data: {
          edit,
          establishmentDetail: { ...establishment, isOwner },
        },
        autoFocus: false,
      });
      return;
    }
    const addDialog = this.matdialog.open(ConfirmEstablishmentComponent, {
      panelClass: "confirm-establishment-modal",
      width: "600px",
      data: {
        edit,
        ownerList: this.ownEstablishment.length,
      },
    });
    addDialog.afterClosed().subscribe((res: boolean) => {
      if (res) {
        this.getEsablishmentList();
      }
    });
  }
  getEsablishmentList() {
    this.ownEstablishment = [];
    this.visitEstablishment = [];
    this.apiService.get(API_ENDPOINTS.doctor.establishmentList, {}).subscribe({
      next: (res: any) => {
        this.apiCalled = true;
        const { count, data } = res.result;
        if (count) {
          data.forEach((element) => {
            switch (element.isOwner) {
              case true:
                this.ownEstablishment.push(element);
                break;
              case false:
                this.visitEstablishment.push(element);
                break;
            }
          });
        } else {
          this.ownEstablishment = [];
          this.visitEstablishment = [];
        }
      },
      error: (error: any) => {
        this.apiCalled = true;
      },
    });
  }
  onOpenRequestDialog() {
    const requestDialog = this.matdialog.open(EstablishmentRequestComponent, {
      width: "90vw",
      data: {
        tableData: this.requestList,
        totalItems: this.totalRequest,
      },
    });
    requestDialog.afterClosed().subscribe({
      next: (res: any) => {
        this.getRequestList();
      },
      error: (error: any) => {
      },
    });
  }
  getRequestList() {
    this.apiService
      .get(API_ENDPOINTS.doctor.establishmentRequestList, {})
      .subscribe({
        next: (res: any) => {
          this.requestList = res.result[0].data;
          this.totalRequest = res.result[0].count;
        },
        error: (error: any) => {
        },
      });
  }
  onChangeStatus(
    { isActive, establishmentId, hospitalData },
    listName: string,
    index: number
  ) {
    this.apiService
      .putParams(
        API_ENDPOINTS.doctor.editEstablishmentDetail,
        { isActive: !isActive },
        {
          establishmentId,
          hospitalId: hospitalData.hospitalId,
        }
      )
      .subscribe((res: any) => {
        this[listName][index].isActive = !isActive;
      });
  }
  getEvents() {
    this.eventSubscription$ = this.eventService
      .getEvent("statusChanged")
      .subscribe((res: boolean) => {
        if (res) {
          this.getRequestList();
        }
      });
    this.dialogSubscription$ = this.eventService
      .getEvent("adddialogClosed")
      .subscribe((res: boolean) => {
        if (res) {
          this.getEsablishmentList();
        }
      });
  }
  ngOnDestroy(): void {
    if (this.eventSubscription$) {
      this.eventSubscription$.unsubscribe();
    }
    if (this.dialogSubscription$) {
      this.dialogSubscription$.unsubscribe();
    }
  }
}
