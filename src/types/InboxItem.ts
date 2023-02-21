export interface InboxItemType {
  id?: number
  type?: string
  context_type: string
  poap?: boolean
  timestamp: string
  read?: boolean
  unread?: number
  message?: string
  name?: string
  logo?: string

  fromaddr: string
  toaddr: string
  sender_name?: string
  chain?: string
  encrypted_sym_lit_key?: string
  lit_access_conditions?: string

  nftaddr: string
  nftid?: string | null
}
