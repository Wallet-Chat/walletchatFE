import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query/react'
import { dmApi } from '@/redux/reducers/dm'
import accountSlice from '@/redux/reducers/account'
import { persistReducer, persistStore } from "redux-persist";
import { combineReducers } from "redux"
import storage from 'redux-persist/lib/storage';

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
};

const rootReducer = combineReducers({
  account: accountSlice,
  [dmApi.reducerPath]: dmApi.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(dmApi.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
type ValuesType<T> = T[keyof T];
export type ReducerStates = ValuesType<RootState>;
export type AppDispatch = typeof store.dispatch;

setupListeners(store.dispatch)