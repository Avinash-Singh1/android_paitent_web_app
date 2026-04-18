
import { Component, Inject, DOCUMENT, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ToastrService } from "ngx-toastr";

@Component({
  standalone: false,
  selector: "nectar-share-modal",
  templateUrl: "./share-modal.component.html",
  styleUrls: ["./share-modal.component.scss"],
})
export class ShareModalComponent {
  private isBrowser: boolean;
  constructor(
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    @Inject(DOCUMENT) public document: any) {
    this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    this.url = this.isBrowser ? this.document.location.href : '';
  }
  url: any;
  iconArray = [
    "assets/images/svg/whatsapp.svg",
    "assets/images/svg/mail.svg",
    "assets/images/svg/facebook.svg",
    "assets/images/svg/linkdn.svg",
    "assets/images/twitter.svg",
    "assets/images/svg/pinterest.svg",
  ];

  copyText(value: string) {
    if (this.isBrowser) {
      navigator.clipboard.writeText(value).then(
        () => {
          this.toastr.success("Link copied successfully!");
          /* Resolved - text copied to clipboard successfully */
        },
        () => {
          console.error("Failed to copy");
          /* Rejected - text failed to copy to the clipboard */
        }
      );
    }
  }
}
