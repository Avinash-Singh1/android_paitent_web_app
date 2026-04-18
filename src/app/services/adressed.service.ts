import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdressedService {
  constructor(private http: HttpClient) { }

  private getdata ='https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/countries%2Bstates%2Bcities.json '


  getviewdata(): Observable<any> {
    return this.http.get<any>(this.getdata);
  }

// this is the paste our component.ts 
// <div>
//     <label for="country">Country:</label>
//     <select id="country" [(ngModel)]="selectedCountry" (change)="onCountryChange()">
//       <option *ngFor="let country of countries" [ngValue]="country">{{ country.name }}</option>
//     </select>
//   </div>
  
//   <div>
//     <label for="state">State:</label>
//     <select id="state" [(ngModel)]="selectedState" (change)="onStateChange()">
//       <option *ngFor="let state of states" [ngValue]="state">{{ state.name }}</option>
//     </select>
//   </div>
  
//   <div>
//     <label for="city">City:</label>
//     <select id="city" [(ngModel)]="selectedCity">
//       <option *ngFor="let city of cities" [ngValue]="city">{{ city.name }}</option>
//     </select>
//   </div>

// countries: any[] = [];
// states: any[] = [];
// cities: any[] = [];
// selectedCountry: any;
// selectedState: any;
// selectedCity: null;
// ngoninit
// this.adressservies.getviewdata().subscribe(data => {
//   this.countries = data;
// });



// onCountryChange() {
//   if (this.selectedCountry) {
//     this.states = this.selectedCountry.states;
//     this.cities = [];
//     this.selectedState = null;
//     this.selectedCity = null; // Reset selected city
//   } else {
//     this.states = [];
//     this.cities = [];
//     this.selectedCity = null; // Reset selected city
//   }
// }

// onStateChange() {
//   if (this.selectedState) {
//     this.cities = this.selectedState.cities;
//     this.selectedCity = null; // Reset selected city
//   } else {
//     this.cities = [];
//     this.selectedCity = null; // Reset selected city
//   }
// }
}
