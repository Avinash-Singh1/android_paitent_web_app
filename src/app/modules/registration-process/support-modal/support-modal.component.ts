import { Component, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatDialogRef } from "@angular/material/dialog";

@Component({
  standalone: false,
  selector: "nectar-support-modal",
  templateUrl: "./support-modal.component.html",
  styleUrls: ["./support-modal.component.scss"],
})
export class SupportModalComponent {
  private isBrowser: boolean;
  constructor(
    public matdialogRef: MatDialogRef<SupportModalComponent>) {
    this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  }

  copyText(value: string) {
    if (this.isBrowser) {
      navigator.clipboard.writeText(value).then(
        () => {
          /* Resolved - text copied to clipboard successfully */
        },
        () => {
          /* Rejected - text failed to copy to the clipboard */
        }
      );
    }
    // navigator.permissions
    //   .query({ name: "write-on-clipboard" as PermissionName })
    //   .then((result) => {
    //     if (result.state == "granted" || result.state == "prompt") {
    //       alert("Write access granted!");
    //     }

    //   });
  }
}
