import { AnyAction } from 'redux'

import {
    SET_EMAIL,
    SET_NAME
} from "./action";


const initState = {
    email: "john.doe@johndoe.com",
    name: "John Doe",
    loading: false,
    error: false,
};


export const userReducer = (store = initState, { action, payload }: AnyAction) => {
    switch (action) {
        case SET_EMAIL:
            return {
                ...store,
                email: payload,
                loading: false,
                error: false,
            };
        case SET_NAME:
            return {
                ...store,
                name: payload,
                loading: false,
                error: false,
            };
        default:
            return store;
    }
}