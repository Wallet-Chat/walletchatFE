import { createSlice } from '@reduxjs/toolkit'

type AccountState = {
  account: undefined | string
  isAuthenticated: boolean
}

const initialState: AccountState = {
  account: undefined,
  isAuthenticated: false,
}

const selectState = (state: any) => state.account as AccountState
export const selectAccount = (state: any) => selectState(state).account
export const selectIsAuthenticated = (state: any) =>
  selectState(state).isAuthenticated

export const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    setAccount: (state, action) => {
      state.account = action.payload
    },

    setIsAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload
    },
  },
})

export const { setAccount, setIsAuthenticated } = accountSlice.actions

export default accountSlice.reducer
