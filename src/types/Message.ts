export default interface MessageType {
   message: string
   fromAddr: string
   toAddr: string
   timestamp: Date,
   read: boolean
   id?: number
}
