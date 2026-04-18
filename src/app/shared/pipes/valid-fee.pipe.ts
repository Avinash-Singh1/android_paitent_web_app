import { Pipe, PipeTransform } from '@angular/core';
import { isValidFee } from '../utils/fee.util';

/**
 * Pipe to validate a consultation fee value.
 * Returns true only if the fee is a positive number (> 0).
 * Returns false for -1, 0, null, undefined.
 *
 * Usage in templates:
 *   *ngIf="doctor?.consultationFees | validFee"
 */
@Pipe({
  standalone: true, name: 'validFee' })
export class ValidFeePipe implements PipeTransform {
  transform(fee: number | null | undefined): boolean {
    return isValidFee(fee);
  }
}
