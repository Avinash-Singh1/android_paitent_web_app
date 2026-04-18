import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { MapGeocoder } from '@angular/google-maps';

@Component({
  standalone: false,
  selector: "nectar-google-maps",
  templateUrl: "./google-maps.component.html",
  styleUrls: ["./google-maps.component.scss"],
})
export class GoogleMapsComponent implements OnInit {
  @Input() lat: number = 28.6448;
  @Input() lng: number = 77.216721;
  @Input() zoom: number = 10;
  @Input() markerDragable: boolean = true;
  @Output() mapClicked = new EventEmitter();
  @Output() markerDrag = new EventEmitter();

  center: google.maps.LatLngLiteral;
  options: google.maps.MapOptions = {
    mapTypeId: 'roadmap',
    restriction: {
      latLngBounds: {
        north: 37.09,
        south: 7.798,
        east: 97.34466,
        west: 68.14712,
      },
      strictBounds: true,
    },
  };

  constructor(private mapGeocoder: MapGeocoder) { }

  ngOnInit(): void {
    this.center = { lat: this.lat, lng: this.lng };
  }

  onMapClick(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      this.mapGeocoder.geocode({ location: event.latLng }).subscribe({
        next: (response) => {
          if (response.status === 'OK' && response.results.length > 0) {
            const placeId = response.results[0].place_id;
            this.mapClicked.emit({
              place_id: placeId,
              location: {
                coordinates: [event.latLng.lng(), event.latLng.lat()],
              },
            });
          } else {
            console.error('Geocoder failed:', response.status);
          }
        },
        error: (error) => {
          console.error('Geocoder error:', error);
        }
      });
    }
  }

  onMarkerDragEnd(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      this.mapGeocoder.geocode({ location: event.latLng }).subscribe({
        next: (response) => {
          if (response.status === 'OK' && response.results.length > 0) {
            const placeId = response.results[0].place_id;
            this.markerDrag.emit({
              place_id: placeId,
              location: {
                coordinates: [event.latLng.lng(), event.latLng.lat()],
              },
            });
          } else {
            console.error('Geocoder failed:', response.status);
          }
        },
        error: (error) => {
          console.error('Geocoder error:', error);
        }
      });
    }
  }
}
