// import MessageType from './Message'

// export interface MessageUIType extends MessageType {
//    img?: string
//    position: string,
//    isFetching: boolean
// }

export default interface MessageUIType {
   message: string
   fromAddr: string
   toAddr: string
   timestamp: Date,
   read: boolean
   id?: number,
   img?: string,
   position: string,
   isFetching: boolean
   unread?: number
}
