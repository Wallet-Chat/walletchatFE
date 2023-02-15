import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  addPendingSetReducer,
  deletePendingSetReducer,
  createFetchCondition,
} from '@/redux/reducers/helpers'
import { getFetchOptions } from '@/helpers/fetch'
import * as ENV from '@/constants/env'

type DMState = {
  pfpDataByAddr: { [addr: string]: null | string }
  pfpDataFetchingAddresses: string[]
  nameByAddr: { [addr: string]: null | string }
  nameFetchingAddresses: string[]
  dmDataByAccountByAddr: { [account: string]: { [addr: string]: string } }
  dmDataEncByAccountByAddr: { [account: string]: { [addr: string]: string } }
  dmReadIdsByAccountByAddr: { [account: string]: { [addr: string]: string } }
}

const initialState: DMState = {
  pfpDataByAddr: {},
  pfpDataFetchingAddresses: [],
  nameByAddr: {},
  nameFetchingAddresses: [],
  dmDataByAccountByAddr: {},
  dmDataEncByAccountByAddr: {},
  dmReadIdsByAccountByAddr: {},
}

export const fetchPfpDataForAddr = createAsyncThunk(
  'dm/fetchPfpDataForAddr',
  async (addr: string, thunkAPI) => {
    try {
      const response: any = await fetch(
        `${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/image/${addr}`,
        getFetchOptions()
      )
      const json = await response.json()

      console.log('✅[GET][Image FromAddr]:', response)

      const base64data = json[0]?.base64data

      if (base64data) {
        return thunkAPI.fulfillWithValue(base64data)
      }

      return thunkAPI.rejectWithValue(addr)
    } catch (error) {
      console.error('🚨[GET][Image FromAddr]:', error)
      return thunkAPI.rejectWithValue(addr)
    }
  },
  {
    condition: createFetchCondition(
      'pfpDataFetchingAddresses',
      'pfpDataByAddr'
    ),
  }
)

export const fetchNameForAddr = createAsyncThunk(
  'dm/fetchNameForAddr',
  async (addr: string, thunkAPI) => {
    try {
      const response: any = await fetch(
        ` ${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/name/${addr}`,
        getFetchOptions()
      )
      const json = await response.json()

      console.log('✅[GET][Name]:', response)

      const name = json[0]?.name

      if (!name) {
        return thunkAPI.fulfillWithValue('User Not Yet Joined')
      }

      return thunkAPI.fulfillWithValue(name)
    } catch (error) {
      console.error('🚨[GET][Name]:', error)
      return thunkAPI.rejectWithValue(addr)
    }
  },
  {
    condition: createFetchCondition('nameFetchingAddresses', 'nameByAddr'),
  }
)

export const dmSlice = createSlice({
  name: 'dm',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPfpDataForAddr.pending, (state, action) =>
        addPendingSetReducer(action.meta.arg, state, 'pfpDataFetchingAddresses')
      )
      .addCase(fetchPfpDataForAddr.fulfilled, (state, action) => {
        const addr = action.meta.arg

        deletePendingSetReducer(addr, state, 'pfpDataFetchingAddresses')

        const response = action.payload

        if (response) {
          state.pfpDataByAddr[addr] = response
        } else {
          state.pfpDataByAddr[addr] = null
        }
      })
      .addCase(fetchPfpDataForAddr.rejected, (state, action) => {
        const addr = action.meta.arg

        deletePendingSetReducer(addr, state, 'pfpDataFetchingAddresses')

        state.pfpDataByAddr[addr] = null
      })

      .addCase(fetchNameForAddr.pending, (state, action) =>
        addPendingSetReducer(action.meta.arg, state, 'nameFetchingAddresses')
      )
      .addCase(fetchNameForAddr.fulfilled, (state: DMState, action: any) => {
        const addr = action.meta.arg

        deletePendingSetReducer(addr, state, 'nameFetchingAddresses')

        const response = action.payload

        if (response) {
          state.nameByAddr[addr] = response
        } else {
          state.nameByAddr[addr] = null
        }
      })
      .addCase(fetchNameForAddr.rejected, (state: DMState, action: any) => {
        const addr = action.meta.arg

        deletePendingSetReducer(addr, state, 'nameFetchingAddresses')

        state.nameByAddr[addr] = null
      })
  },
})

// export const {  } = dmSlice.actions;

export default dmSlice.reducer
