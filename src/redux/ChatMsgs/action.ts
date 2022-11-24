import { Action } from 'redux'

export const SELECT_CHAT = "SELECT_CHAT";
export const ADD_MESSAGE = "ADD_MESSAGE";
export const MESSAGE_LOADING = "MESSAGE_LOADING";
export const MESSAGE_ERROR = "MESSAGE_ERROR";
export const SEND_MESSAGE = "SEND_MESSAGE";

// TODO: Use data models instead of any 
export const selectChat = (payload: any) => ({ type: SELECT_CHAT, payload });
export const addMessage = (payload: any) => ({ type: ADD_MESSAGE, payload } as Action);
export const messageLoading = (payload: any) => ({ type: MESSAGE_LOADING, payload } as Action);
export const messageError = (payload: any) => ({ type: MESSAGE_ERROR, payload } as Action);
export const sendMessage = (payload: any) => ({ type: SEND_MESSAGE, payload } as Action);

// I could add some of the actions here as a consolidated place for all global state and network update functions 

export const getChatMessages = () => async ()
 