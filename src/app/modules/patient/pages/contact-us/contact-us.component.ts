import { Component, Inject, OnInit, Renderer2, DOCUMENT, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { EventService } from "src/app/services/event.service";
import { InputValidationService } from "src/app/services/input-validation.service";
import { Title, Meta } from "@angular/platform-browser";
import { SeoService } from "src/app/services/seo.service";


@Component({
  standalone: false,
  selector: "nectar-contact-us",
  templateUrl: "./contact-us.component.html",
  styleUrls: ["./contact-us.component.scss"],
})
export class ContactUsComponent implements OnInit {
  contactForm!: FormGroup;
  submitted: boolean = false;
  isSubmitting: boolean = false;
  showSuccess: boolean = false;
  constructor(
    private fb: FormBuilder,
    public cValidator: InputValidationService,
    private eventService: EventService,
    private apiService: ApiService,
    private toastr: ToastrService,
    private title: Title,
    private seoService: SeoService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) public document: any
  ) {}

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  ngOnInit(): void {
    this.settingTagsAndTitles();
    this.contactForm = this.fb.group({
      phone: ["", [Validators.required, Validators.minLength(10)]],
      name: ["", [Validators.required]],
      comment: ["", [Validators.required]],
      email: [
        "",
        [
          // Validators.required,
          Validators.email,
          Validators.pattern(
            "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$"
          ),
        ],
      ],
    });
  }

  settingTagsAndTitles() {
    //setting title and description
    this.title.setTitle(
      "Contact | Nectar Home - Reach Out for Seamless Healthcare Assistance"
    );
    // this.meta.addTags();
    this.seoService.updateTags([
      {
        name: "description",
        content:
          "Get in touch with Nectar Home for seamless healthcare assistance and support. Our dedicated team is here to address your queries, provide information about our online doctor consultations and hospital booking services, and assist you in any way possible. Experience reliable and prompt communication as we prioritize your well-being. Reach out to us today and embark on a journey to accessible healthcare in India with Nectar Home.",
      },
      {
        property: "og:title",
        content:
          "Contact | Nectar Home - Reach Out for Seamless Healthcare Assistance",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:url",
        content: this.document.location.href,
      },
      {
        property: "og:image",
        content:
          "https://nectarplus.health/assets/images/svg/nectarLogo.png",
      },
      {
        property: "og:description",
        content:
          "Get in touch with Nectar Home for seamless healthcare assistance and support. Our dedicated team is here to address your queries, provide information about our online doctor consultations and hospital booking services, and assist you in any way possible. Experience reliable and prompt communication as we prioritize your well-being. Reach out to us today and embark on a journey to accessible healthcare in India with Nectar Home.",
      },
      {
        property: "og:phone",
        content: "+1 800 555 1212",
      },
      {
        property: "og:email",
        content: "info@nectarplus.health",
      },
      {
        property: "og:address",
        content: "123 Main Street, New York, NY 10001",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:site",
        content: this.document.location.href,
      },
      {
        name: "twitter:title",
        content:
          "Contact | Nectar Home - Reach Out for Seamless Healthcare Assistance",
      },
      {
        name: "twitter:description",
        content:
          "Get in touch with Nectar Home for seamless healthcare assistance and support. Our dedicated team is here to address your queries, provide information about our online doctor consultations and hospital booking services, and assist you in any way possible. Experience reliable and prompt communication as we prioritize your well-being. Reach out to us today and embark on a journey to accessible healthcare in India with Nectar Home.",
      },
      {
        name: "twitter:image",
        content:
          "https://nectarplus.health/assets/images/svg/nectarLogo.png",
      },
    ]);
  }

  get control() {
    return this.contactForm.controls;
  }

  submit() {
    this.submitted = true;
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      this.contactForm.value.email = this.contactForm.value.email || null;
      this.apiService
        .post(API_ENDPOINTS.patient.contactUs, this.contactForm.value)
        .subscribe({
          next: (res: any) => {
            if (this.isBrowser) {
              this.seoService.appendScript(
                `  function gtag_report_conversion(url) {
    var callback = function () {
      if (typeof(url) != 'undefined') {
        window.location = url;
      }
    };
    gtag('event', 'conversion', {
       'send_to': 'AW-11399196295/j0zNCKuh9fMYEIfdx7sq',
       'event_callback': callback
    });
    return false;
  }`,
                this.renderer
              );
            }
            this.toastr.success('Thank you! Your request has been submitted.');
            this.submitted = false;
            this.isSubmitting = false;
            this.contactForm.reset();
            this.showSuccess = true;
            if (this.isBrowser) {
              setTimeout(() => this.showSuccess = false, 6000);
            }
          },
          error: () => {
            this.isSubmitting = false;
            this.toastr.error('Something went wrong. Please try again.');
          }
        });
    }
  }
  ngOnDestroy() { }
}
