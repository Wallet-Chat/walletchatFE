export default interface MessageType {
   streamID: string
   fromName: string
   fromAddr: string
   toAddr: string
   timestamp: Date,
   read: boolean
   id: number
}
