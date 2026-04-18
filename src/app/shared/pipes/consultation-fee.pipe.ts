import { Pipe, PipeTransform } from '@angular/core';
import { isValidFee, getDisplayFee } from '../utils/fee.util';

/**
 * Pipe to format a consultation fee with proper fallback.
 *
 * Usage:
 *   Single fee:       {{ consultationFees | consultationFee }}
 *                     → "₹500" or ""
 *
 *   With fallback:    {{ consultationFees | consultationFee:videoConsultationFees }}
 *                     → "₹500" (clinic), "₹400" (video fallback), or "Fee Not Available"
 */
@Pipe({
  standalone: false, name: 'consultationFee' })
export class ConsultationFeePipe implements PipeTransform {
  transform(clinicFee: number | null | undefined, videoFee?: number | null | undefined): string {
    if (videoFee !== undefined) {
      return getDisplayFee(clinicFee, videoFee);
    }
    return isValidFee(clinicFee) ? `\u20B9${clinicFee}` : '';
  }
}
