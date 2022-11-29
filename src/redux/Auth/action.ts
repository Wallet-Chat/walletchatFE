import { Action, Dispatch } from "@reduxjs/toolkit";
import { store } from "../store";



export const AUTH_USER = "AUTH_USER";
export const AUTH_LOADING = "AUTH_LOADING";
export const AUTH_ERROR = "AUTH_ERROR";
export const LOGOUT = "LOGOUT";
export const GET_WALLET_ADDR = "GET_WALLET_ADDR";
export const SET_WALLET_ADDR = "SET_WALLET_ADDR";


export const authUserAct = (payload: any) => ({ type: AUTH_USER, payload });
export const authLoading = (payload: any) => ({ type: AUTH_LOADING, payload });
export const authError = (payload: any) => ({ type: AUTH_ERROR, payload });
export const authLogout = () => ({ type: LOGOUT, payload: {} });
export const getWallet = () => ({type: GET_WALLET_ADDR}  as Action)
export const setWallet = (payload: any) => ({type: SET_WALLET_ADDR, payload}  as Action)




export const getUserWallet = () => async (dispatch: Dispatch) => {
    dispatch(getWallet())
    return store.getState().auth.userAddr
}


export const authUser = (userAddr: string) => async(dispatch: Dispatch) => {
    dispatch(authUserAct({
        userAddr: userAddr
    }))
}