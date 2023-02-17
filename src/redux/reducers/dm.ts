import { createSlice } from '@reduxjs/toolkit'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { createErrorResponse } from '@/redux/reducers/helpers'
import { getFetchOptions } from '@/helpers/fetch'
import * as ENV from '@/constants/env'

export const dmApi = createApi({
	reducerPath: 'dmApi',
	baseQuery: fetchBaseQuery({
		baseUrl: `${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/`,
	}),
	endpoints: (builder) => ({
		getPfp: builder.query({
			query: (addr) => ({ url: `image/${addr}`, ...getFetchOptions() }),
			transformResponse: async (response: any) => {
				console.log('✅[GET][Image FromAddr]:', response)

				const base64data = response[0]?.base64data

				return base64data
			},
			transformErrorResponse: createErrorResponse('Image'),
		}),

		getName: builder.query({
			query: (addr) => ({ url: `name/${addr}`, ...getFetchOptions() }),
			transformResponse: async (response: any) => {
				console.log('✅[GET][Name]:', response)

				const name = response[0]?.name

				return name
			},
			transformErrorResponse: createErrorResponse('Name'),
		}),
	}),
})

export const { useGetPfpQuery, useGetNameQuery } = dmApi

type DMState = {
	dmDataByAccountByAddr: { [account: string]: { [addr: string]: string } }
	dmDataEncByAccountByAddr: { [account: string]: { [addr: string]: string } }
	dmReadIdsByAccountByAddr: { [account: string]: { [addr: string]: string } }
}

const initialState: DMState = {
	dmDataByAccountByAddr: {},
	dmDataEncByAccountByAddr: {},
	dmReadIdsByAccountByAddr: {},
}

export const dmSlice = createSlice({
	name: 'dm',
	initialState,
	reducers: {},
	// extraReducers: (builder) => {},
})

// export const {  } = dmSlice.actions;

export default dmSlice.reducer
