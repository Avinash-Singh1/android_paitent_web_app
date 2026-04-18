import { Component, Inject, Input, OnInit, DOCUMENT } from "@angular/core";
import { Router } from "@angular/router";
import { CommonService } from "src/app/services/common.service";


@Component({
  standalone: false,
  selector: 'doctor-surgerdetails-list',
  templateUrl: './doctor-surgerdetails.component.html',
  styleUrls: ['./doctor-surgerdetails.component.scss']
})
export class DoctorSurgerdetailsComponent implements OnInit {

  width: any = 0;
  cardWidth: any = 310;
  @Input() type = 0;
  @Input() id: any = "";
  @Input() city: any = "";
  totalWidth: any = 0;
  rightButton: boolean = true;
  activeSlideIndex: number = 0;
  mydata: any[] = [];
  doctorsCount: number = 0; // Keep track of doctors count
  totalDoctorsindia:number = 0;
  getDoctorslenthindia: number;
  constructor(
    private router: Router,
    private commonService: CommonService,
    @Inject(DOCUMENT) private _document: Document) { }

  ngAfterViewInit(): void {
    let val = this._document.getElementById(this.id);
    if (val) {
      if (val.clientWidth >= val?.scrollWidth) {
        this.rightButton = false;
      }
      this.totalWidth = val?.scrollWidth;
    }
  }

  ngOnInit(): void {
    this.width = this.commonService.gettingWinowWidth();
    if (this.width < 767) {
      this.cardWidth = 260;
    }
    this.id = this.capitalizeFirstLetter(this.id);
    this.city = this.capitalizeFirstLetter(this.city);
  }
  private capitalizeFirstLetter(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
  viewDoctor(str: string) {
    const cityLower = this.city.toLowerCase();
    const idLower = this.id.toLowerCase();
    this.router.navigate([`/${cityLower}/${idLower}`]);
  }

  isActiveRoute(routes: string[]): boolean {
    return routes.some(route => this.router.url.includes(route));
  }

  updateDoctorCount(data: { count: number; getdoctor: number }) {
    this.doctorsCount = data.count;
    this.totalDoctorsindia = data.getdoctor;
}

}

