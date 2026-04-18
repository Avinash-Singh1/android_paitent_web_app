import { Inject, Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MyupcharService {
  private wishlist: any[] = [];
  catagroy = new Subject();
  private readonly isBrowser: boolean;

  private readonly apiKey = environment.MYUPCHAR_API_KEY;
  private readonly baseUrl = environment.MYUPCHAR_BASE_URL;

  private get getdata() { return `${this.baseUrl}/search?api_key=${this.apiKey}&page=289`; }
  private get categaryapi() { return `${this.baseUrl}/get_categories?api_key=${this.apiKey}`; }
  private get serchapi() { return `${this.baseUrl}/search?api_key=${this.apiKey}&category_id=`; }
  private get productapi() { return `${this.baseUrl}/search?api_key=${this.apiKey}&page=1&category_id=`; }
  private get singleProduct() { return `${this.baseUrl}/detail?api_key=${this.apiKey}&product_id=`; }
  constructor(
    private http: HttpClient,
  ) {
    this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  }
  getviewdata(): Observable<any> {
    return this.http.get<any>(this.getdata);
  }
  getcategy(): Observable<any> {
    return this.http.get<any>(this.categaryapi);
  }
  Seachapi(id: string | number): Observable<any> {
    return this.http.get<any>(this.serchapi + `${id}`);
  }
  getProducts(id: any): Observable<any> {
    return this.http.get<any>(this.productapi + `${id}`);
  }
  getSingleProduct(id: any): Observable<any> {
    return this.http.get<any>(this.singleProduct + `${id}`);
  }

  private medicinedata = new BehaviorSubject<any[]>([]);
  medicinedata$ = this.medicinedata.asObservable();

  setMedicinedata(data: any[]) {
    this.medicinedata.next(data);
  }

  loadWishlist(): void {
    if (!this.isBrowser) return;
    try {
      const storedWishlist = localStorage.getItem('wishlist');
      if (storedWishlist) {
        this.wishlist = JSON.parse(storedWishlist) || [];
      }
    } catch (error) {
      console.error('Failed to load wishlist from local storage', error);
      this.wishlist = [];
    }
  }

  getWishlist(): any[] {
    return this.wishlist;
  }

  addToWishlist(product: any) {
    const exists = this.wishlist.find(item => item.id === product.id);
    if (!exists) {
      this.wishlist.push(product);
      this.updateLocalStorage();
    }
  }

  removeFromWishlist(productId: any) {
    this.wishlist = this.wishlist.filter(item => item.id !== productId);
    this.updateLocalStorage();
  }

  private updateLocalStorage() {
    if (!this.isBrowser) return;
    localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
  }

  generateSitemap(categoryId: any): Observable<string> {
    return this.getProducts(categoryId).pipe(
      map((data: any) => {
        // Assuming data contains an array of products
        const products = data.products || [];
        const baseUrl = `${environment.baseUrl}medicines/all-medicines/`;

        // Start the XML structure
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

        products.forEach((product: any) => {
          const productUrl = `${baseUrl}${product.product_id}`;
          xml += `  <url>\n`;
          xml += `    <loc>${productUrl}</loc>\n`;
          xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
          xml += `    <changefreq>monthly</changefreq>\n`;
          xml += `    <priority>0.8</priority>\n`;
          xml += `  </url>\n`;
        });

        // Close the XML structure
        xml += `</urlset>`;

        return xml;
      })
    );
  }

}