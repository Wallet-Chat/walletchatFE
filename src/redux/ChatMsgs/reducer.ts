import { AnyAction } from 'redux'

import {
    ADD_MESSAGE,
    MESSAGE_ERROR,
    MESSAGE_LOADING,
    SELECT_CHAT,
    SEND_MESSAGE,
} from "./action";

const initState = {
    metadata: {},
    messages: [],
    loading: false,
    error: false,
};

export const chatReducer = (store = initState, { action, payload }: AnyAction) => {
    switch (action) {
        case SELECT_CHAT:
            return {
                ...store,
                metadata: payload,
                loading: false,
                error: false,
            };
        case SEND_MESSAGE:
            return {
                ...store,
                messages: [...store.messages, payload],
                loading: false,
                error: false,
            };
        case ADD_MESSAGE:
            return { ...store, messages: payload, loading: false, error: false };
        case MESSAGE_LOADING:
            return { ...store, loading: payload };
        case MESSAGE_ERROR:
            return { ...store, error: payload };
        default:
            return store;
    }
}