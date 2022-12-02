import { Dispatch } from '@reduxjs/toolkit';
import { Action } from 'redux'
import { get } from '@/services/api'
import { store } from '../store';
import { getUserWallet } from '../Auth/action';

export const SELECT_CHAT = "SELECT_CHAT";
export const GET_MESSAGE = "GET_MESSAGE";
export const FETCH_MESSAGE = "FETCH_MESSAGE";
export const ADD_MESSAGE = "ADD_MESSAGE";
export const MESSAGE_LOADING = "MESSAGE_LOADING";
export const MESSAGE_ERROR = "MESSAGE_ERROR";
export const SEND_MESSAGE = "SEND_MESSAGE";

// TODO: Use data models instead of any 
export const selectChat = (payload: any) => ({ type: SELECT_CHAT, payload } as Action);
export const getChatAct = (payload: any) => ({ type: GET_MESSAGE, payload } as Action);
export const fetchChatAct = (payload: any) => ({ type: FETCH_MESSAGE,payload } as Action);
export const addMessage = (payload: any) => ({ type: ADD_MESSAGE, payload } as Action);
export const messageLoading = (payload: any) => ({ type: MESSAGE_LOADING, payload } as Action);
export const messageError = (payload: any) => ({ type: MESSAGE_ERROR, payload } as Action);
export const sendMessage = (payload: any) => ({ type: SEND_MESSAGE, payload } as Action);

// I could add some of the actions here as a consolidated place for all global state and network update functions 

export const getChatMessages = (addr:string) => async (dispatch: Dispatch) => {
    dispatch(getChatAct(addr))
    const msgs = store.getState().chatting.messages
    if (msgs != null){
        console.log("Msgs in store")
        return
    }
    dispatch(fetchChatAct(true))
    const data = await fetchChatMessages(addr);
    if (data == null){
        return
    }
    console.log('✅[GET][Name]:', data)
    
    

    dispatch(fetchChatAct(false))
    
}

export const fetchMoreMsgs = (addr:string) => async (dispatch: Dispatch) => {

}

export const fetchChatMessages = async (toAddr:string)  => {
    const userAddr = getUserWallet()
    let lastTimeMsg = "2006-01-02T15:04:05.000Z"
    lastTimeMsg = encodeURIComponent(lastTimeMsg)
    try {
        return await get(`getall_chatitems/${userAddr}/${toAddr}/${lastTimeMsg}`);
    } catch (e) {
        console.error('🚨[GET][Chat items]:', e)
        return null
    }
} 