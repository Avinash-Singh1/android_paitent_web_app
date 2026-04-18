import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { OwlOptions } from "ngx-owl-carousel-o";
import { CommonService } from "src/app/services/common.service";

@Component({
  standalone: false,
  selector: "nectar-benefits",
  templateUrl: "./benefits.component.html",
  styleUrls: ["./benefits.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BenefitsComponent implements OnInit {
  constructor(private commonService: CommonService) {}
  devicWidth: any;
  isExpanded: boolean[] = [];

  ngOnInit(): void {
    this.devicWidth = this.commonService.gettingWinowWidth();
    this.isExpanded = this.apiData.map(() => false);

  }
  customOptions: OwlOptions = {
    loop: true,
    center: true,
    dots: false,
    // autoHeight: true,
    // autoWidth: true,
    // margin: 20,
    nav: true,
    navText: [
      '<img src="assets/images/svg/purple-arrow.svg" alt="" height="36" width="36" >',
      '<img src="assets/images/svg/purple-arrow.svg" alt="" height="36" width="36">',
    ],
    responsive: {
      0: {
        items: 1,
      },
      600: {
        items: 1,
      },
      1000: {
        items: 1,
      },
    },
  };
  selectedImage: any = "assets/images/svg/image 64.svg";
  data: any = [
    {
      img: "assets/images/svg/customer-back.svg",
      title:
        "Connect with a Nectar Expert: Get Personalized Help with Your Nectar Purchase",
    },
    {
      img: "assets/images/svg/schedule.svg",
      title: "Book an appointment with a nearby Nectar expert doctor today",
    },
    {
      img: "assets/images/svg/diagnosis.svg",
      title:
        "Obtain expert diagnosis and treatment guidance from our experienced doctors.",
    },
    {
      img: "assets/images/svg/recomm.svg",
      title:
        "In certain cases, surgery or procedures may be advised for treatment",
    },
    {
      img: "assets/images/svg/hospital1.svg",
      title:
        "Select a partner hospital that aligns with your specific healthcare needs",
    },
    {
      img: "assets/images/svg/customer-back.svg",
      title: "Get complete assistance from Admission to Discharge",
    },
    {
      img: "assets/images/svg/heart.svg",
      title:
        "Access post-operative support and follow-up consultations for your continued care",
    },
  ];
  apiData: any = [
    // "assets/images/svg/image 64.svg",
    // "assets/images/svg/surgery-image-static.svg",
    // "assets/images/svg/surgery-image-static1.svg",
    // "assets/images/svg/surgery-image-static2.svg",
    "assets/images/svg/1.svg",
    "assets/images/svg/2.svg",
    "assets/images/svg/3.svg",
    "assets/images/svg/4.svg",
  ];
  videoUrl: any = "https://www.youtube.com/embed/aeTDe7e3nC0";



  faqlist:any=[
    {
      question: "How much pain will I be in after the surgery?",
      answer: "Nectar is a healthcare platform that connects patients with experienced doctors and partner hospitals"
    },
    {
      question: "How much pain will I be in after the surgery?",
      answer: "Nectar is a healthcare platform that connects patients with experienced doctors and partner hospitals"
    },
    {
      question: "When can I go home after surgery?",
      answer: "Nectar is a healthcare platform that connects patients with experienced doctors and partner hospitals"
    },
    {
      question: "When can I return to my normal activities?",
      answer: "Nectar is a healthcare platform that connects patients with experienced doctors and partner hospitals"
    },
    {
      question: "When can I resume work?",
      answer: "Nectar is a healthcare platform that connects patients with experienced doctors and partner hospitals"
    },
    {
      question: "When can I start driving again?",
      answer: "Nectar is a healthcare platform that connects patients with experienced doctors and partner hospitals"
    },
    {
      question: "Can I recover without surgery?",
      answer: "Nectar is a healthcare platform that connects patients with experienced doctors and partner hospitals"
    },
    {
      question: "How much pain will I be in after the surgery?",
      answer: "Nectar is a healthcare platform that connects patients with experienced doctors and partner hospitals"
    },
    {
      question: "How much pain will I be in after the surgery?",
      answer: "Nectar is a healthcare platform that connects patients with experienced doctors and partner hospitals"
    },
    {
      question: "How much pain will I be in after the surgery?",
      answer: "Nectar is a healthcare platform that connects patients with experienced doctors and partner hospitals"
    },
    {
      question: "How much pain will I be in after the surgery?",
      answer: "Nectar is a healthcare platform that connects patients with experienced doctors and partner hospitals"
    },
    {
      question: "How much pain will I be in after the surgery?",
      answer: "Nectar is a healthcare platform that connects patients with experienced doctors and partner hospitals"
    },

  ]
  toggleReadMore(index: number): void {
    this.isExpanded[index] = !this.isExpanded[index];
  }
}

