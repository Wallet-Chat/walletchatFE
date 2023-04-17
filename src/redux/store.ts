import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query/react'
import { dmApi } from '@/redux/reducers/dm'
import accountSlice from '@/redux/reducers/account'

export const store = configureStore({
  reducer: {
    account: accountSlice,
    [dmApi.reducerPath]: dmApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(dmApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
type ValuesType<T> = T[keyof T]
export type ReducerStates = ValuesType<RootState>
export type AppDispatch = typeof store.dispatch

setupListeners(store.dispatch)
