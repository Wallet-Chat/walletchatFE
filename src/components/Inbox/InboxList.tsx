import { Box, Text, useEditable } from '@chakra-ui/react'
import { memo, useEffect, useState } from 'react'
import NFTInboxItem from './NFT/NFTInboxListItem'
import { InboxItemType } from '../../types/InboxItem'
import CommunityInboxItem from './Community/CommunityInboxListItem'
import StartConversationWithAddress from '../StartConversationWithAddress'
import DMInboxItem from './DM/DMInboxListItem'
import { POLLING_QUERY_OPTS, CHAT_CONTEXT_TYPES } from '@/constants'
import { getInboxDmDataForAccount, useGetInboxQuery } from '@/redux/reducers/dm'
import { useAppSelector } from '@/hooks/useSelector'
import { selectAccount } from '@/redux/reducers/account'
import { useUnreadCount } from '@/context/UnreadCountProvider'
import { useWallet } from '@/context/WalletProvider'
import { getJwtForAccount } from '@/helpers/jwt'
import equal from 'fast-deep-equal/es6'
import * as ENV from '@/constants/env'

const InboxList = ({
  context,
}: {
  context: (typeof CHAT_CONTEXT_TYPES)[number]
}) => {
  const account = useAppSelector((state) => selectAccount(state))
	// const { account, web3, isAuthenticated } = useWallet()
  const { unreadCount } = useUnreadCount()
  const storedData = getInboxDmDataForAccount(account)
  // const { currentData: fetchedData } = useGetInboxQuery(
  //   account,
  //   // unreadCount,
  //   POLLING_QUERY_OPTS
  // )
  // const inboxData: { [type: string]: InboxItemType } = fetchedData
  //   ? JSON.parse(fetchedData)
  //   : storedData
  
  const [inboxData, setInboxData] = useState<InboxItemType[]>(
    localStorage['inbox_' + account]
    ? JSON.parse(localStorage['inbox_' + account])
    : []
    )
    const [isFetchingInboxData, setIsFetchingInboxData] = useState(false)
    // const inboxList: InboxItemType[] = Object.values(inboxData[context])

  let semaphore = false
	useEffect(() => {
		const interval = setInterval(() => {
			getInboxData()
		}, 5000) // every 5s

		return () => clearInterval(interval)
	}, [account, inboxData])

	useEffect(() => {
		getInboxData()
	}, [unreadCount.dm > 0])

  const getInboxData = () => {
		// GET request to get off-chain data for RX user
		if (!ENV.REACT_APP_REST_API) {
			throw new Error('REST API url not in .env')
		}
		if (!account) {
			console.log('No account connected')
			return
		}
		if (semaphore) {
			//console.log('Don't perform re-entrant call')
			return
		}
		setIsFetchingInboxData(true)
		semaphore = true
		fetch(
			` ${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/get_inbox/${account}`,
			{
				method: 'GET',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${getJwtForAccount(account)}`,
				},
			}
		)
			.then((response) => response.json())
			.then(async (data: InboxItemType[]) => {
				if (data === null) {
					setInboxData([])
					localStorage['inbox_' + account] = JSON.stringify([])
				} else if (
					!localStorage['inboxEnc_' + account] ||
					equal(JSON.parse(localStorage['inboxEnc_' + account]), data) !==
						true
				) {
					console.log('✅[GET][Inbox]:', data)
					localStorage['inboxEnc_' + account] = JSON.stringify(data)

					const replica = JSON.parse(JSON.stringify(data))
					// Get data from LIT and replace the message with the decrypted text
					// for (let i = 0; i < replica.length; i++) {
					// 	if (replica[i].encrypted_sym_lit_key) {
					// 		replica[i].message = decryptMessageWithLit(replica[i])
					// 	}
					// }
					setInboxData(replica)
					//setInboxData(data)
					localStorage['inbox_' + account] = JSON.stringify(replica)
				} else {
					setInboxData(data)
				}
				setIsFetchingInboxData(false)
				semaphore = false
			})
			.catch((error) => {
				console.error('🚨[GET][Inbox]:', error)
				setIsFetchingInboxData(false)
				semaphore = false
			}) 
	}

  // TODO: use unread counts from unread count provider instead
  return (
    <Box className='custom-scrollbar' flex='1 1 0px' overflowY='scroll'>
      {inboxData?.map((conversation, i) => {
        if (conversation.context_type === 'nft' && context === 'nft') {
          return (
            <NFTInboxItem
              key={`${conversation.timestamp.toString()}${i}`}
              data={conversation}
              account={account}
            />
          )
        }
        if (conversation.context_type === 'community' && context === 'community') {
          return (
            <CommunityInboxItem
              key={`${conversation.timestamp.toString()}${i}`}
              data={conversation}
              account={account}
            />
          )
        }
        if (
          conversation.context_type === 'dm' && context === 'dm'
        ) {
          return (
            <DMInboxItem
              key={`${conversation.timestamp.toString()}${i}`}
              data={conversation}
              account={account}
            />
          )
        }
        return <Box></Box>
      })}
      {inboxData?.length === 0 && context === 'dm' && (
        <Box p={5}>
          <Text mb={4} fontSize='md'>
            You have no messages.
          </Text>
          <StartConversationWithAddress />
        </Box>
      )}
      {inboxData?.length === 0 && !(context === 'dm') && (
        <Box p={5} textAlign='center' d='block'>
          <Text mb={4} fontSize='md' color='darkgray.100'>
            You have not joined any group
          </Text>
        </Box>
      )}
    </Box>
  )
}

export default memo(InboxList)
