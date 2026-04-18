export interface AppState {
  deviceWidth: number;
  geolocation: {
    latitude: number;
    longitude: number;
  };
}

// export const initialState = {
//   counter: 1440,
// };

export const _initialState: AppState = {
  deviceWidth: 0,
  geolocation: {
    latitude: 0,
    longitude: 0,
  },
};
