import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { RootState } from '@/redux/store'
import * as ENV from '@/constants/env'

type DMState = {
	pfpDataByAddr: { [addr: string]: null | string }
	pfpDataFetchingAddrsByRequest: { [req: string]: string }
	dmDataByAccountByAddr: { [account: string]: { [addr: string]: string } }
	dmDataEncByAccountByAddr: { [account: string]: { [addr: string]: string } }
	dmReadIdsByAccountByAddr: { [account: string]: { [addr: string]: string } }
}

const initialState: DMState = {
	pfpDataByAddr: {},
	pfpDataFetchingAddrsByRequest: {},
	dmDataByAccountByAddr: {},
	dmDataEncByAccountByAddr: {},
	dmReadIdsByAccountByAddr: {},
}

const selectState = (state: any) => (state as RootState).dm

export const fetchPfpDataForAddr = createAsyncThunk(
	'dm/fetchPfpDataForAddr',
	async (addr: string, thunkAPI) => {
		const state = selectState(thunkAPI.getState())
		const fetchingForAddr = state.pfpDataFetchingAddrsByRequest[addr]
		const isFetching = fetchingForAddr && fetchingForAddr !== thunkAPI.requestId
		const alreadyFetchedValue = state.pfpDataByAddr[addr]

		if (isFetching || alreadyFetchedValue) {
			return thunkAPI.fulfillWithValue(alreadyFetchedValue)
		}

		try {
			const response: any = await fetch(
				`${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/image/${addr}`,
				{
					method: 'GET',
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${localStorage.getItem('jwt')}`,
					},
				}
			)

			console.log('✅[GET][Image FromAddr]:', response)

			const json = await response.json()
			const base64data = json[0]?.base64data

			if (base64data) {
				return thunkAPI.fulfillWithValue(base64data)
			}

			return thunkAPI.rejectWithValue(addr)
		} catch (error) {
			console.error('🚨[GET][Image FromAddr]:', error)
			return thunkAPI.rejectWithValue(addr)
		}
	}
)

export const dmSlice = createSlice({
	name: 'dm',
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(
			fetchPfpDataForAddr.pending,
			(state: DMState, action: any) => {
				const { arg: addr, requestId } = action.meta

				const newPfpDataFetchingAddrsByRequest = {
					...state.pfpDataFetchingAddrsByRequest,
				}
				if (!newPfpDataFetchingAddrsByRequest[addr]) {
					newPfpDataFetchingAddrsByRequest[addr] = requestId || ''
				}

				state.pfpDataFetchingAddrsByRequest = newPfpDataFetchingAddrsByRequest
			}
		)
		builder.addCase(
			fetchPfpDataForAddr.fulfilled,
			(state: DMState, action: any) => {
				const addr = action.meta.arg

				const newPfpDataFetchingAddrsByRequest = {
					...state.pfpDataFetchingAddrsByRequest,
				}
				delete newPfpDataFetchingAddrsByRequest[addr]
				state.pfpDataFetchingAddrsByRequest = newPfpDataFetchingAddrsByRequest

				const response = action.payload

				if (response) {
					state.pfpDataByAddr[addr] = response
				} else {
					state.pfpDataByAddr[addr] = null
				}
			}
		)
		builder.addCase(
			fetchPfpDataForAddr.rejected,
			(state: DMState, action: any) => {
				const addr = action.meta.arg

				const newPfpDataFetchingAddrsByRequest = {
					...state.pfpDataFetchingAddrsByRequest,
				}
				delete newPfpDataFetchingAddrsByRequest[addr]

				state.pfpDataFetchingAddrsByRequest = newPfpDataFetchingAddrsByRequest
				state.pfpDataByAddr[addr] = null
			}
		)
	},
})

// export const { fetchPfpDataForAddr } = dmSlice.actions;

export default dmSlice.reducer
