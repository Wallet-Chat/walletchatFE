import { Box, Button, Flex, Heading } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import equal from 'fast-deep-equal/es6'
import { Link } from 'react-router-dom'

import InboxList from '../../../../components/Inbox/InboxList'
import { InboxItemType } from '../../../../types/InboxItem'
import { useWallet } from '../../../../context/WalletProvider'
import { useUnreadCount } from '@/context/UnreadCountProvider'

const CommunityInboxList = () => {
	// const { account, isAuthenticated } = useWallet()
	// const { unreadCount } = useUnreadCount()

	// const [inboxData, setInboxData] = useState<InboxItemType[]>(
	// 	localStorage['inbox_' + account]
	// 		? JSON.parse(localStorage['inbox_' + account])
	// 		: []
	// )
	// const [isFetchingInboxData, setIsFetchingInboxData] = useState(false)
	// const [communities, setCommunities] = useState<InboxItemType[]>()

	// let semaphore = false
	// useEffect(() => {
	// 	const interval = setInterval(() => {
	// 		getInboxData()
	// 	}, 5000) // every 5s

	// 	return () => clearInterval(interval)
	// }, [isAuthenticated, account, inboxData])

	// useEffect(() => {
	// 	setCommunities(inboxData.filter((d) => d.context_type === 'community'))
	// }, [inboxData])

	// useEffect(() => {
	// 	getInboxData()
	// }, [unreadCount.dm])

	// const getInboxData = () => {
	// 	// GET request to get off-chain data for RX user
	// 	if (!ENV.REACT_APP_REST_API) {
	// 		throw new Error('REST API url not in .env')
	// 	}
	// 	if (!account) {
	// 		console.log('No account connected')
	// 		return
	// 	}
	// 	if (!isAuthenticated) {
	// 		console.log('Not authenticated')
	// 		return
	// 	}
	// 	if (semaphore) {
	// 		//console.log('Don't perform re-entrant call')
	// 		return
	// 	}
	// 	setIsFetchingInboxData(true)
	// 	semaphore = true
	// 	fetch(
	// 		` ${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/get_inbox/${account}`,
	// 		{
	// 			method: 'GET',
	// 			credentials: 'include',
	// 			headers: {
	// 				'Content-Type': 'application/json',
	// 				Authorization: `Bearer ${getJwtForAccount(account)}`,
	// 			},
	// 		}
	// 	)
	// 		.then((response) => response.json())
	// 		.then(async (data: InboxItemType[]) => {
	// 			if (data === null) {
	// 				setInboxData([])
	// 				localStorage['inbox_' + account] = JSON.stringify([])
	// 			} else if (
	// 				!localStorage['inboxEnc_' + account] ||
	// 				equal(JSON.parse(localStorage['inboxEnc_' + account]), data) !==
	// 					true
	// 			) {
	// 				console.log('✅[GET][Inbox]:', data)
	// 				//setEncChatData(data)
	// 				localStorage['inboxEnc_' + account] = JSON.stringify(data)

	// 				const replica = JSON.parse(JSON.stringify(data))
	// 				// Get data from LIT and replace the message with the decrypted text
	// 				for (let i = 0; i < replica.length; i++) {
	// 					if (replica[i].encrypted_sym_lit_key) {
	// 						replica[i].message = decryptMessageWithLit(replica[i])
	// 					}
	// 				}
	// 				setInboxData(replica)
	// 				//setInboxData(data)
	// 				localStorage['inbox_' + account] = JSON.stringify(replica)
	// 			} else {
	// 				setInboxData(data)
	// 			}
	// 			setIsFetchingInboxData(false)
	// 			semaphore = false
	// 		})
	// 		.catch((error) => {
	// 			console.error('🚨[GET][Inbox]:', error)
	// 			setIsFetchingInboxData(false)
	// 			semaphore = false
	// 		})
	// }

	// if (isFetchingInboxData && inboxData.length === 0) {
	//    return <InboxListLoadingSkeleton />
	// }
	return (
		<Box
			background='white'
			height={isMobile ? 'unset' : '100vh'}
			borderRight='1px solid var(--chakra-colors-lightgray-400)'
			width='360px'
			maxW='100%'
			overflowY='scroll'
			className='custom-scrollbar'
		>
			<Box px={5} pt={5} pb={3} pos='sticky' top='0' background='white'>
				<Flex justifyContent='space-between' mb={2}>
					<Heading size='lg'>Communities</Heading>
					<Button
						as={Link}
						to='/community/new'
						size='sm'
						variant='outline'
						_hover={{
							textDecoration: 'none',
							backgroundColor: 'var(--chakra-colors-lightgray-300)',
						}}
					>
						+ Create
					</Button>
				</Flex>
			</Box>

			<InboxList
				context='community'
				// community={communities}
				// // web3={web3}
				// // account={account}
			/>
		</Box>
	)
}

export default CommunityInboxList
