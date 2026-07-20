import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FloatingVideoCallComponent } from './floating-video-call.component';
import { SharedContentViewerComponent } from '../shared-content-viewer/shared-content-viewer.component';
import { SafePipe } from 'src/app/pipes/safe.pipe';

@NgModule({
  declarations: [
    FloatingVideoCallComponent,
    SharedContentViewerComponent,
    SafePipe
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    FloatingVideoCallComponent
  ]
})
export class FloatingVideoCallModule { }
