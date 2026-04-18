import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { APP_CONSTANTS } from "src/app/config/app.constant";
import { ApiService } from "src/app/services/api.service";
import { generateYearList } from "src/app/services/helper.service";
import { LocalStorageService } from "src/app/services/storage.service";

@Component({
  standalone: false,
  selector: "nectar-add-more-edit-modal",
  templateUrl: "./add-more-edit-modal.component.html",
  styleUrls: ["./add-more-edit-modal.component.scss"],
})
export class AddMoreEditModalComponent implements OnInit {
  constructor(
    public matdialogRef: MatDialogRef<AddMoreEditModalComponent>,
    @Inject(MAT_DIALOG_DATA) public matdata: any,
    private apiService: ApiService,
    private fb: FormBuilder,
    private localStorage: LocalStorageService
  ) {}

  addEditForm: FormGroup;
  formList = {
    1: {
      fields: [
        {
          label: "Degree",
          required: true,
          type: "input",
          placeholder: "Degree",
          formcontrolName: "degree",
        },
        {
          label: "College",
          required: false,
          type: "input",
          placeholder: "College",
          formcontrolName: "college",
        },
        {
          label: "Year",
          required: false,
          type: "select",
          placeholder: "Year",
          formcontrolName: "year",

          items: generateYearList(new Date().getFullYear()),
        },
      ],
      formGroup: {
        degree: [
          "",
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(100),
          ],
        ],
        college: ["", []],
        year: [null, []],
      },
    },
    2: {
      fields: [
        {
          label: "Name",
          required: true,
          type: "input",
          placeholder: "Name",
          formcontrolName: "name",
        },
        {
          label: "Year",
          required: true,
          type: "select",
          placeholder: "Year",
          formcontrolName: "year",
          items: generateYearList(new Date().getFullYear()),
        },
      ],
      formGroup: {
        name: ["", [Validators.required, Validators.minLength(3)]],
        year: [null, [Validators.required]],
      },
    },
    3: {
      fields: [
        {
          label: "Registrations Number",
          required: false,
          type: "input",
          placeholder: "Registration Number",
          formcontrolName: "registrationNumber",
        },
        {
          label: "Registrations Council",
          required: false,
          type: "input",
          placeholder: "Registrations Council",
          formcontrolName: "council",
        },
        {
          label: "Registrations Year",
          required: false,
          type: "select",
          placeholder: "Year",
          formcontrolName: "year",
          items: generateYearList(new Date().getFullYear()),
        },
      ],
      formGroup: {
        registrationNumber: ["", []],
        council: ["", []],
        year: [null, []],
      },
    },
    4: {
      fields: [
        {
          label: "Name",
          required: true,
          type: "input",
          placeholder: "Name",
          formcontrolName: "name",
        },
      ],
      formGroup: {
        name: ["", [Validators.required, Validators.minLength(3)]],
      },
    },
    5: {
      fields: [
        {
          label: "Service",
          required: true,
          type: "input",
          placeholder: "Service",
          formcontrolName: "name",
        },
      ],
      formGroup: {
        name: [
          "",
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(100),
          ],
        ],
      },
    },
    6: {
      fields: [
        {
          label: "Question",
          required: true,
          type: "input",
          placeholder: "Question",
          formcontrolName: "question",
        },
        {
          label: "Answer",
          required: true,
          rows: 2,
          type: "textarea",
          placeholder: "Answer",
          formcontrolName: "answer",
        },
      ],
      formGroup: {
        question: [
          "",
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(200),
          ],
        ],
        answer: [
          "",
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(500),
          ],
        ],
      },
    },
    7: {
      fields: [
        {
          label: "Title",
          required: true,
          type: "input",
          placeholder: "Title",
          formcontrolName: "title",
        },
        {
          label: "URL",
          required: true,
          type: "input",
          placeholder: "Video URL",
          formcontrolName: "url",
        },
      ],
      formGroup: {
        title: [
          "",
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(100),
          ],
        ],
        url: [
          "",
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(200),
          ],
        ],
      },
    },
    8: {
      fields: [
        {
          label: "Social",
          required: true,
          type: "select",
          placeholder: "Select Social",
          position: "bottom",
          items: [],
          formcontrolName: "socialMediaId",
        },
        {
          label: "Social URL",
          required: true,
          type: "input",
          placeholder: "Type Social URL",
          formcontrolName: "url",
        },
      ],
      formGroup: {
        socialMediaId: [null, [Validators.required]],
        url: [
          "",
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(200),
          ],
        ],
      },
    },
    9: {
      fields: [
        {
          label: "Procedure",
          required: true,
          type: "select",
          placeholder: "Select Procedure",
          position: "bottom",
          items: [],
          formcontrolName: "recordId",
        },
      ],
      formGroup: {
        recordId: [null, [Validators.required]],
      },
    },
  };
  ngOnInit(): void {
    this.validateForm();
    if (this.matdata.content.type == 8) {
      this.socialList();
    }
    if (this.matdata.content.type == 9) {
      this.masterProcedureList();
    }
  }
  get control() {
    return this.addEditForm.controls;
  }
  onClose() {
    this.matdialogRef.close();
  }
  validateForm() {
    this.addEditForm = this.fb.group(
      this.formList[this.matdata.content?.type].formGroup
    );
    if (this.matdata.edit) {
      this.addEditForm.patchValue(this.matdata.content?.patchData);
    }
  }

  onSubmit() {
    this.addEditForm.markAllAsTouched();

    if (this.addEditForm.valid) {
      switch (this.matdata.content.type) {
        case 6:
          this.handleType6Submit();
          break;
        case 7:
          this.handleType7Submit();
          break;
        case 9:
          this.handleType9Submit();
          break;
        default:
          this.handleDefaultSubmit();
          break;
      }
    }
  }

  handleType6Submit() {
    const userId = this.localStorage.getItem("findUserId");
    let data = {
      ...this.addEditForm.value,
      userType: APP_CONSTANTS.USER_TYPES.DOCTOR,
      userId,
    };

    const endpoint = this.matdata.edit
      ? API_ENDPOINTS.doctor.addfaqList +
        "/" +
        this.matdata.content.patchData._id
      : API_ENDPOINTS.doctor.addfaqList;

    this.submitData(endpoint, data, !this.matdata.edit);
  }

  handleType7Submit() {
    const id = this.localStorage.getItem("findUserId");
    let payload = {
      userId: id,
      ...this.addEditForm.value,
      userType: APP_CONSTANTS.USER_TYPES.DOCTOR,
    };

    const endpoint = this.matdata.edit
      ? API_ENDPOINTS.doctor.addVideos +
        "?id=" +
        this.matdata.content.patchData._id
      : API_ENDPOINTS.doctor.addVideos;

    this.submitData(endpoint, payload, !this.matdata.edit);
  }

  handleType9Submit() {
    const payloadData = {
      type: this.matdata.content.type,
      isEdit: this.matdata.edit,
      records: { ...this.addEditForm.value },
    };

    this.apiService
      .post(API_ENDPOINTS.doctor.procedures, payloadData)
      .subscribe({
        next: (res: any) => {
          this.matdialogRef.close(true);
        },
      });
  }

  handleDefaultSubmit() {
    const payload1 = {
      type: this.matdata.content.type,
      isEdit: this.matdata.edit,
      records: { ...this.addEditForm.value },
    };

    Object.keys(payload1?.records).forEach((key) => {
      if (!payload1?.records[key]) {
        payload1.records[key] = null;
      }
    });
    const params = this.matdata.edit
      ? { recordId: this.matdata.content.patchData._id }
      : {};

    this.apiService
      .putParams(API_ENDPOINTS.doctor.settingList, payload1, params)
      .subscribe({
        next: (res: any) => {
          this.matdialogRef.close(true);
        },
      });
  }

  submitData(endpoint, data, addFaq = false) {
    if (addFaq) {
      this.apiService.post(endpoint, data).subscribe((res: any) => {
        this.matdialogRef.close(true);
      });
    } else {
      this.apiService.put(endpoint, data).subscribe((res: any) => {
        this.matdialogRef.close(true);
      });
    }
  }

  socialList() {
    this.apiService
      .get(API_ENDPOINTS.doctor.social, {})
      .subscribe((res: any) => {
        this.formList[this.matdata.content.type].fields[0].items =
          res?.result?.data;
      });
  }
  masterProcedureList() {
    this.apiService
      .get(API_ENDPOINTS.MASTER.procedure, {})
      .subscribe((res: any) => {
        this.formList[this.matdata.content.type].fields[0].items =
          res?.result?.data;
      });
  }

  onDelete() {
    switch (this.matdata.content.type) {
      case 6:
        this.apiService
          .delete(
            API_ENDPOINTS.doctor.addfaqList,
            this.matdata.content.patchData?._id
          )
          .subscribe((res: any) => {
            this.matdialogRef.close(true);
          });
        break;
      case 7:
        this.apiService
          .deleteSetting(API_ENDPOINTS.doctor.addVideos, {
            id: this.matdata.content.patchData._id,
          })
          .subscribe((res: any) => {
            this.matdialogRef.close(true);
          });
        break;
      default:
        const param = {
          recordId: this.matdata?.content?.patchData._id,
        };
        const data = {
          type: this.matdata.content.type,
          isEdit: true,
          isDeleted: true,
        };
        this.apiService
          .putSetting(API_ENDPOINTS.doctor.settingList, data, param)
          .subscribe((res: any) => {
            this.matdialogRef.close(true);
          });
    }
  }
}
