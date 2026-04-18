
import { Component, Inject, OnInit, DOCUMENT } from "@angular/core";
import { Title, Meta } from "@angular/platform-browser";
import { SeoService } from "src/app/services/seo.service";

@Component({
  standalone: false,
  selector: "nectar-about-container",
  templateUrl: "./about-container.component.html",
  styleUrls: ["./about-container.component.scss"],
})
export class AboutContainerComponent implements OnInit {
  activeTab: string = "about";
  constructor(
    private title: Title,
    private seoService: SeoService,
    @Inject(DOCUMENT) public document: any
  ) {}

  ngOnInit(): void {
    this.settingTagsAndTitles();
  }

  settingTagsAndTitles() {
    this.title.setTitle(
      "Nectar: Get Convenient, Affordable, and High-Quality Doctor Consultations Online"
    );
    // this.meta.addTags();
    this.seoService.updateTags([
      {
        name: "description",
        content:
          "Welcome to Nectar Home - a trailblazing platform revolutionizing healthcare access in India. Learn about our commitment to providing seamless online doctor consultations and hospital bookings, empowering patients with a wide network of skilled medical professionals and multiple healthcare facilities. Discover our dedication to delivering personalized and convenient healthcare solutions, making your well-being our top priority. Experience a transformative healthcare experience with Nectar Home.",
      },
      {
        property: "og:title",
        content:
          "Nectar: Get Convenient, Affordable, and High-Quality Doctor Consultations Online",
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
          "Welcome to Nectar Home - a trailblazing platform revolutionizing healthcare access in India. Learn about our commitment to providing seamless online doctor consultations and hospital bookings, empowering patients with a wide network of skilled medical professionals and multiple healthcare facilities. Discover our dedication to delivering personalized and convenient healthcare solutions, making your well-being our top priority. Experience a transformative healthcare experience with Nectar Home.",
      },
      {
        name: "twitter:card",
        property: "summary_large_image",
      },
      {
        name: "twitter:site",
        property: this.document.location.href,
      },
      {
        name: "twitter:title",
        property:
          "Nectar: Get Convenient, Affordable, and High-Quality Doctor Consultations Online",
      },
      {
        name: "twitter:description",
        content:
          "Welcome to Nectar Home - a trailblazing platform revolutionizing healthcare access in India. Learn about our commitment to providing seamless online doctor consultations and hospital bookings, empowering patients with a wide network of skilled medical professionals and multiple healthcare facilities. Discover our dedication to delivering personalized and convenient healthcare solutions, making your well-being our top priority. Experience a transformative healthcare experience with Nectar Home.",
      },
      {
        name: "twitter:image",
        content:
          "https://nectarplus.health/assets/images/svg/nectarLogo.png",
      },
    ]);
  }
}
