import { createAction,props  } from '@ngrx/store';

// export const increment = createAction('increment');
// export const decrement = createAction('decrement');
// export const reset = createAction('reset');


export const setDeviceWidth = createAction(
  '[App] Set Device Width',
  props<{ width: number }>()
);

export const setGeolocation = createAction(
  '[App] Set Geolocation',
  props<{ latitude: number; longitude: number }>()
);