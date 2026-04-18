import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { LocalStorageService } from "../services/storage.service";
import { ROUTE_CONSTANT } from "../config/route.constant";
import { APP_CONSTANTS } from "../config/app.constant";

@Injectable({
  providedIn: "root",
})
export class UserGuard  {
  constructor(
    private localStorage: LocalStorageService,
    private router: Router
  ) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const routes = {
      2: ROUTE_CONSTANT.DOCTOR.dashboard,
      3: ROUTE_CONSTANT.HOSPITAL.dashboard,
    };
    const isLogged = this.localStorage.getItem("isLogged");
    const userType = this.localStorage.getItem("userType");
    const viewDoctorProfileFlag=this.localStorage.getItem("viewDoctorProfileFlag");
    const approvalStatus = this.localStorage.getItem("approvalStatus");
    return isLogged &&
      userType != APP_CONSTANTS.USER_TYPES.PATIENT &&
      approvalStatus == APP_CONSTANTS.PROFILE_STATUS.APPROVE 
      ?  viewDoctorProfileFlag=='1' ? true : this.router.navigate([routes[userType]])
      : true;
    // return isLogged &&
    //   userType != APP_CONSTANTS.USER_TYPES.PATIENT &&
    //   approvalStatus == APP_CONSTANTS.PROFILE_STATUS.APPROVE
    //   ? this.router.navigate([routes[userType]])
    //   : true;
  }
}
