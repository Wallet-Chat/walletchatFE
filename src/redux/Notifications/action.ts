import { Action, Dispatch } from 'redux'

import { get } from '../../services/api'

// export const GET_UNREAD_CNT = "GET_UNREAD_CNT";
export const SET_UNREAD_CNT = "SET_UNREAD_CNT";
export const UNREAD_CNT_LOADING = "MESSAGE_LOADING";
export const UNREAD_CNT_ERROR = "MESSAGE_ERROR";

export const setUnreadCntsAction = (payload: any) => ({ type: SET_UNREAD_CNT, payload } as Action);
export const unreadCntLoadingAction = (payload: any) => ({ type: UNREAD_CNT_LOADING, payload } as Action);


export const getUnreadCnts = (chat: string) => async(dispatch: Dispatch) => {
    dispatch(unreadCntLoadingAction(true));

}

