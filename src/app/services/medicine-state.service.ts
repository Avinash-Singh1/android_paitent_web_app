import { Inject, Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  Medicine,
  Cart,
  CartItem,
  Wishlist,
  WishlistItem,
} from '../models/medicine.model';

@Injectable({
  providedIn: 'root',
})
export class MedicineStateService {
  // Cart state
  private cartSubject = new BehaviorSubject<Cart>(this.getInitialCart());
  public cart$: Observable<Cart> = this.cartSubject.asObservable();

  // Wishlist state
  private wishlistSubject = new BehaviorSubject<Wishlist>(
    this.getInitialWishlist()
  );
  public wishlist$: Observable<Wishlist> = this.wishlistSubject.asObservable();

  // Loading states
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$: Observable<boolean> = this.loadingSubject.asObservable();

  // Error state
  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$: Observable<string | null> = this.errorSubject.asObservable();

  private readonly CART_STORAGE_KEY = 'nectar_medicine_cart';
  private readonly WISHLIST_STORAGE_KEY = 'nectar_medicine_wishlist';
  private readonly isBrowser: boolean;

  constructor() {
    this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    if (this.isBrowser) {
      this.loadCartFromStorage();
      this.loadWishlistFromStorage();
    }
  }

  // ==================== CART METHODS ====================

  /**
   * Add item to cart
   */
  addToCart(medicine: Medicine, quantity: number = 1): void {
    const currentCart = this.cartSubject.value;
    const existingItemIndex = currentCart.items.findIndex(
      (item) => item.medicineId === medicine._id
    );

    if (existingItemIndex > -1) {
      // Update quantity if item already exists
      currentCart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      const newItem: CartItem = {
        medicineId: medicine._id,
        medicine,
        quantity,
        addedAt: new Date(),
      };
      currentCart.items.push(newItem);
    }

    this.updateCart(currentCart);
  }

  /**
   * Remove item from cart
   */
  removeFromCart(medicineId: string): void {
    const currentCart = this.cartSubject.value;
    currentCart.items = currentCart.items.filter(
      (item) => item.medicineId !== medicineId
    );
    this.updateCart(currentCart);
  }

  /**
   * Update cart item quantity
   */
  updateCartItemQuantity(medicineId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(medicineId);
      return;
    }

    const currentCart = this.cartSubject.value;
    const itemIndex = currentCart.items.findIndex(
      (item) => item.medicineId === medicineId
    );

    if (itemIndex > -1) {
      currentCart.items[itemIndex].quantity = quantity;
      this.updateCart(currentCart);
    }
  }

  /**
   * Update quantity (alias for updateCartItemQuantity)
   */
  updateQuantity(medicineId: string, quantity: number): void {
    this.updateCartItemQuantity(medicineId, quantity);
  }

  /**
   * Clear entire cart
   */
  clearCart(): void {
    this.updateCart(this.getInitialCart());
  }

  /**
   * Get cart item count
   */
  getCartItemCount(): number {
    return this.cartSubject.value.totalItems;
  }

  /**
   * Check if medicine is in cart
   */
  isInCart(medicineId: string): boolean {
    return this.cartSubject.value.items.some(
      (item) => item.medicineId === medicineId
    );
  }

  // ==================== WISHLIST METHODS ====================

  /**
   * Add item to wishlist
   */
  addToWishlist(medicine: Medicine): void {
    const currentWishlist = this.wishlistSubject.value;

    // Check if already in wishlist
    const exists = currentWishlist.items.some(
      (item) => item.medicineId === medicine._id
    );

    if (!exists) {
      const newItem: WishlistItem = {
        medicineId: medicine._id,
        medicine,
        addedAt: new Date(),
      };
      currentWishlist.items.push(newItem);
      this.updateWishlist(currentWishlist);
    }
  }

  /**
   * Remove item from wishlist
   */
  removeFromWishlist(medicineId: string): void {
    const currentWishlist = this.wishlistSubject.value;
    currentWishlist.items = currentWishlist.items.filter(
      (item) => item.medicineId !== medicineId
    );
    this.updateWishlist(currentWishlist);
  }

  /**
   * Toggle wishlist item
   */
  toggleWishlist(medicine: Medicine): void {
    if (this.isInWishlist(medicine._id)) {
      this.removeFromWishlist(medicine._id);
    } else {
      this.addToWishlist(medicine);
    }
  }

  /**
   * Clear entire wishlist
   */
  clearWishlist(): void {
    this.updateWishlist(this.getInitialWishlist());
  }

  /**
   * Get wishlist item count
   */
  getWishlistItemCount(): number {
    return this.wishlistSubject.value.totalItems;
  }

  /**
   * Check if medicine is in wishlist
   */
  isInWishlist(medicineId: string): boolean {
    return this.wishlistSubject.value.items.some(
      (item) => item.medicineId === medicineId
    );
  }

  // ==================== LOADING & ERROR STATES ====================

  /**
   * Set loading state
   */
  setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  /**
   * Set error message
   */
  setError(error: string | null): void {
    this.errorSubject.next(error);
  }

  /**
   * Clear error
   */
  clearError(): void {
    this.errorSubject.next(null);
  }

  // ==================== PRIVATE HELPER METHODS ====================

  private updateCart(cart: Cart): void {
    // Recalculate totals
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalAmount = cart.items.reduce(
      (sum, item) => sum + item.medicine.price.sellingPrice * item.quantity,
      0
    );
    cart.discount = cart.items.reduce(
      (sum, item) =>
        sum +
        (item.medicine.price.mrp - item.medicine.price.sellingPrice) *
          item.quantity,
      0
    );
    cart.finalAmount = cart.totalAmount;

    this.cartSubject.next(cart);
    this.saveCartToStorage(cart);
  }

  private updateWishlist(wishlist: Wishlist): void {
    wishlist.totalItems = wishlist.items.length;
    this.wishlistSubject.next(wishlist);
    this.saveWishlistToStorage(wishlist);
  }

  private getInitialCart(): Cart {
    return {
      items: [],
      totalItems: 0,
      totalAmount: 0,
      discount: 0,
      finalAmount: 0,
    };
  }

  private getInitialWishlist(): Wishlist {
    return {
      items: [],
      totalItems: 0,
    };
  }

  private saveCartToStorage(cart: Cart): void {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }

  private saveWishlistToStorage(wishlist: Wishlist): void {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(
        this.WISHLIST_STORAGE_KEY,
        JSON.stringify(wishlist)
      );
    } catch (error) {
      console.error('Failed to save wishlist to localStorage:', error);
    }
  }

  private loadCartFromStorage(): void {
    if (!this.isBrowser) return;
    try {
      const cartData = localStorage.getItem(this.CART_STORAGE_KEY);
      if (cartData) {
        const cart: Cart = JSON.parse(cartData);
        // Convert ISO date strings back to Date objects
        cart.items.forEach((item) => {
          item.addedAt = new Date(item.addedAt);
        });
        this.cartSubject.next(cart);
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
    }
  }

  private loadWishlistFromStorage(): void {
    if (!this.isBrowser) return;
    try {
      const wishlistData = localStorage.getItem(this.WISHLIST_STORAGE_KEY);
      if (wishlistData) {
        const wishlist: Wishlist = JSON.parse(wishlistData);
        // Convert ISO date strings back to Date objects
        wishlist.items.forEach((item) => {
          item.addedAt = new Date(item.addedAt);
        });
        this.wishlistSubject.next(wishlist);
      }
    } catch (error) {
      console.error('Failed to load wishlist from localStorage:', error);
    }
  }
}
