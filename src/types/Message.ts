// export default interface MessageType {
//    message: string
//    fromAddr: string
//    toAddr: string
//    timestamp: Date,
//    read: boolean
//    id?: number
// }

export default interface MessageType {
   message: string
   fromaddr: string
   toaddr: string
   timestamp: Date,
   read: boolean
   id?: number
}

export default interface SettingsType {
   walletaddr: string
   publickey: string
}
