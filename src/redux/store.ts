

import { configureStore } from "@reduxjs/toolkit";
// import { authReducer } from "./Auth/reducer";
import { chatReducer } from "./ChatMsgs/reducer";
// import { notyficationReducer } from "./Notification/reducer";
// import { recentChatReducer } from "./RecentChat/reducer";
// import { serachReducer } from "./Searching/reducer";

const loggerMiddleware = (store: { dispatch: any; }) => (next: (arg0: never) => void) => (action: (arg0: any) => any) => {
    if (typeof action === "function") {
        return action(store.dispatch);
    }
    next(action);
};

export const store = configureStore({
    reducer: {
        chatting: chatReducer,
    },
    middleware: (defaultMiddleware) => defaultMiddleware().concat(loggerMiddleware),
});