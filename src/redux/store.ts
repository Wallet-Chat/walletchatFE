import { configureStore } from '@reduxjs/toolkit'
import dmReducer from '@/redux/reducers/dm'

export const store = configureStore({
	reducer: {
		dm: dmReducer,
	},
})

export type RootState = ReturnType<typeof store.getState>
type ValuesType<T> = T[keyof T]
export type ReducerStates = ValuesType<RootState>
export type AppDispatch = typeof store.dispatch
