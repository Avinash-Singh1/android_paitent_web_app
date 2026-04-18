import { Component, Input,AfterViewInit  } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { API_ENDPOINTS } from "src/app/config/api.constant";
import { CommonService } from 'src/app/services/common.service';
import { Router } from "@angular/router";

@Component({
  standalone: false,
  selector: 'nectar-doctor-procedure-section',
  templateUrl: './doctor-procedure-section.component.html',
  styleUrls: ['./doctor-procedure-section.component.scss'],
})
export class DoctorProcedureSectionComponent implements AfterViewInit{
  @Input() specializations!: any; 
  constructor(
      private http: HttpClient, private commonService: CommonService,
      private router: Router,
    ) { }
    aboutData:any;
    @Input() doc_procedure: any=[];
    @Input() city: any;

  ngOnInit(): void {
      // this.get_All_procedure();
      // console.log("doctor_procedure: ",this.doc_procedure);
  }

  ngAfterViewInit(): void {
    // console.log("specializations: ",this.specializations);
  }

  // get_All_procedure(){
  //   const url = `${API_ENDPOINTS.MASTER.procedure}`;
  //   this.http.get<any>(url).subscribe((res) => {
      
  //     this.aboutData = res.result;
  //     console.log("aboutData: ",this.aboutData);
  //   });
  // }

  showAll: boolean = false;


  navigateToSearch(routeName: string) {
    const formattedRouteName = routeName.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase(); 
    const cityname = this.commonService.replaceSpaceWithHyphen(this.city);
    this.router.navigate([`${cityname}/doctors-for-${formattedRouteName}`]);
  }


}
