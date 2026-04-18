/**
 * Medicine Type Definitions
 * Type-safe models for medicine module
 */

export interface MedicineImage {
  url: string;
  alt?: string;
  isPrimary: boolean;
}

export interface MedicinePrice {
  mrp: number;
  sellingPrice: number;
  discount: number;
  final_price?: number;  // Legacy alias for sellingPrice
}

export interface MedicineManufacturer {
  name: string;
  url?: string;
}

export interface MedicineStock {
  inStock: boolean;
  quantity: number;
}

export interface MedicineUses {
  main: string[];
  others: string[];
}

export interface MedicineIngredient {
  name: string;
  quantity?: string;
}

export interface MedicineRating {
  average: number;
  count: number;
}

export interface MedicineSEO {
  metaTitle?: string;
  metaDescription?: string;
  keywords: string[];
}

export interface MedicinePrescription {
  required: boolean;
}

export type MedicineType = 'Allopathy' | 'Ayurveda' | 'Homeopathy' | 'General' | 'OTC';

export interface Medicine {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  categoryId: string | MedicineCategory;
  manufacturer?: MedicineManufacturer;
  price: MedicinePrice;
  images: MedicineImage[];
  form?: string;
  prescription: MedicinePrescription;
  stock: MedicineStock;
  medicineType: MedicineType;
  uses: MedicineUses;
  sideEffects: string[];
  ingredients: MedicineIngredient[];
  dosage?: string;
  packSize?: string;
  rating: MedicineRating;
  tags: string[];
  seo?: MedicineSEO;
  isPopular: boolean;
  isFeatured: boolean;
  isActive: boolean;
  isDeleted: boolean;
  viewCount: number;
  expiryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  relatedMedicines?: Medicine[];
  
  // Legacy compatibility properties (for old templates)
  product_id?: string;  // alias for _id
  image?: string;  // alias for images[0].url
  images_hsh?: { array: string[] };  // alias for images
  otc_type?: string;  // alias for medicineType
  in_stock?: boolean;  // alias for stock.inStock
  mrp?: number;  // alias for price.mrp
  final_price?: number;  // alias for price.sellingPrice
  offers?: Array<{ mrp: number; final_price: number }>;  // legacy format
  add_to_cart_url?: string;  // legacy URL
  product_url?: string;  // MyUpchar product page URL
}

export interface MedicineCategory {
  _id: string;
  name: string;
  nameHindi?: string;
  slug: string;
  description?: string;
  image?: {
    url: string;
    alt?: string;
  };
  icon?: string;
  parentCategoryId?: string | MedicineCategory;
  order: number;
  isActive: boolean;
  isDeleted: boolean;
  containerClass?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Legacy compatibility properties
  category_id?: number;  // alias for _id
  name_en?: string;  // alias for name
  children?: MedicineCategory[];  // subcategories
}

export interface MedicineSearchParams {
  search?: string;
  categoryId?: string;
  medicineType?: MedicineType;
  isPopular?: boolean;
  isFeatured?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'price.sellingPrice' | 'rating.average' | 'viewCount' | 'createdAt';
  sortOrder?: 1 | -1;
}

export interface MedicineSearchResponse {
  medicines: Medicine[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AutocompleteSuggestion {
  id: string;
  name: string;
  slug: string;
  price: number;
  image?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  status_code: number;
  message?: string;
  result: T;
  time?: number;
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
}

// Cart and Wishlist types
export interface CartItem {
  medicineId: string;
  medicine: Medicine;
  quantity: number;
  addedAt: Date;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  discount: number;
  finalAmount: number;
}

export interface WishlistItem {
  medicineId: string;
  medicine: Medicine;
  addedAt: Date;
}

export interface Wishlist {
  items: WishlistItem[];
  totalItems: number;
}

// Filter state
export interface MedicineFilter {
  categoryIds: string[];
  medicineTypes: MedicineType[];
  priceRange: {
    min: number;
    max: number;
  };
  inStock: boolean;
  prescriptionRequired?: boolean;
}
