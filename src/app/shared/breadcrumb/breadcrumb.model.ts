/**
 * Breadcrumb Data Model
 */

export interface Breadcrumb {
  label: string;
  url: string;
  isActive: boolean;
  icon?: string;
}

export interface BreadcrumbConfig {
  showHome: boolean;
  homeLabel: string;
  homeIcon: string;
  separator: string;
  maxItems?: number;  // Limit displayed items (mobile)
}
