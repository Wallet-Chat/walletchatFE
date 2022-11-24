import { AnyAction } from 'redux'

import {
  AUTH_ERROR,
  AUTH_LOADING,
  AUTH_USER,
  LOGOUT,
  GET_WALLET_ADDR,
  SET_WALLET_ADDR
} from "./action";
const initState = {
    user: null,//user.user,
    loading: false,
    error: false,
    token: null,//user.token,
  };

  const logoutState = initState

  export const authReducer = (store = initState, { type, payload }: AnyAction) => {
    switch (type) {
        case AUTH_USER:
          return {
            ...store,
            user: payload.user,
            loading: false,
            error: false,
            token: payload.token,
          };
        case AUTH_ERROR:
          return { ...store, error: payload };
        case AUTH_LOADING:
          return { ...store, loading: payload };
        case LOGOUT:
          return logoutState;
        default:
          return store;
      }

  }