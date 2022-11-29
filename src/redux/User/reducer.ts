import { AnyAction } from 'redux'

import {
    SET_EMAIL,
    SET_NAME,
    FETCH_NAME
} from "./action";


const initState = {
    email: null,
    name: null,
    fetching: false,
    error: false,
};


export const userReducer = (store = initState, { action, payload }: AnyAction) => {
    switch (action) {
        case SET_EMAIL:
            return {
                ...store,
                email: payload,
                error: false,
            };
        case SET_NAME:
            return {
                ...store,
                name: payload,
                error: false,
            };
        case FETCH_NAME:
            return {
                ...store,
                fetching: payload,
            }
        default:
            return store;
    }
}