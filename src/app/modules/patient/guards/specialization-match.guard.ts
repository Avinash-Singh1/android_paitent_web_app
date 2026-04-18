import { CanMatchFn, Route, UrlSegment } from '@angular/router';

/**
 * Known specialization slugs used in hospital list URLs.
 * When a URL like /:city/hospitals/:slug is visited, this guard
 * determines whether :slug is a specialization (match → HospitalListModule2)
 * or a locality (no match → falls through to HospitalListCityLocalityModule).
 *
 * Keep this set in sync with new specializations added to the system.
 */
const KNOWN_SPECIALIZATIONS = new Set([
  'orthopedic-surgeon',
  'orthopedist',
  'anesthesiologist',
  'ayurveda',
  'preventive-cardiologist',
  'cardiologist',
  'colposcopist',
  'conservative-dentist',
  'pediatric-dentist',
  'endodontist',
  'dentist',
  'dental-surgeon',
  'orthodontist',
  'prosthodontist',
  'implantologist',
  'diabetologist',
  'dietitian-nutritionist',
  'ophthalmologist',
  'ent-specialist',
  'endocrinologist',
  'family-physician',
  'general-physician',
  'general-surgeon',
  'geriatrician',
  'reproductive-endocrinologist',
  'infertility-specialist',
  'gynecologist',
  'gynecologist-obstetrician',
  'laparoscopic-surgeon',
  'homeopath',
  'dermatologist',
  'pediatric-dermatologist',
  'aesthetic-dermatologist',
  'cosmetologist',
  'plastic-surgeon',
  'hair-transplant-surgeon',
  'oncologist',
  'radiation-oncologist',
  'surgical-oncologist',
  'joint-replacement-surgeon',
  'physiotherapist',
  'pediatrician',
  'neonatologist',
  'psychiatrist',
  'psychologist',
  'pulmonologist',
  'radiologist',
  'sexologist',
  'trichologist',
  'urological-surgeon',
  'urologist',
  'nephrologist',
  'neurologist',
  'neurosurgeon',
  'rheumatologist',
  'gastroenterologist',
  'hepatologist',
  'proctologist',
  'vascular-surgeon',
  'bariatric-surgeon',
  'cardiothoracic-surgeon',
  'allergist',
  'immunologist',
  'hematologist',
  'pathologist',
  'microbiologist',
  'audiologist',
  'speech-therapist',
  'occupational-therapist',
  'podiatrist',
  'chiropractor',
  'naturopath',
  'acupuncturist',
  'unani',
  'siddha',
  'dietician',
]);

/**
 * canMatch guard: returns true only when the third URL segment
 * (position index 2) is a recognised specialization slug.
 *
 * Route order in patient-routing:
 *   1. :city/hospitals/:specialization_id  [canMatch: isSpecializationMatch]  → HospitalListModule2
 *   2. :city/hospitals/:locality           (no guard – fallback)              → HospitalListCityLocalityModule
 */
export const isSpecializationMatch: CanMatchFn = (
  _route: Route,
  segments: UrlSegment[]
) => {
  // Pattern being matched: :city / hospitals / :slug
  // segments[0] = city, segments[1] = 'hospitals', segments[2] = slug
  if (segments.length >= 3) {
    return KNOWN_SPECIALIZATIONS.has(segments[2].path.toLowerCase());
  }
  return false;
};
