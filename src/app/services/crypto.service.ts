import { Injectable } from "@angular/core";
import * as CryptoJS from "crypto-js";
import { environment } from "src/environments/environment";

/**  tslint:disable */

/**
 * This file is responsible to manage encrypt decrypt of requested data.
 * @author Prashant Kumar
 */
@Injectable({
  providedIn: "root",
})
export class CryptoProvider {
  /**
   * @property secretKey for
   */
  private secretKey: string;
  /**
   * This is constructor method automatically invoked at the time of class intialization
   * and set the default properties values.
   */
  constructor() {
    this.secretKey = environment.ENC_KEY;
  }
  /**
   * This method is responsible for encrypt string data.
   * @param {string} message The string message to encrypt.
   * @return {string} The encrypted data as string.
   */
  encrypt(message: string): string {
    const cipherText: any = CryptoJS.AES.encrypt(message, this.secretKey);
    return cipherText.toString();
  }
  /**
   * This method is is responsible for decrypt of cipher (encrypted) data.
   * @param {string} cipherMessage The cipher (encrypted) message.
   * @return {string} The decrypted data as string.
   */
  decrypt(cipherMessage: string): string {
    const bytes = CryptoJS.AES.decrypt(cipherMessage, this.secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
  /**
   * This method is responsible for encrypt JSON data.
   * @param message The JSON object as message to encrypt.
   * @return {string} The encrypted data as string.
   */
  encryptObj(message: any): string {
    const cipherText: any = CryptoJS.AES.encrypt(
      JSON.stringify(message),
      this.secretKey
    );
    return cipherText.toString();
  }
  /**
   * This method is is responsible for decrypt of cipher (encrypted) JSON data.
   * @param {string} cipherMessage The cipher (encrypted) message.
   * @return {string} The decrypted data as JSON object.
   */
  decryptObj(cipherMessage: any): any {
    const bytes = CryptoJS.AES.decrypt(cipherMessage, this.secretKey);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  }
}
