import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { PatientDetialsComponent } from "./components/patient-detials/patient-detials.component";
import { EditAppointmentModalComponent } from "./components/edit-appointment-modal/edit-appointment-modal.component";
import { CancelAppointmentModalComponent } from "./components/cancel-appointment-modal/cancel-appointment-modal.component";
import { DeleteAppointmentModalComponent } from "./components/delete-appointment-modal/delete-appointment-modal.component";
import { DoctorListComponent } from "./components/doctor-list/doctor-list.component";
import { PatientListComponent } from "./components/patient-list/patient-list.component";
import { SharedModule } from "src/app/shared/shared.module";
import { AngularSvgIconModule, SvgLoader } from "angular-svg-icon";
import { TranslateModule } from "@ngx-translate/core";
import { NgSelectModule } from "@ng-select/ng-select";
import { ReactiveFormsModule } from "@angular/forms";
import { MatDialogModule } from "@angular/material/dialog";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { SubheaderComponent } from "./components/subheader/subheader.component";
import { svgLoaderFactory } from "src/app/shared/loader/svg-common.loader";
import { HttpClient } from "@angular/common/http";


const component = [
  PatientDetialsComponent,
  EditAppointmentModalComponent,
  CancelAppointmentModalComponent,
  DeleteAppointmentModalComponent,
  DoctorListComponent,
  PatientListComponent,
  SubheaderComponent,
];
@NgModule({
  declarations: component,
  imports: [
    CommonModule,
    SharedModule,
    AngularSvgIconModule.forRoot({
      loader: {
        provide: SvgLoader,
        useFactory: svgLoaderFactory,
        deps: [HttpClient],
      },
    }),
    TranslateModule,
    NgSelectModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatDatepickerModule,
  ],
  exports: component,
})
export class DoctorHospitalSharedModule {}
