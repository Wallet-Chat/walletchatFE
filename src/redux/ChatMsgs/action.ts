import { Dispatch } from '@reduxjs/toolkit';
import { Action } from 'redux'
import { get } from '@/services/api'

export const SELECT_CHAT = "SELECT_CHAT";
export const GET_MESSAGE = "GET_MESSAGE";
export const FETCH_MESSAGE = "FETCH_MESSAGE";
export const ADD_MESSAGE = "ADD_MESSAGE";
export const MESSAGE_LOADING = "MESSAGE_LOADING";
export const MESSAGE_ERROR = "MESSAGE_ERROR";
export const SEND_MESSAGE = "SEND_MESSAGE";

// TODO: Use data models instead of any 
export const selectChat = (payload: any) => ({ type: SELECT_CHAT, payload } as Action);
export const getChat = (payload: any) => ({ type: GET_MESSAGE, payload } as Action);
export const fetchChat = (payload: any) => ({ type: FETCH_MESSAGE,payload } as Action);
export const addMessage = (payload: any) => ({ type: ADD_MESSAGE, payload } as Action);
export const messageLoading = (payload: any) => ({ type: MESSAGE_LOADING, payload } as Action);
export const messageError = (payload: any) => ({ type: MESSAGE_ERROR, payload } as Action);
export const sendMessage = (payload: any) => ({ type: SEND_MESSAGE, payload } as Action);

// I could add some of the actions here as a consolidated place for all global state and network update functions 

export const getChatMessages = (addr:string) => async (dispatch: Dispatch) => {
    dispatch(getChat(addr))
    
}
 
export const fetchChatMessages = (toAddr:string) => async (dispatch: Dispatch) => {
    dispatch(fetchChat({
        toAddr: toAddr
    }))
    let lastTimeMsg = "2006-01-02T15:04:05.000Z"
    lastTimeMsg = encodeURIComponent(lastTimeMsg)
    get(`getall_chatitems/${account}/${toAddr}/${lastTimeMsg}`)

} 