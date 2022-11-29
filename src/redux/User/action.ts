import { Action, Dispatch } from 'redux'
import { store } from '../store'
import { getUserWallet } from "../Auth/action"

import { get } from '@/services/api'

export const SET_NAME = 'SET_NAME';
export const SET_EMAIL = 'SET_EMAIL';
export const GET_NAME = 'GET_NAME';
export const FETCH_NAME = "FETCH_NAME";


export const fetchNameAct = (payload: any) => ({ type: FETCH_NAME,payload } as Action);
export const getNameAct = (payload: any) => ({ type: GET_NAME,payload } as Action);
export const setNameAct = (payload: any) => ({ type: SET_NAME,payload } as Action);


// Has Dispatch suffix to differentitate between just retrieving directly from store.
export const getNameDispatch = () => async (dispatch: Dispatch) => {
    dispatch(getNameAct(null))
    const name = store.getState().user.name
    if (name != null){
        console.log("Name already fetched!")
        return name
    }
    dispatch(fetchNameAct(true))
    const data =  await fetchName()
    console.log('✅[GET][Name]:', data)
    if (data[0]?.name) {
        let name = data[0]?.name
        dispatch(setNameAct(name))
    }
    dispatch(fetchNameAct(false))
}

const fetchName = async () => {
    const userAddr = getUserWallet()
    if (!process.env.REACT_APP_REST_API) {
        console.log('REST API url not in .env', process.env)
        return null
     }
    if (!userAddr){
        console.log('No account connected')
        return null
    }
    try {
        return await get(`name/${userAddr}`);
    } catch (e) {
        console.error('🚨[GET][Name]:', e)
    }
}