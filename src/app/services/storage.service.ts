import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { CryptoProvider } from "./crypto.service";

@Injectable({
  providedIn: "root",
})
export class LocalStorageService {
  private langUpdated = new Subject<string>();

  constructor(private crypto: CryptoProvider) { }

  private isLocalStorageAvailable(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  setItem(key: string, value: unknown): void {
    if (this.isLocalStorageAvailable()) {
      const encStoreInfo = this.crypto.encryptObj(value);
      localStorage.setItem(key, encStoreInfo);
    }
  }



  
  removeItem(key: string): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.removeItem(key);
    }
  }

  removeAllItem(): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.clear();
    }
  }

  getItem(key: string): any {
    try {
      if (this.isLocalStorageAvailable()) {
        let localStorageInfo: any;
        const encStoreInfo = localStorage.getItem(key);
        if (encStoreInfo) {
          localStorageInfo = this.crypto.decryptObj(localStorage.getItem(key));
        }
        return localStorageInfo;
      } else {
        return null;
      }
    } catch (err) {
      return "";
    }
  }

  removeItems(keyArray: string[]): void {
    if (this.isLocalStorageAvailable()) {
      keyArray.forEach((key: string) => localStorage.removeItem(key));
    }
  }

  storageclear(): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.clear();
    }
  }

  storeinSession(key: string, data: string): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(key, data);
    }
  }

  getdatafromSession(key: string): string | null {
    if (typeof sessionStorage !== 'undefined') {
      return sessionStorage.getItem(key);
    }
    return null;
  }

  sessionStorageclear(): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }
  }

  getLang(): Observable<string> {
    return this.langUpdated.asObservable();
  }

  setLang() {
    const lang = this.getItem("currentlang");
    this.langUpdated.next(lang ? lang : "en");
  }
}
