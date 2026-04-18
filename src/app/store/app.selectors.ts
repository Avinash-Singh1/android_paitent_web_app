// store/app.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppState } from './counter.state'; 

export const selectAppState = createFeatureSelector<AppState>('app');

export const selectDeviceWidth = createSelector(
  selectAppState,
  (state) => state.deviceWidth
);

export const selectGeolocation = createSelector(
  selectAppState,
  (state) => state.geolocation
);
