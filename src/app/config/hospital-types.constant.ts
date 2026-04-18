/**
 * Hospital type mappings used for dynamic URL routing.
 *
 * Database values → singular slug (for detail page URL)
 * Database values → plural slug (for listing page URL)
 *
 * Detail URL:  /:city/clinic/:slug
 * Listing URL: /:city/clinics
 */

/** Singular slug used in hospital detail URLs: /:city/clinic/:slug */
export const HOSPITAL_TYPE_SINGULAR_SLUGS = new Map<string, string>([
  ['clinic', 'clinic'],
  ['hospital', 'hospital'],
  ['multi-speciality-clinic', 'multi-speciality-clinic'],
  ['super-speciality-hospital', 'super-speciality-hospital'],
  ['multi-speciality-hospital', 'multi-speciality-hospital'],
]);

/** Plural slug used in type listing URLs: /:city/clinics */
export const HOSPITAL_TYPE_PLURAL_SLUGS = new Map<string, string>([
  ['clinic', 'clinics'],
  ['hospital', 'hospitals'],
  ['multi-speciality-clinic', 'multi-speciality-clinics'],
  ['super-speciality-hospital', 'super-speciality-hospitals'],
  ['multi-speciality-hospital', 'multi-speciality-hospitals'],
]);

/** Reverse: plural slug → singular slug */
export const PLURAL_TO_SINGULAR = new Map<string, string>([
  ['clinics', 'clinic'],
  ['hospitals', 'hospital'],
  ['multi-speciality-clinics', 'multi-speciality-clinic'],
  ['super-speciality-hospitals', 'super-speciality-hospital'],
  ['multi-speciality-hospitals', 'multi-speciality-hospital'],
]);

/** All valid singular hospital type slugs (for route guards) */
export const VALID_SINGULAR_TYPE_SLUGS: ReadonlySet<string> = new Set(
  HOSPITAL_TYPE_SINGULAR_SLUGS.values()
);

/** All valid plural hospital type slugs (for route guards) */
export const VALID_PLURAL_TYPE_SLUGS: ReadonlySet<string> = new Set(
  HOSPITAL_TYPE_PLURAL_SLUGS.values()
);

/**
 * Convert a database hospital type name to a URL-safe singular slug.
 * e.g. "Multi Speciality Hospital" → "multi-speciality-hospital"
 */
export function hospitalTypeToSlug(typeName: string): string {
  if (!typeName) return 'hospital';
  const slug = typeName.toLowerCase().replace(/\s+/g, '-');
  return VALID_SINGULAR_TYPE_SLUGS.has(slug) ? slug : 'hospital';
}

/**
 * Convert a singular slug to its plural form for listing URLs.
 * e.g. "clinic" → "clinics", "multi-speciality-hospital" → "multi-speciality-hospitals"
 */
export function singularToPlural(singularSlug: string): string {
  const entry = [...HOSPITAL_TYPE_PLURAL_SLUGS.entries()]
    .find(([key]) => key === singularSlug);
  return entry ? entry[1] : 'hospitals';
}

/**
 * Convert a plural slug back to singular form.
 * e.g. "clinics" → "clinic", "multi-speciality-hospitals" → "multi-speciality-hospital"
 */
export function pluralToSingular(pluralSlug: string): string {
  return PLURAL_TO_SINGULAR.get(pluralSlug) || 'hospital';
}

/**
 * Get display name from slug.
 * e.g. "multi-speciality-clinic" → "Multi Speciality Clinic"
 */
