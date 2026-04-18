import { DatePipe } from "@angular/common";
import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, OnChanges, OnDestroy, SimpleChanges, Renderer2, ViewChild } from "@angular/core";
import { SafeUrl } from "@angular/platform-browser";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OwlOptions } from "ngx-owl-carousel-o";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { ApiService } from "src/app/services/api.service";
import { EventService } from "src/app/services/event.service";
import { SeoService } from "src/app/services/seo.service";
import {
  NgxLiteVideoGeneralService,
  ThumbSize,
} from "src/app/services/ngx-lite-video-general-service.service";

@Component({
  standalone: false,
  selector: "nectar-videos-section",
  templateUrl: "./videos-section.component.html",
  styleUrls: ["./videos-section.component.scss"],
  providers: [NgxLiteVideoGeneralService],
})
export class VideosSectionComponent implements OnInit, OnChanges, OnDestroy {
  @Input() id: any;
  @Input() type: string = "doctor";
  @Input() tab: number = 1;

  @ViewChild('videosTrack', { static: false }) videosTrack!: ElementRef<HTMLDivElement>;

  apiData: any[] = [];
  apiHit: boolean = false;
  iframeVisible: boolean[] = [];
  private destroy$ = new Subject<void>();
  private lastFetchedId: string | null = null;

  customOptions: OwlOptions = {
    loop: false,
    autoplay: false,
    center: false,
    dots: false,
    margin: 20,
    items: 2.4,
  };

  thumbQuality: ThumbSize = "high";
  hasControls: boolean = true;
  allowFullScreen: boolean = true;
  loop: boolean = false;
  start!: number;
  end!: number;

  constructor(
    private apiService: ApiService,
    private eventService: EventService,
    private seoService: SeoService,
    private renderer: Renderer2,
    private datePipe: DatePipe,
    private videoService: NgxLiteVideoGeneralService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.eventService.getEvent("doctor-route").pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res) {
        this.id = res;
        this.getVideos();
      }
    });

    this.eventService.getEvent("hospital-route").pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res) {
        this.id = res;
        this.getVideos();
      }
    });

    if (this.id) {
      this.getVideos();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["id"] && this.id && this.id !== this.lastFetchedId) {
      this.lastFetchedId = this.id;
      this.getVideos();
    }
  }

  getVideos(): void {
    const payload =
      this.type === "doctor"
        ? { id: this.id, userType: 2 }
        : { establishmentId: this.id, userType: 3 };

    // console.log("Payload for videos:", payload);

    this.apiService
      .get(API_ENDPOINTS.patient.doctorVideos, payload)
      .subscribe((res: any) => {
        this.apiHit = true;
        this.apiData = res?.result?.data || [];

        this.apiData.forEach((element: any) => {
          element.url = element?.url.replace("watch?v=", "embed/");
        });

        this.iframeVisible = new Array(this.apiData.length).fill(false);

        this.settingSchemaMarkUp();

        // ✅ Manually trigger change detection for OnPush
        this.cdr.detectChanges();
      });
  }

  settingSchemaMarkUp(): void {
    if (!this.apiData?.length) return;

    const videoObjects = this.apiData
      .filter((item) => item?.title && item?.url && item?.createdAt)
      .map((item) => ({
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: item.title,
        description: item.description || item.title,
        thumbnailUrl:
          item.thumbnailUrl ||
          "https://nector-prod.s3.ap-south-1.amazonaws.com/986d9500-921d-11ef-9eef-990c47d7fcd5-defaultProfilePic.png",
        uploadDate: this.datePipe.transform(
          item.createdAt,
          "yyyy-MM-dd'T'HH:mm:ssXXX"
        ),
        contentUrl: item.url,
        embedUrl: item.url,
      }));

    videoObjects.forEach((videoSchema) =>
      this.seoService.setJsonLd(this.renderer, videoSchema)
    );
  }

  // playVideo(index: number): void {
  //   this.iframeVisible[index] = true;
  // }
  currentPlayingIndex: number | null = null;

playVideo(index: number): void {
  if (this.currentPlayingIndex === index) {
    // Pause current video if clicked again
    this.iframeVisible[index] = false;
    this.currentPlayingIndex = null;
  } else {
    // Pause the old one
    if (this.currentPlayingIndex !== null) {
      this.iframeVisible[this.currentPlayingIndex] = false;
    }

    // Play the new one
    this.iframeVisible[index] = true;
    this.currentPlayingIndex = index;
  }

  this.cdr.detectChanges();
}

  getEmbedUrl(url: string): SafeUrl {
    const videoId = this.extractYoutubeId(url);
    return this.videoService.getYouTubeUrl(
      videoId,
      this.hasControls,
      this.allowFullScreen,
      this.loop,
      this.start,
      this.end
    );
  }

  getThumbnail(url: string): string {
    const videoId = this.extractYoutubeId(url);
    if (!videoId) {
      return "assets/default-thumbnail.jpg";
    }
    return this.videoService.getYouTubeBanner(videoId, this.thumbQuality);
  }

  extractYoutubeId(url: string): string {
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^?&]+)/);
    return match?.[1] || "";
  }

  scrollVideos(direction: 'prev' | 'next'): void {
    const el = this.videosTrack?.nativeElement;
    if (!el) return;
    const scrollAmount = 296; // card width (280) + gap (16)
    el.scrollBy({
      left: direction === 'next' ? scrollAmount : -scrollAmount,
      behavior: 'smooth',
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
