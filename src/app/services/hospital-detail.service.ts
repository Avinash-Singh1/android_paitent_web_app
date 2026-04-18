import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HospitalDetailService {
  private hospitalDetailSubject = new BehaviorSubject<any>(null);
  private hospitalURLSubject = new BehaviorSubject<any[]>([]);

  hospitalDetail$ = this.hospitalDetailSubject.asObservable();
  hospitalURLs$ = this.hospitalURLSubject.asObservable();

  setHospitalDetail(detail: any) {
    this.hospitalDetailSubject.next(detail);
  }

  setHospitalURLs(urls: any[]) {
    this.hospitalURLSubject.next(urls);
  }
}
