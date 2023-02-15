import { configureStore } from "@reduxjs/toolkit";
import dmReducer from '@/redux/reducers/dm';

export const store = configureStore({
  reducer: {
    dm: dmReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
