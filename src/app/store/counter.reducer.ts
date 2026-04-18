// import { increment, decrement, reset } from './counter.actions';
import { _initialState  } from './counter.state';
// import { initialState,_initialState, AppState  } from './counter.state';
import { createReducer, on } from '@ngrx/store';
import { setDeviceWidth, setGeolocation } from './counter.actions';

// const _counterReducer = createReducer(
//   initialState,
//   on(increment, (state) => {
//     return {
//       ...state,
//       counter: state.counter + 1,
//     };
//   }),
//   on(decrement, (state) => {
//     return {
//       ...state,
//       counter: state.counter - 1,
//     };
//   }),
//   on(reset, (state) => {
//     return {
//       ...state,
//       counter: 0,
//     };
//   })
// );


const _appReducer = createReducer(
  _initialState,
  on(setDeviceWidth, (state, { width }) => ({
    ...state,
    deviceWidth: width,
  })),
  on(setGeolocation, (state, { latitude, longitude }) => ({
    ...state,
    geolocation: {
      latitude,
      longitude,
    },
  }))
);

export function appReducer(state: any| undefined, action: any): any {
  return _appReducer(state, action);
}

// export function counterReducer(state, action) {
//   return _counterReducer(state, action);
// }
