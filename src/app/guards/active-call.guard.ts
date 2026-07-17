import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { PersistentVideoCallService } from '../services/persistent-video-call.service';

/**
 * Route guard that warns users when navigating away during an active video call.
 * 
 * Note: This guard is optional. The persistent video call will continue even
 * if the user navigates away. This just provides a confirmation dialog.
 * 
 * Usage:
 * Add to route configuration:
 * ```typescript
 * {
 *   path: 'some-route',
 *   component: SomeComponent,
 *   canDeactivate: [activeCallGuard]
 * }
 * ```
 */
export const activeCallGuard: CanDeactivateFn<any> = (
  component,
  currentRoute,
  currentState,
  nextState
) => {
  const videoCallService = inject(PersistentVideoCallService);

  // Allow navigation if no active call
  if (!videoCallService.isCallActive) {
    return true;
  }

  // Allow navigation if call is minimized (user already knows it's active)
  if (videoCallService.currentCallState === 'minimized') {
    return true;
  }

  // Warn user about active call
  const confirmed = confirm(
    'You have an active video consultation. The call will continue in the background. Are you sure you want to navigate away?'
  );

  // If user confirms, minimize the call
  if (confirmed) {
    videoCallService.minimize();
    return true;
  }

  return false;
};
