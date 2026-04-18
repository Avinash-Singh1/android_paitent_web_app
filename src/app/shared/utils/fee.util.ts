/**
 * Centralized consultation fee validation and formatting.
 * A fee is considered valid only if it is a number greater than 0.
 * Values of -1, 0, null, and undefined are all treated as invalid.
 */

export function isValidFee(fee: number | null | undefined): boolean {
  return fee != null && fee > 0;
}

export function getValidFees(
  clinicFee: number | null | undefined,
  videoFee: number | null | undefined
): { clinicFee?: number; videoFee?: number } | null {
  const clinicValid = isValidFee(clinicFee);
  const videoValid = isValidFee(videoFee);

  if (clinicValid && videoValid) {
    return { clinicFee: clinicFee!, videoFee: videoFee! };
  }
  if (clinicValid) {
    return { clinicFee: clinicFee! };
  }
  if (videoValid) {
    return { videoFee: videoFee! };
  }
  return null;
}

export function formatFee(fee: number | null | undefined): string {
  return isValidFee(fee) ? `\u20B9${fee}` : '';
}

export function getDisplayFee(
  clinicFee: number | null | undefined,
  videoFee: number | null | undefined
): string {
  if (isValidFee(clinicFee)) {
    return `\u20B9${clinicFee}`;
  }
  if (isValidFee(videoFee)) {
    return `\u20B9${videoFee}`;
  }
  return '';
}
