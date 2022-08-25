import { truncateAddress } from '../../../helpers/truncateString'
import { InboxItemType } from '../../../types/InboxItem'
import InboxItem from '../InboxListItem'

const CommunityInboxItem = ({
   data,
   account,
}: {
   data: InboxItemType
   account: string
}) => {
   let recipientAddress = ''
   if (data?.toaddr && data?.fromaddr) {
      recipientAddress =
         data.toaddr.toLocaleLowerCase() === account.toLocaleLowerCase()
            ? data.fromaddr.toLocaleLowerCase()
            : data.toaddr.toLocaleLowerCase()
   }

   let displayName = ''

   if (data?.sender_name && data?.sender_name !== '') {
      displayName = data.sender_name
   } else if (data?.name && data?.name !== '') {
      displayName = data.name
   } else {
      displayName = truncateAddress(recipientAddress) || ''
   }

   return (
      <InboxItem
         displayName={displayName}
         url={data.context_type === 'community'
            ? `/community/${data.nftaddr}`
            : `/dm/${recipientAddress}`
         }
         image={data?.logo}
         latestMessage={data?.message}
         timestamp={data?.timestamp}
         unread={data?.unread || 0}
         address={recipientAddress}
      />
   )
}

export default CommunityInboxItem
