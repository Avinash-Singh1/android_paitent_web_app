import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { LocalStorageService } from "../services/storage.service";
import { APP_CONSTANTS } from "../config/app.constant";

@Injectable({
  providedIn: "root",
})
export class AuthGuard  {
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
    const isLogged = this.localStorage.getItem("isLogged");
    const userType = route.data["userType"];
    const localUserType = this.localStorage.getItem("userType");
    //const approvalStatus = this.localStorage.getItem("approvalStatus");
    if (
      isLogged &&
      localUserType == userType
      //&& (approvalStatus == APP_CONSTANTS.PROFILE_STATUS.APPROVE || approvalStatus == APP_CONSTANTS.PROFILE_STATUS.PENDING)
    ) {
      return true;
    } else {
      return this.redirection(route?.queryParams);
    }
  }
  redirection(obj: any) {
    if (obj.isEmail && obj.user) {
      return this.router.navigate([`/auth/${obj.user}/login`], {
        queryParams: obj,
        queryParamsHandling: "merge",
      });
    } else {
      return this.router.navigate(["/"]);
    }
  }
}
