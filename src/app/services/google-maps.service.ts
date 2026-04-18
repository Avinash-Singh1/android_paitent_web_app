import { Inject, inject, Injectable, PLATFORM_ID, DOCUMENT } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { LocalStorageService } from "./storage.service";
import { GoogleMapsModule, MapGeocoder, MapGeocoderResponse } from "@angular/google-maps";
import { environment } from "src/environments/environment";
import { Observable, catchError, map, of } from "rxjs";
import { HttpClient } from "@angular/common/http";


@Injectable({
  providedIn: "root",
})
export class GoogleMapsService {
  placeService: any;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor(
    private localStorage: LocalStorageService,
    private mapGeocoder: MapGeocoder,
    private http: HttpClient,
    @Inject(DOCUMENT) private _document: Document
  ) {
    // if (true) {
    //   this.getLocation({
    //     address: "H-47-48, Shaheed Arjun Sardana Marg, near Kailash Hospital Sector 27 Noida, H Block, Pocket H, Sector 27, Noida, Uttar Pradesh 201301",
    //   });
    // }
  }

  getCurrentCityObs(): Observable<string | null> {
    return new Observable<string | null>((observer) => {
      if (!this.isBrowser) {
        observer.error('Not in browser');
        return;
      }
      if (navigator.geolocation || 'geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            this.reverseGeocode(latitude, longitude).subscribe(
              (city) => {
                observer.next(city);
                observer.complete();
              },
              (error) => {
                observer.error(error);
              }
            );
          },
          (error) => {
            observer.error(error);
          }
        );
      } else {
        observer.error("Geolocation is not available in this browser.");
      }
    });
  }

  private reverseGeocode(
    latitude: number,
    longitude: number
  ): Observable<string | null> {
    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${environment.GOOGLE_API_KEY}`;

    return this.http.get<any>(geocodingUrl).pipe(
      map((data) => {
        const results = data.results;
        if (results.length > 0) {
          const addressComponents = results[0].address_components;
          let city = null;
          for (const component of addressComponents) {
            if (component.types.includes("locality")) {
              city = component.long_name;
              break;
            }
          }
          return city;
        }
        return null;
      }),
      catchError((error) => {
        return of(null);
      })
    );
  }

  /**
   * Silently detect user's city via IP geolocation (no browser permission needed).
   * Uses ip-api.com first (higher rate limit); falls back to ipapi.co.
   * Caches result in localStorage for 24 hours to avoid repeated API calls.
   */
  detectCityByIP(): Promise<string> {
    // Return cached result if fresh (< 24 hours)
    const cached = this.localStorage.getItem('ip_city_cache');
    if (cached) {
      try {
        const { city, ts } = JSON.parse(cached);
        if (city && ts && (Date.now() - ts) < 86400000) {
          return Promise.resolve(city);
        }
      } catch { /* ignore corrupt cache */ }
    }

    return this.http.get<any>('http://ip-api.com/json/?fields=city,lat,lon,country').toPromise()
      .then((data: any) => {
        if (data?.city) {
          if (data.lat && data.lon) {
            this.localStorage.setItem('coordinates', JSON.stringify([data.lon, data.lat]));
          }
          if (data.country) {
            this.localStorage.setItem('country', data.country);
          }
          this.localStorage.setItem('ip_city_cache', JSON.stringify({ city: data.city, ts: Date.now() }));
          return data.city as string;
        }
        throw new Error('No city in IP response');
      })
      .catch(() => {
        // Fallback to ipapi.co
        return this.http.get<any>('https://ipapi.co/json/').toPromise().then((data: any) => {
          if (data?.city) {
            if (data.latitude && data.longitude) {
              this.localStorage.setItem('coordinates', JSON.stringify([data.longitude, data.latitude]));
            }
            if (data.country_name) {
              this.localStorage.setItem('country', data.country_name);
            }
            this.localStorage.setItem('ip_city_cache', JSON.stringify({ city: data.city, ts: Date.now() }));
            return data.city as string;
          }
          throw new Error('No city in fallback IP response');
        });
      });
  }

  getCurrentCity(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.isBrowser) {
        reject('Not in browser');
        return;
      }
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const latlng = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            this.localStorage.setItem(
              "coordinates",
              JSON.stringify([
                position.coords.longitude,
                position.coords.latitude,
              ])
            );
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: latlng }, (results, status) => {
              if (status === google.maps.GeocoderStatus.OK && results && results.length) {
                const countryComponent = results[0].address_components.find(
                  (item) => item.types.includes("country")
                );
                if (countryComponent) {
                  this.localStorage.setItem(
                    "country",
                    countryComponent.long_name
                  );
                }
                const cityComponent = results[0].address_components.find(
                  (item) => item.types.includes("locality")
                );
                if (cityComponent) {
                  resolve(cityComponent.long_name);
                } else {
                  reject("Unable to determine current city.");
                }
              } else {
                reject("Geocoder failed: " + status);
              }
            });
          },
          (error) => {
            reject("Geolocation error: " + error.message);
          }
        );
      } else {
        reject("Geolocation is not supported by this browser.");
      }
    });
  }

  redirectToGoogleMaps(lat: number, lng: number) {
    if (!this.isBrowser) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(url, '_blank');
  }

  getPredication(search: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const autocompleteService = new google.maps.places.AutocompleteService();
      autocompleteService.getPlacePredictions(
        {
          input: search,
          componentRestrictions: { country: 'in' },
        },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            resolve(predictions);
          } else {
            reject([]);
          }
        }
      );
    });
  }

  getAddressComponents(placeId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.mapGeocoder.geocode({ placeId }).subscribe((response: MapGeocoderResponse) => {
        if (response.status) {
          resolve(response.results[0]);
        } else {
          reject(response.status);
        }
      });
    });
  }

  getLocation(payload: google.maps.GeocoderRequest) {
    return new Promise((resolve, reject) => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode(payload, (results, status) => {
        if (status == google.maps.GeocoderStatus.OK) {
          resolve(results);
        } else {
          reject(status);
        }
      });
    });
  }

  getLandmark(query: string) {
    return new Promise((resolve, reject) => {
      const placeService = new google.maps.places.PlacesService(
        this._document.createElement("div")
      );
      placeService.textSearch({ query }, (results, status) => {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          resolve(results);
        } else {
          reject(status);
        }
      });
    });
  }
}
