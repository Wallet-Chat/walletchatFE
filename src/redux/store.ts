

import { combineReducers, configureStore } from "@reduxjs/toolkit";
// import { authReducer } from "./Auth/reducer";
import { chatReducer } from "./ChatMsgs/reducer";
import { notifReducer } from "./Notifications/reducer";
// import { recentChatReducer } from "./RecentChat/reducer";
// import { serachReducer } from "./Searching/reducer";

const loggerMiddleware = (store: { dispatch: any; }) => (next: (arg0: never) => void) => (action: (arg0: any) => any) => {
    if (typeof action === "function") {
        return action(store.dispatch);
    }
    next(action);
};

const rootReducer = combineReducers({
    chatting: chatReducer,
    notif: notifReducer
})

export const store = configureStore({
    reducer: rootReducer,
    middleware: (defaultMiddleware) => defaultMiddleware().concat(loggerMiddleware),
});

export type IRootState = ReturnType<typeof rootReducer>;