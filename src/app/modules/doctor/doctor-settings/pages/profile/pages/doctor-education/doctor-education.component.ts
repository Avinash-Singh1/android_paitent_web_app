import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { AddMoreEditModalComponent } from "../../components/add-more-edit-modal/add-more-edit-modal.component";
import { ActivatedRoute } from "@angular/router";
import { DeleteModalComponent } from "src/app/shared/components/delete-modal/delete-modal.component";
import { ApiService } from "src/app/services/api.service";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { LocalStorageService } from "src/app/services/storage.service";
import { APP_CONSTANTS } from "src/app/config/app.constant";

@Component({
  standalone: false,
  selector: "nectar-doctor-education",
  templateUrl: "./doctor-education.component.html",
  styleUrls: ["./doctor-education.component.scss"],
})
export class DoctorEducationComponent implements OnInit {
  data: any;
  edit: boolean = false;
  constructor(
    private matdialog: MatDialog,
    private activateRoute: ActivatedRoute,
    private apiService: ApiService,
    private localStorage: LocalStorageService
  ) {
    this.data =
      this.profileListing[this.activateRoute.snapshot.data["heading"]];
  }
  educationList: any;
  awardsList: any;
  medicalRegistration: any;
  membershipList: any;
  servicesList: any;
  faqsList: any;
  videoList: any;
  procedureList: any;
  socialmediaList: any;
  profileListing: any = {
    1: { label: "Education", type: 1, listName: "educationList" },
    2: { label: "Awards and Recognitions", type: 2, listName: "awardsList" },
    3: {
      label: "Medical Registrations",
      type: 3,
      listName: "medicalRegistration",
    },
    4: { label: "Membership", type: 4, listName: "membershipList" },
    5: { label: "Services", type: 5, listName: "servicesList" },
    6: { label: "FAQs", type: 6, listName: "faqsList" },
    7: { label: "Videos", type: 7, listName: "videoList" },
    8: { label: "Social", type: 8, listName: "socialmediaList" },
    9: { label: "Procedure", type: 9, listName: "procedureList" },
  };
  ngOnInit(): void {
    switch (this.data.type) {
      case 6:
        this.faqListDetail();
        break;
      case 7:
        this.getVideosList();
        break;
      case 9:
        this.getProcedureList();
        break;
      default:
        this.getListing();
    }
  }

  onOpenDialog(edit: boolean, item: any) {
    const addEditDialog = this.matdialog.open(AddMoreEditModalComponent, {
      width: "720px",
      autoFocus: false,
      data: {
        edit,
        content: {
          heading: `${edit ? "Edit" : "Add"} ${this.data.label}`,
          type: this.data.type,
          patchData: item,
        },
      },
    });
    addEditDialog.afterClosed().subscribe((res: any) => {
      if (res) {
        switch (this.data.type) {
          case 6:
            this.faqListDetail();
            break;
          case 7:
            this.getVideosList();
            break;
          case 9:
            this.getProcedureList();
            break;
          default:
            this.getListing();
        }
      }
    });
  }
  onDeleteModal(item: any, str: any = "Service") {
    const deleteDialog = this.matdialog.open(DeleteModalComponent, {
      data: {
        heading: "Delete from Doctor profile?",
        message: `This will delete ${item.name} from ${str} sections of your profile.`,
        id: item?.procedureId ? item?.procedureId : item?._id,
        type: str == "Service" ? 5 : 9,
      },
      width: "720px",
    });
    deleteDialog.afterClosed().subscribe((data: any) => {
      if (data) {
        if (str == "Service") {
          this.getListing();
        } else {
          this.getProcedureList();
        }
      }
    });
  }
  faqListDetail() {
    let id = this.localStorage.getItem("faqId");
    let faq = {
      id: id,
      userType: APP_CONSTANTS.USER_TYPES.DOCTOR,
    };
    this.apiService
      .get(API_ENDPOINTS.doctor.faqList, faq)
      .subscribe((res: any) => {
        this.faqsList = res?.result?.data;
      });
  }

  getVideosList() {
    let id = this.localStorage.getItem("faqId");
    let payload = {
      id: id,
      userType: APP_CONSTANTS.USER_TYPES.DOCTOR,
    };
    this.apiService
      .get(API_ENDPOINTS.patient.doctorVideos, payload)
      .subscribe((res: any) => {
        this.videoList = res?.result?.data;
        this.videoList.forEach((element: any) => {
          element.url = element?.url.replace("watch?v=", "embed/");
        });
      });
  }

  getProcedureList() {
    this.apiService
      .get(API_ENDPOINTS.doctor.procedures, {})
      .subscribe((res: any) => {
        this.procedureList = res?.result?.list;
      });
  }
  getListing() {
    this.apiService
      .get(API_ENDPOINTS.doctor.settingList, { type: this.data.type })
      .subscribe((res: any) => {
        this[this.data.listName] = res?.result?.list;
      });
  }
}
