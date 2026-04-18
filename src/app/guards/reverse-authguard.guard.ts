import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { LocalStorageService } from "../services/storage.service";
import { ROUTE_CONSTANT } from "../config/route.constant";

@Injectable({
  providedIn: "root",
})
export class ReverseAuthguardGuard  {
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
      1: ROUTE_CONSTANT.AUTH.home,
      2: ROUTE_CONSTANT.DOCTOR.dashboard,
      3: ROUTE_CONSTANT.HOSPITAL.dashboard,
    };
    const isLogged = this.localStorage.getItem("isLogged");
    const userType = this.localStorage.getItem("userType");

    if (!isLogged) {
      return true;
    } else {
      return this.router.navigate([routes[userType]]);
    }
  }
}
