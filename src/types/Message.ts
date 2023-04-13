import { Encrypted } from 'eth-crypto'

export interface CreateChatMessageType {
  message: string
  fromaddr: string
  toaddr: string
  nftid: string
  lit_access_conditions: string
  encrypted_sym_lit_key: string
}

export interface ChatMessageType {
  Id: number
  fromaddr: string
  toaddr: string
  timestamp: string
  timestamp_dtm: string
  read: boolean
  message: string
  nftaddr: string
  nftid: string
  sender_name: string
  encrypted_sym_lit_key: string
  lit_access_conditions: string
}

export type InboxContextTypes = 'dm' | 'community' | 'nft'

export interface InboxMessageType extends ChatMessageType {
  unread: number
  type: string
  context_type: InboxContextTypes
  name: string
  logo: string
  chain: string
}

// export default interface MessageType {
//    message: string
//    fromAddr: string
//    toAddr: string
//    timestamp: Date,
//    read: boolean
//    id?: number
// }

interface MessageSkeletonType {
  sender_name?: string // name of sender
  type?: string
  context_type?: string
  message: string
  fromaddr: string
  timestamp: string
  read: boolean
  id?: number
  position: string
}

export interface MessageType extends MessageSkeletonType {
  toaddr: string
  nftaddr: string
  nftid: string
}

export interface GroupMessageType extends MessageSkeletonType {
  nftaddr: string
}

export interface MessageUIType {
  Id: number
  sender_name?: string // name of sender
  message?: string
  fromaddr?: string
  toaddr?: string
  timestamp: string
  read?: boolean
  id?: number
  img?: string
  position?: string
  isFetching?: boolean
  unread?: number
  nftAddr?: string | null
  nftId?: string | null
  type?: string
  context_type?: string
  name?: string
  logo?: string
}

export interface MessageUIDataType {
  [key: string]: MessageUIType[]
}

export interface SettingsType {
  walletaddr: string
  publickey: string
}

export interface PfpType {
  walletaddr: string
  imageB64: string
}

export interface EncryptedMsgBlock {
  to: Encrypted
  from: Encrypted
}
