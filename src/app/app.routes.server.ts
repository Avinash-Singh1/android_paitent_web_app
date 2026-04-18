import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Authenticated/dashboard routes — CSR only (no SEO value)
  { path: 'doctor/**', renderMode: RenderMode.Client },
  { path: 'hospital/**', renderMode: RenderMode.Client },
  { path: 'auth/**', renderMode: RenderMode.Client },
  { path: 'profile/**', renderMode: RenderMode.Client },
  { path: 'register/**', renderMode: RenderMode.Client },
  { path: 'appointment-booking', renderMode: RenderMode.Client },
  { path: 'cancel-booking', renderMode: RenderMode.Client },
  { path: 'confirm-booking', renderMode: RenderMode.Client },
  { path: 'reschedule-booking', renderMode: RenderMode.Client },
  { path: 'appointment-completed', renderMode: RenderMode.Client },
  // All public routes — SSR for SEO
  { path: '**', renderMode: RenderMode.Server },
];