export function typeSlugToDisplayName(slug: string): string {
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Get plural display name from singular slug.
 * e.g. "clinic" → "Clinics", "multi-speciality-hospital" → "Multi Speciality Hospitals"
 */
export function typePluralDisplayName(singularSlug: string): string {
  const plural = singularToPlural(singularSlug);
  return typeSlugToDisplayName(plural);
}

/**
 * Map a singular hospital type slug to the valid parent listing route slug.
 * Since only /:city/clinics and /:city/hospitals routes exist,
 * all clinic-type slugs map to "clinics" and all hospital-type slugs map to "hospitals".
 *
 * e.g. "multi-speciality-clinic" → "clinics", "super-speciality-hospital" → "hospitals"
 */
export function typeToListingRouteSlug(singularSlug: string): string {
  if (!singularSlug) return 'hospitals';
  const lower = singularSlug.toLowerCase();
  if (lower.includes('clinic')) return 'clinics';
  return 'hospitals';
}

/**
 * Specialization slug → hospital/clinic type display name.
 * Used to detect spec slugs in /:city/hospitals/:locality routes
 * and render "Best {type} in {city}" titles.
 */
export const SPEC_SLUG_TO_HOSPITAL_TYPE: ReadonlyMap<string, string> = new Map([
  ["orthopedic-surgeon", "Orthopedic Hospital"],
  ["orthopedist", "Orthopedic Hospital"],
  ["anesthesiologist", "Anesthesiology Hospital"],
  ["ayurveda", "Ayurvedic Hospital"],
  ["preventive-cardiologist", "Preventive Cardiology Hospital"],
  ["cardiologist", "Cardiology Hospital"],
  ["colposcopist", "Colposcopy Hospital"],
  ["conservative-dentist", "Dental Clinic"],
  ["pediatric-dentist", "Dental Clinic"],
  ["endodontist", "Dental Clinic"],
  ["dentist", "Dental Clinic"],
  ["dental-surgeon", "Dental Clinic"],
  ["orthodontist", "Dental Clinic"],
  ["prosthodontist", "Dental Clinic"],
  ["implantologist", "Dental Clinic"],
  ["diabetologist", "Diabetology Hospital"],
  ["dietitian-nutritionist", "Diet & Nutrition Hospital"],
  ["ophthalmologist", "Eye Hospital"],
  ["ent-specialist", "ENT Hospital"],
  ["endocrinologist", "Endocrinology Hospital"],
  ["family-physician", "Family Physician Hospital"],
  ["general-physician", "General Hospital"],
  ["general-surgeon", "General Surgery Hospital"],
  ["geriatrician", "Geriatric Hospital"],
  ["reproductive-endocrinologist", "Reproductive Endocrinology Hospital"],
  ["infertility-specialist", "Infertility Hospital"],
  ["gynecologist", "Gynecology Hospital"],
  ["gynecologist-obstetrician", "Gynecology Hospital"],
  ["laparoscopic-surgeon", "Laparoscopic Surgery Hospital"],
  ["homeopath", "Homeopathy Hospital"],
  ["dermatologist", "Dermatology Hospital"],
  ["pediatric-dermatologist", "Dermatology Hospital"],
  ["aesthetic-dermatologist", "Dermatology Hospital"],
  ["cosmetologist", "Cosmetology Hospital"],
  ["plastic-surgeon", "Plastic Surgery Hospital"],
  ["hair-transplant-surgeon", "Hair Transplant Hospital"],
  ["oncologist", "Oncology Hospital"],
  ["radiation-oncologist", "Oncology Hospital"],
  ["surgical-oncologist", "Oncology Hospital"],
  ["joint-replacement-surgeon", "Joint Replacement Hospital"],
  ["physiotherapist", "Physiotherapy Hospital"],
  ["pediatrician", "Pediatric Hospital"],
  ["neonatologist", "Neonatal Hospital"],
  ["psychiatrist", "Psychiatry Hospital"],
  ["psychologist", "Psychology Hospital"],
  ["pulmonologist", "Pulmonology Hospital"],
  ["radiologist", "Radiology Hospital"],
  ["sexologist", "Sexual Health Hospital"],
  ["trichologist", "Trichology Hospital"],
  ["urological-surgeon", "Urology Hospital"],
  ["urologist", "Urology Hospital"],
]);

/**
 * Specialization slug → clinic type display name.
 * Used to detect spec slugs in /:city/clinics/:locality routes.
 */
export const SPEC_SLUG_TO_CLINIC_TYPE: ReadonlyMap<string, string> = new Map([
  ["orthopedic-surgeon", "Orthopedic Clinic"],
  ["orthopedist", "Orthopedic Clinic"],
  ["anesthesiologist", "Anesthesiology Clinic"],
  ["ayurveda", "Ayurvedic Clinic"],
  ["preventive-cardiologist", "Preventive Cardiology Clinic"],
  ["cardiologist", "Cardiology Clinic"],
  ["colposcopist", "Colposcopy Clinic"],
  ["conservative-dentist", "Dental Clinic"],
  ["pediatric-dentist", "Dental Clinic"],
  ["endodontist", "Dental Clinic"],
  ["dentist", "Dental Clinic"],
  ["dental-surgeon", "Dental Clinic"],
  ["orthodontist", "Dental Clinic"],
  ["prosthodontist", "Dental Clinic"],
  ["implantologist", "Dental Clinic"],
  ["cosmetic-aesthetic-dentist", "Dental Clinic"],
  ["diabetologist", "Diabetology Clinic"],
  ["dietitian-nutritionist", "Diet & Nutrition Clinic"],
  ["ophthalmologist", "Eye Clinic"],
  ["ent-specialist", "ENT Clinic"],
  ["endocrinologist", "Endocrinology Clinic"],
  ["family-physician", "Family Physician Clinic"],
  ["general-physician", "General Physician Clinic"],
  ["general-surgeon", "General Surgery Clinic"],
  ["geriatrician", "Geriatric Clinic"],
  ["reproductive-endocrinologist", "Reproductive Endocrinology Clinic"],
  ["infertility-specialist", "Infertility Clinic"],
  ["gynecologist", "Gynecology Clinic"],
  ["gynecologist-obstetrician", "Gynecology Clinic"],
  ["laparoscopic-surgeon", "Laparoscopic Surgery Clinic"],
  ["homeopath", "Homeopathy Clinic"],
  ["dermatologist", "Dermatology Clinic"],
  ["pediatric-dermatologist", "Dermatology Clinic"],
  ["aesthetic-dermatologist", "Dermatology Clinic"],
  ["cosmetologist", "Cosmetology Clinic"],
  ["plastic-surgeon", "Plastic Surgery Clinic"],
  ["hair-transplant-surgeon", "Hair Transplant Clinic"],
  ["oncologist", "Oncology Clinic"],
  ["radiation-oncologist", "Oncology Clinic"],
  ["surgical-oncologist", "Oncology Clinic"],
  ["joint-replacement-surgeon", "Joint Replacement Clinic"],
  ["physiotherapist", "Physiotherapy Clinic"],
  ["pediatrician", "Pediatric Clinic"],
  ["neonatologist", "Neonatal Clinic"],
  ["psychiatrist", "Psychiatry Clinic"],
  ["psychologist", "Psychology Clinic"],
  ["pulmonologist", "Pulmonology Clinic"],
  ["radiologist", "Radiology Clinic"],
  ["sexologist", "Sexual Health Clinic"],
  ["trichologist", "Trichology Clinic"],
  ["urological-surgeon", "Urology Clinic"],
  ["urologist", "Urology Clinic"],
]);
