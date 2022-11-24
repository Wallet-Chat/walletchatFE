import { AnyAction } from 'redux'

import {
    // GET_UNREAD_CNT,
    SET_UNREAD_CNT,
    UNREAD_CNT_LOADING,
    UNREAD_CNT_ERROR
} from "./action";

const initState = {
    unreadCnts: 0,
    loading: false,
    error: false,
};


export const notifReducer = (store = initState, { action, payload }: AnyAction) => {
    switch (action) {
        case SET_UNREAD_CNT:
            return {
                ...store,
                unreadCnts: store.unreadCnts + payload,
                loading: false,
                error: false,
            };
        case UNREAD_CNT_LOADING:
            return { ...store, unreadCnts: payload, loading: false, error: false };
        case UNREAD_CNT_ERROR:
            return { ...store, loading: payload };
        default:
            return store;
    }
}