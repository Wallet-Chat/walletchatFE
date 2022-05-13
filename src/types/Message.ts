export default interface MessageType {
   streamID: string
   fromAddr: string
   toAddr: string
   timestamp: Date,
   read: boolean
   id?: number
}
