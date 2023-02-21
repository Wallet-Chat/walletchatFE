import { useDispatch } from 'react-redux'
import type { AppDispatch } from '@/redux/store'

// Use throughout your app instead of plain `useDispatch` and `useSelector`
type DispatchFunc = (args?: any) => AppDispatch
export const useAppDispatch: DispatchFunc = useDispatch
