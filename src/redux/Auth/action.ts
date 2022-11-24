


export const AUTH_USER = "AUTH_USER";
export const AUTH_LOADING = "AUTH_LOADING";
export const AUTH_ERROR = "AUTH_ERROR";
export const LOGOUT = "LOGOUT";
export const GET_WALLET_ADDR = "GET_WALLET_ADDR";
export const SET_WALLET_ADDR = "SET_WALLET_ADDR";


export const authUser = (payload: any) => ({ type: AUTH_USER, payload });
export const authLoading = (payload: any) => ({ type: AUTH_LOADING, payload });
export const authError = (payload: any) => ({ type: AUTH_ERROR, payload });
export const authLogout = () => ({ type: LOGOUT, payload: {} });
