import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-treatment-reviews',
  templateUrl: './treatment-reviews.component.html',
  styleUrls: ['./treatment-reviews.component.scss']
})
export class TreatmentReviewsComponent {
  @Input() reviews: any[] = [];
  @Input() treatmentTitle: string = '';
  @Input() city: string = '';

  get cityLabel(): string {
    if (!this.city) return '';
    return this.city.charAt(0).toUpperCase() + this.city.slice(1).replace(/-/g, ' ');
  }

  get avgRating(): string {
    if (!this.reviews?.length) return '4.8';
    const sum = this.reviews.reduce((a: number, r: any) => a + (r.rating || 4.5), 0);
    return (sum / this.reviews.length).toFixed(1);
  }

  get recommendCount(): number {
    return this.reviews?.filter((r: any) => r.rating >= 4).length || 0;
  }

  getInitials(name: string): string {
    if (!name) return '';
    const parts = name.split(' ');
    return parts.map((p: string) => p.charAt(0).toUpperCase()).slice(0, 2).join('');
  }

  getStars(rating: number): number[] {
    return Array(Math.round(rating || 5)).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    return Array(5 - Math.round(rating || 5)).fill(0);
  }
}
