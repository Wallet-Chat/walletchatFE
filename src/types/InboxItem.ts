export interface InboxItemType {
    id?: number,
    type?: string,
    context_type?: string,
    timestamp: string,
    read?: boolean
    unread?: number
    message?: string
    name?: string
    logo?: string

    fromaddr?: string
    toaddr?: string
    sender_name?: string

    nftaddr?: string | null,
    nftid?: string | null,
 }