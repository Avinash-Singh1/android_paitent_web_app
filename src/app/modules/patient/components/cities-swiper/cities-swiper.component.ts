import { ChangeDetectionStrategy, Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { DeviceService } from 'src/app/services/device.service';
import { OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  standalone: false,
  selector: 'nectar-cities-swiper',
  templateUrl: './cities-swiper.component.html',
  styleUrls: ['./cities-swiper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CitiesSwiperComponent implements OnInit {
  protected readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  isMobileView: boolean = false;
  cardWidth: number = 200;
  apiData: any = [];


  constructor(
    private router: Router,
    public commonService: CommonService,
    private deviceService: DeviceService
  ) {}

  ngOnInit(): void {
    // Use DeviceService for browser-aware mobile detection
    const width = this.deviceService.getWidth();
    this.isMobileView = width < 767;
    if (this.isMobileView) this.cardWidth = 135;

    this.getListing();
  }

  getListing() {
//     const result = [
//  { id: '1', name: 'Delhi', image: 'assets/images/cities/delhi.jpg', link: '/delhi' },
//   { id: '2', name: 'Mumbai', image: 'assets/images/cities/delhi.jpg', link: '/mumbai' },
//   { id: '3', name: 'Bangalore', image: 'assets/images/cities/delhi.jpg', link: '/bangalore' },
//   { id: '4', name: 'Hyderabad', image: 'assets/images/cities/delhi.jpg', link: '/hyderabad' },
//   { id: '5', name: 'Chennai', image: 'assets/images/cities/delhi.jpg', link: '/chennai' },
//   { id: '6', name: 'Kolkata', image: 'assets/images/cities/delhi.jpg', link: '/kolkata' },
//   { id: '7', name: 'Pune', image: 'assets/images/cities/delhi.jpg', link: '/pune' },
//   { id: '8', name: 'Ahmedabad', image: 'assets/images/cities/delhi.jpg', link: '/ahmedabad' },
//   { id: '9', name: 'Jaipur', image: 'assets/images/cities/delhi.jpg', link: '/jaipur' },
//   { id: '10', name: 'Lucknow', image: 'assets/images/cities/delhi.jpg', link: '/lucknow' },
//   { id: '11', name: 'Bhopal', image: 'assets/images/cities/delhi.jpg', link: '/bhopal' },
//   { id: '12', name: 'Indore', image: 'assets/images/cities/delhi.jpg', link: '/indore' },
//   { id: '13', name: 'Nagpur', image: 'assets/images/cities/delhi.jpg', link: '/nagpur' },
//   { id: '14', name: 'Chandigarh', image: 'assets/images/cities/delhi.jpg', link: '/chandigarh' },
//   { id: '15', name: 'Surat', image: 'assets/images/cities/delhi.jpg', link: '/surat' },
//   { id: '16', name: 'Patna', image: 'assets/images/cities/delhi.jpg', link: '/patna' },
//   { id: '17', name: 'Ranchi', image: 'assets/images/cities/delhi.jpg', link: '/ranchi' },
//   { id: '18', name: 'Guwahati', image: 'assets/images/cities/delhi.jpg', link: '/guwahati' },
//   { id: '19', name: 'Dehradun', image: 'assets/images/cities/delhi.jpg', link: '/dehradun' },
//   { id: '20', name: 'Amritsar', image: 'assets/images/cities/delhi.jpg', link: '/amritsar' },
//   { id: '21', name: 'Coimbatore', image: 'assets/images/cities/delhi.jpg', link: '/coimbatore' },
//   { id: '22', name: 'Kochi', image: 'assets/images/cities/delhi.jpg', link: '/kochi' },
//   { id: '23', name: 'Vijayawada', image: 'assets/images/cities/delhi.jpg', link: '/vijayawada' },
//   { id: '24', name: 'Varanasi', image: 'assets/images/cities/delhi.jpg', link: '/varanasi' },
//   { id: '25', name: 'Meerut', image: 'assets/images/cities/delhi.jpg', link: '/meerut' }
//     ];

const result = [
  { id: '1', name: 'Delhi', image: 'assets/images/cities/ncr-selected.png', link: '/delhi' },
  { id: '2', name: 'Mumbai', image: 'assets/images/cities/mumbai.png', link: '/mumbai' },
  { id: '3', name: 'Bengaluru', image: 'assets/images/cities/bang.png', link: '/bengaluru' },
  { id: '4', name: 'Hyderabad', image: 'assets/images/cities/hyd.png', link: '/hyderabad' },
  { id: '5', name: 'Chennai', image: 'assets/images/cities/chen.png', link: '/chennai' },
  { id: '6', name: 'Kolkata', image: 'assets/images/cities/kolk.png', link: '/kolkata' },
  { id: '7', name: 'Pune', image: 'assets/images/cities/pune.png', link: '/pune' },
  { id: '8', name: 'Ahmedabad', image: 'assets/images/cities/ahd.png', link: '/ahmedabad' },
  { id: '9', name: 'Chandigarh', image: 'assets/images/cities/chd.png', link: '/chandigarh' },
  { id: '10', name: 'Kochi', image: 'assets/images/cities/koch.jpeg', link: '/kochi' },
  { id: '11', name: 'Patiala', image: 'assets/images/cities/pune.png', link: '/patiala' },
  { id: '12', name: 'Vadodara', image: 'assets/images/cities/bang.png', link: '/vadodara' },
  { id: '13', name: 'karimnagar', image: 'assets/images/cities/hyd.png', link: '/karimnagar' },
  { id: '14', name: 'vijayawada', image: 'assets/images/cities/kolk.png', link: '/vijayawada' },
  { id: '15', name: 'Karnataka', image: 'assets/images/cities/kolk.png', link: '/karnataka' },
  { id: '16', name: 'Jammu', image: 'assets/images/cities/kolk.png', link: '/jammu' },
  { id: '17', name: 'Chandigarh', image: 'assets/images/cities/kolk.png', link: '/chandigarh' },
  { id: '18', name: 'Gurugram', image: 'assets/images/cities/kolk.png', link: '/gurugram' },
  { id: '19', name: 'Ghaziabad', image: 'assets/images/cities/kolk.png', link: '/ghaziabad' },
  { id: '20', name: 'Mumbai', image: 'assets/images/cities/kolk.png', link: '/mumbai' },
];

    if (this.isMobileView) {
      const grouped = [];
      for (let i = 0; i < result.length; i += 2) {
        grouped.push([result[i], result[i + 1]]);
      }
      this.apiData = grouped;
    } else {
      this.apiData = result;
    }
  }

  viewDoctor(name: string) {
    const hyphenated = this.commonService.replaceSpaceWithHyphen(name);
    this.router.navigate([`/${hyphenated}`]);
  }

  customOptions: OwlOptions = {
    loop: false,
    autoplay: false,
    center: false,
    dots: false,
    mouseDrag: true,
    margin: 24,
    navText: [
      '<img src="assets/images/homepage/purple arrow right.svg" alt="Previous" width="42" height="42">',
      '<img src="assets/images/homepage/purple arrow right.svg" alt="Next" width="42" height="42">',
    ],
    autoWidth: true,
    responsive: {
      0: { items: 2, nav: true },
      768: { items: 2, nav: true },
      1200: { items: 6 },
      1440: { items: 7 },
    },
  };

  onImageError(slide: any) {
  slide.imageError = true;
}

  trackById(index: number, item: any): string {
    return item?.id || index;
  }

}
