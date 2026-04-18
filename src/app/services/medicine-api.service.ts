import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  Medicine,
  MedicineCategory,
  MedicineSearchParams,
  MedicineSearchResponse,
  ApiResponse,
  ApiError,
} from '../models/medicine.model';

@Injectable({
  providedIn: 'root',
})
export class MedicineApiService {
  private readonly apiUrl = `${environment.baseUrl}v1/medicine`;

  constructor(private http: HttpClient) {}

  /**
   * Transform medicine to include legacy properties for backward compatibility
   */
  private transformMedicine(medicine: Medicine): Medicine {
    return {
      ...medicine,
      product_id: medicine._id,
      image: medicine.images?.[0]?.url,
      images_hsh: { array: medicine.images?.map(img => img.url) || [] },
      otc_type: medicine.medicineType,
      in_stock: medicine.stock?.inStock,
      mrp: medicine.price?.mrp,
      final_price: medicine.price?.sellingPrice,
      offers: medicine.price ? [{
        mrp: medicine.price.mrp,
        final_price: medicine.price.sellingPrice
      }] : [],
      add_to_cart_url: medicine.add_to_cart_url || medicine.product_url || `/medicines/details/${medicine.slug}`,
      price: {
        ...medicine.price,
        final_price: medicine.price?.sellingPrice
      }
    };
  }

  /**
   * Transform category to include legacy properties
   */
  private transformCategory(category: MedicineCategory): MedicineCategory {
    return {
      ...category,
      category_id: parseInt(category._id, 16) || 0,
      name_en: category.name,
      children: []
    };
  }

  /**
   * Get all medicine categories
   */
  getAllCategories(): Observable<MedicineCategory[]> {
    return this.http
      .get<ApiResponse<MedicineCategory[]>>(`${this.apiUrl}/categories`)
      .pipe(
        map((response) => response.result.map(cat => this.transformCategory(cat))),
        catchError(this.handleError)
      );
  }

  /**
   * Get category by slug or ID
   */
  getCategoryBySlugOrId(identifier: string): Observable<MedicineCategory> {
    return this.http
      .get<ApiResponse<MedicineCategory>>(
        `${this.apiUrl}/categories/${identifier}`
      )
      .pipe(
        map((response) => response.result),
        catchError(this.handleError)
      );
  }

  /**
   * Search medicines with filters and pagination
   */
  searchMedicines(
    params: MedicineSearchParams
  ): Observable<MedicineSearchResponse> {
    let httpParams = new HttpParams();

    // Build query parameters
    Object.keys(params).forEach((key) => {
      const value = params[key as keyof MedicineSearchParams];
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });

    return this.http
      .get<ApiResponse<MedicineSearchResponse>>(
        `${this.apiUrl}/search`,
        { params: httpParams }
      )
      .pipe(
        map((response) => ({
          ...response.result,
          medicines: response.result.medicines.map(m => this.transformMedicine(m))
        })),
        catchError(this.handleError)
      );
  }

  /**
   * Get medicine by slug or ID with related medicines
   */
  getMedicineBySlugOrId(identifier: string): Observable<Medicine> {
    return this.http
      .get<ApiResponse<Medicine>>(`${this.apiUrl}/${identifier}`)
      .pipe(
        map((response) => this.transformMedicine(response.result)),
        catchError(this.handleError)
      );
  }

  /**
   * Get autocomplete suggestions for search
   */
  getAutocompleteSuggestions(
    searchTerm: string,
    limit: number = 10
  ): Observable<Medicine[]> {
    const params = new HttpParams()
      .set('q', searchTerm)
      .set('limit', limit.toString());

    return this.http
      .get<ApiResponse<Medicine[]>>(
        `${this.apiUrl}/autocomplete`,
        { params }
      )
      .pipe(
        map((response) => response.result.map(m => this.transformMedicine(m))),
        catchError(this.handleError)
      );
  }

  /**
   * Get popular medicines
   */
  getPopularMedicines(limit: number = 20): Observable<Medicine[]> {
    const params = new HttpParams().set('limit', limit.toString());

    return this.http
      .get<ApiResponse<Medicine[]>>(`${this.apiUrl}/popular`, { params })
      .pipe(
        map((response) => response.result.map(m => this.transformMedicine(m))),
        catchError(this.handleError)
      );
  }

  /**
   * Get featured medicines
   */
  getFeaturedMedicines(limit: number = 10): Observable<Medicine[]> {
    const params = new HttpParams().set('limit', limit.toString());

    return this.http
      .get<ApiResponse<Medicine[]>>(`${this.apiUrl}/featured`, { params })
      .pipe(
        map((response) => response.result.map(m => this.transformMedicine(m))),
        catchError(this.handleError)
      );
  }

  /**
   * Get medicines by category
   */
  getMedicinesByCategory(
    categoryId: string,
    page: number = 1,
    limit: number = 20
  ): Observable<MedicineSearchResponse> {
    return this.searchMedicines({
      categoryId,
      page,
      limit,
    });
  }

  /**
   * Get medicines by type (Ayurveda, Allopathy, etc.)
   */
  getMedicinesByType(
    medicineType: string,
    page: number = 1,
    limit: number = 20
  ): Observable<MedicineSearchResponse> {
    return this.searchMedicines({
      medicineType: medicineType as any,
      page,
      limit,
    });
  }

  /**
   * Error handler with user-friendly messages
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unexpected error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Network error: ${error.error.message}`;
    } else {
      // Backend error
      switch (error.status) {
        case 0:
          errorMessage = 'Unable to connect to the server. Please check your internet connection.';
          break;
        case 400:
          errorMessage = 'Invalid request. Please check your input.';
          break;
        case 404:
          errorMessage = 'The requested resource was not found.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = error.error?.message || `Server returned code ${error.status}`;
      }
    }

    console.error('Medicine API Error:', {
      status: error.status,
      message: errorMessage,
      error: error.error,
    });

    return throwError(() => new Error(errorMessage));
  }
}
