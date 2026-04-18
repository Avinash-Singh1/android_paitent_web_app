import { Component, Input, OnInit, Renderer2 } from "@angular/core";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { CommonService } from "src/app/services/common.service";
import { SeoService } from "src/app/services/seo.service";

@Component({
  standalone: false,
  selector: 'nectar-surgery-faq',
  templateUrl: './surgery-faq.component.html',
  styleUrls: ['./surgery-faq.component.scss']
})
export class SurgeryFaqComponent implements OnInit {

  constructor(
    private apiService: ApiService,
    private seoService: SeoService,
    private _renderer2: Renderer2,
    private commonService: CommonService) {}
  deviceWidth: any;
  @Input() type = null;
  @Input() id: any = null;
  isExpanded: boolean[] = [];

  ngOnInit(): void {
    this.deviceWidth = this.commonService.gettingWinowWidth();
    this.getListing();
    this.isExpanded = this.questionArray.map(() => false);

  }
  panelOpenState = false;
  questionArray: any;

  getListing() {
    if (!this.type) {
      this.apiService.get(API_ENDPOINTS.patient.faq, {})
        .subscribe((res: any) => {
          this.questionArray = res?.result?.data;
          this.settingSchemaMarkUp();
        });
    } else if (this.type == "surgery") {
      this.apiService.get(`${API_ENDPOINTS.patient.faqSurgeryWise}`, {
            slug: this.id })
        .subscribe((res: any) => {
          this.questionArray = res?.result?.data;
          this.settingSchemaMarkUp();
        });
    }
  }

  settingSchemaMarkUp() {
    const entityArray = this.questionArray.map((item: any) => ({
      "@type": "Question",
      name: item?.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item?.answer } }));

    const jsonLdData = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: entityArray };

    this.seoService.setJsonLd(this._renderer2, jsonLdData);
  }

  toggleReadMore(index: number): void {
    this.isExpanded[index] = !this.isExpanded[index];
  }
}
