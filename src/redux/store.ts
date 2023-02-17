import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query/react'
import dmReducer, { dmApi } from '@/redux/reducers/dm'

export const store = configureStore({
	reducer: {
		dm: dmReducer,
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
