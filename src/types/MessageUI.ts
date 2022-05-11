import MessageType from './Message'

export interface MessageUIType extends MessageType {
   img?: string
   position: string,
   isFetching: boolean
}
