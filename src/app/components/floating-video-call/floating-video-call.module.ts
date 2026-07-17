import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FloatingVideoCallComponent } from './floating-video-call.component';

@NgModule({
  declarations: [
    FloatingVideoCallComponent
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
