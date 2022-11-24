import { get } from "@/services/api"

export const fetchUnreadCnts = async(account: string, chat: string) => {
    let res = await get(`/unreadcount/${account}`)
    
}
