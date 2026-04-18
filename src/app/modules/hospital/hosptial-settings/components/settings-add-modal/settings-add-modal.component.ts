import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import { ApiService } from "src/app/services/api.service";
import { HospitalDeleteModalComponent } from "../../../components/hospital-delete-modal/hospital-delete-modal.component";
import { APP_CONSTANTS } from "src/app/config/app.constant";

@Component({
  standalone: false,
  selector: "nectar-settings-add-modal",
  templateUrl: "./settings-add-modal.component.html",
  styleUrls: ["./settings-add-modal.component.scss"],
})
export class SettingsAddModalComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public matdialogRef: MatDialogRef<SettingsAddModalComponent>,
    private apiService: ApiService,
    private matdialog: MatDialog
  ) {}
  addForm: FormGroup;
  ngOnInit(): void {
    this.addForm = this.fb.group(this.formList[this.data.type].formGroup);
    if (this.data.edit) {
      this.addForm.patchValue(this.data.patchValue);
    }
  }
  typeObj = {
    1: "service",
    2: "FAQ",
    3: "video",
  };
  formList = {
    1: {
      fields: [
        {
          label: "Services",
          required: true,
          type: "input",
          placeholder: "Type Services",
          formcontrolName: "name",
          payload: "service",
        },
      ],
      formGroup: {
        name: [null, [Validators.required, Validators.minLength(3)]],
      },
      payload: "service",
    },
    2: {
      fields: [
        {
          label: "Question",
          required: true,
          type: "input",
          placeholder: "Type Question",
          formcontrolName: "question",
        },
        {
          label: "Answer",
          required: true,
          type: "textarea",
          rows: 2,
          placeholder: "Type Answer",
          formcontrolName: "answer",
        },
      ],
      formGroup: {
        question: [
          null,
          [
            Validators.required,
            Validators.minLength(10),
            Validators.maxLength(200),
          ],
        ],
        answer: [
          null,
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(500),
          ],
        ],
      },
      payload: false,
    },
    3: {
      fields: [
        {
          label: "Title",
          required: true,
          type: "input",
          placeholder: "Type Title",
          formcontrolName: "title",
        },
        {
          label: "Video URL",
          required: true,
          type: "input",
          placeholder: "Type Video URL",
          formcontrolName: "url",
        },
      ],
      formGroup: {
        title: [
          null,
          [
            Validators.required,
            Validators.minLength(10),
            Validators.maxLength(100),
          ],
        ],
        url: [
          null,
          [
            Validators.required,
            Validators.minLength(10),
            Validators.maxLength(100),
          ],
        ],
      },
      payload: false,
    },
  };
  get control() {
    return this.addForm.controls;
  }
  onDelete() {
    this.matdialogRef.close();
    setTimeout(() => {
      this.matdialog.open(HospitalDeleteModalComponent, {
        data: {
          heading: "Delete from Hospital profile?",
          message: `The ${
            this.typeObj[this.data.type]
          } will be removed permanently. Do you want to delete?`,
        },
      });
    }, 100);
  }
  onSubmit() {
    this.addForm.markAllAsTouched();
    if (this.addForm.valid) {
      let payload: any = {};
      if (this.formList[this.data.type].payload) {
        payload = {
          [this.formList[this.data.type].payload]: this.addForm.value,
        };
        if (this.data.type > 1) {
          payload.userType = APP_CONSTANTS.USER_TYPES.HOSPITAL;
        }
      } else {
        payload = { ...this.addForm.value };
      }
      this.data?.edit
        ? this.apiService
            .putParams(this.data.apiEndpoints, payload, {
              [this.data.editKey]: this.data.patchValue._id,
            })
            .subscribe({
              next: (res: any) => {
                this.matdialogRef.close(true);
              },
            })
        : this.apiService.post(this.data.apiEndpoints, payload).subscribe({
            next: (res: any) => {
              this.matdialogRef.close(true);
            },
          });
    }
  }
}
