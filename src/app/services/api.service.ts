import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, catchError, Observable, tap } from "rxjs";
import { LocalStorageService } from "./storage.service";
import { API_ENDPOINTS } from "../config/api.constant";
import { ToastrService } from "ngx-toastr";
import { EventService } from "./event.service";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class ApiService {
  constructor(
    private router: Router,
    private http: HttpClient,
    private localStorage: LocalStorageService,
    private toastr: ToastrService,
    private eventService: EventService
  ) { }
  acceptedFileType = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
  ];
  post(path: string, data: any): Observable<any> {
    return this.http.post(path, data);
  }

  postParams(path: string, body: any, params: any): Observable<any> {
    let param = new HttpParams(params);
    param = param.appendAll(params);
    return this.http.post(path, body, { params: param });
  }

  get(path: string, payload: any): Observable<any> {
    let params = new HttpParams();
    params = params.appendAll(payload);

    return this.http.get(`${path}`, { params: params }).pipe();
  }

  delete(path: string, id: any): Observable<any> {
    return this.http.delete(`${path + "/" + id}`);
  }
  deleteAccount(path: string): Observable<any> {
    return this.http.delete(path);
  }
  put(path: string, data: any): Observable<any> {
    return this.http.put(path, data);
  }

  patch(path: string, data: any): Observable<any> {
    return this.http.patch(path, data);
  }
  patchParams(path: string, data: any, payload: any): Observable<any> {
    let params = new HttpParams();
    params = params.appendAll(payload);
    return this.http.patch(path, data, { params });
  }
  deleteMultiple(path: string, data: any): Observable<any> {
    return this.http.delete(path, {
      params: data,
    });
  }
  getPayload(path: string, payload: any) {
    return this.http.get(path, payload);
  }
  putSetting(path: string, data: any, payload: any): Observable<any> {
    let params = new HttpParams();
    params = params.appendAll(payload);
    return this.http.put(path, data, { params: params });
  }
  deleteSetting(path: string, param: any) {
    let params = new HttpParams();
    params = params.appendAll(param);
    return this.http.delete(path, { params: params });
  }

  logout() {
    this.http.post(API_ENDPOINTS.auth.logout, {}).subscribe((res: any) => {
      this.localStorage.removeAllItem();
      this.router.navigateByUrl("", { replaceUrl: true });
      this.eventService.broadcastEvent("login", false);
    });
  }
  fileUpload(file: File) {
    const formData = new FormData();
    if (!this.acceptedFileType.includes(file.type)) {
      this.toastr.error("Please upload file in pdf, jpeg, jpg or png format");
      throw new Error("wrong file format");
    }
    formData.append("file", file);
    return this.http.post(API_ENDPOINTS.COMMON.fileupload, formData);
  }
  importFile(file: File) {
    if (file.type != "text/csv") {
      this.toastr.error("Please upload file in csv format.");
      return null;
    }
    const formData = new FormData();
    formData.append("file", file);
    return this.http.post(API_ENDPOINTS.COMMON.importDoctor, formData);
  }
  putParams(path: string, payload: any, paramsdata: any) {
    let params = new HttpParams();
    params = params.appendAll(paramsdata);
    return this.http.put(path, payload, { params });
  }
  delteParams(path: string, payload: any) {
    let params = new HttpParams();
    params = params.appendAll(payload);
    return this.http.delete(path, { params });
  }
  saveAndExit(payload: any) {
    this.http.put(API_ENDPOINTS.doctor.updateProfile, payload).subscribe({
      next: (res: any) => {
        this.router.navigate(["/"]);
        const keys = [
          "sectionA",
          "sectionB",
          "sectionC",
          "steps",
          "isEdit",
          "token",
          "userType",
          "isLogged",
        ];
        this.eventService.broadcastEvent("showheader", "normalheader");
        this.eventService.broadcastEvent("footer", "normal");
        this.clearLocalStorage(keys);
      },
      error: (error: any) => {
        // Error handled by interceptor
      },
    });
  }
  clearLocalStorage(keys: string[]) {
    keys.forEach((value: string) => {
      this.localStorage.removeItem(value);
    });
  }
  saveAndExitHospital(payload: any) {
    this.http.put(API_ENDPOINTS.hospital.updateProfile, payload).subscribe({
      next: (res: any) => {
        this.router.navigate(["/"]);
        const keys = [
          "sectionA",
          "sectionB",
          "sectionC",
          "steps",
          "isEdit",
          "token",
          "userType",
          "isLogged",
        ];
        this.eventService.broadcastEvent("showheader", "normalheader");
        this.eventService.broadcastEvent("footer", "normal");
        this.clearLocalStorage(keys);
      },
      error: (error: any) => {
        // Error handled by interceptor
      },
    });
  }

  searchSuggestions(key: string, city?: string) {
    const request = {
      url: API_ENDPOINTS.patient.getSearchSuggestion,
    };
    const params: any = { search: key };
    if (city) { params.city = city; }
    return this.http.get<any>(request.url, { params });
  }

  /** Atlas Search fuzzy autocomplete with highlights */
  searchAutocomplete(q: string, city?: string, limit = 10) {
    const params: any = { q, limit };
    if (city) { params.city = city; }
    return this.http.get<any>(API_ENDPOINTS.patient.searchAutocomplete, { params });
  }

  /** Spell correction / "did you mean" */
  searchDidYouMean(q: string, city?: string) {
    const params: any = { q };
    if (city) { params.city = city; }
    return this.http.get<any>(API_ENDPOINTS.patient.searchDidYouMean, { params });
  }

  /** Related/popular search terms */
  searchRelated(q: string, city?: string, limit = 5) {
    const params: any = { q, limit };
    if (city) { params.city = city; }
    return this.http.get<any>(API_ENDPOINTS.patient.searchRelated, { params });
  }

  /** Dynamic filter counts (facets) */
  searchFacets(q: string, city?: string) {
    const params: any = { q };
    if (city) { params.city = city; }
    return this.http.get<any>(API_ENDPOINTS.patient.searchFacets, { params });
  }

  sitemap() {
    const request = {
      url: API_ENDPOINTS.COMMON.getSitemap,
    };
    return this.http.get<any>(request.url);
  }

  getPopularBlogs() {
    let url = `https://blog.nectarplus.health/wp-json/wordpress-popular-posts/v1/popular-posts?range=last30days&limit=10&_embed=wp:term`;
    return this.http.get<any>(url);
  }

  getCategory(id: any) {
    let url = `https://blog.nectarplus.health/wp-json/wp/v2/categories?post=${id}`;
    return this.http.get<any>(url);
  }

  getCitiesByCountry(country: string): Observable<any> {
    const url = `${environment.COUNTRIES_API_URL}/cities`;
    const body = new HttpParams().set('country', country);
    return this.http.post(url, body.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  }
  getstatesByCountry(state: string): Observable<any> {
    const url = `${environment.COUNTRIES_API_URL}/states`;
    const body = new HttpParams().set('country', state);
    return this.http.post(url, body.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  }

  getNearByHospital(id: any,location:any) {
    const request = {
      url: API_ENDPOINTS.patient.NearHospital,
    };
    return this.http.post<any>(request.url, {
      _id:id,_location:location,  _type: "Point"
    });
  }

  get_CitiesOfDoctors(){
    const request = {
      url: API_ENDPOINTS.patient.getCitiesofDoctors,
    };
    return this.http.get<any>(request.url);
  }

  searchCities(q: string = '', city: string = '') {
    const params: any = {};
    if (q) { params.q = q; }
    if (city) { params.city = city; }
    return this.http.get<any>(API_ENDPOINTS.patient.searchCities, { params });
  }

  /**
   * Geo-based near-me search for doctors.
   * POST /api/v1/patient/search-near-me
   */
  searchNearMe(lat: number, lng: number, query?: string, options: {
    maxDistance?: number; page?: number; size?: number; filters?: any;
  } = {}) {
    return this.http.post<any>(API_ENDPOINTS.patient.searchNearMe, {
      lat, lng, query,
      maxDistance: options.maxDistance || 10000,
      page: options.page || 1,
      size: options.size || 10,
      filters: options.filters || {},
    });
  }

  /**
   * Reverse geocode lat/lng → canonical city.
   * GET /api/v1/city/geo-city?lat=...&lng=...
   */
  geoCityLookup(lat: number, lng: number) {
    return this.http.get<any>(API_ENDPOINTS.patient.geoCity, {
      params: { lat: lat.toString(), lng: lng.toString() },
    });
  }

  /**
   * Resolve any city input to canonical slug.
   * GET /api/v1/city/resolve?city=...
   */
  resolveCity(city: string) {
    return this.http.get<any>(API_ENDPOINTS.patient.resolveCity, {
      params: { city },
    });
  }

  get_CurrentCitySpecialization(_city1: string): Observable<any> {
    const request = {
      url: API_ENDPOINTS.patient.getCurrentCitySpecialization,
    };
    return this.http.post<any>(request.url, {
      city: _city1});
  }

  private _dataSubject = new BehaviorSubject<any | null>(null);
  readonly data$ = this._dataSubject.asObservable();

  private _loadingSubject = new BehaviorSubject<boolean>(false);
  readonly loading$ = this._loadingSubject.asObservable();


  private _errorSubject = new BehaviorSubject<string | null>(null);
  readonly error$ = this._errorSubject.asObservable();

    loadPosts(services: any): void {
      this._loadingSubject.next(true);
      this._errorSubject.next(null);
      this._dataSubject.next(services);
      this._loadingSubject.next(false);
    }

  getservices_based_on_specialization(specialization_name:string): Observable<any> {
    return this.http.post(API_ENDPOINTS.MASTER.getservices, {
      spec: specialization_name
    });
  }


}
         