import { Box, Heading, Flex, Button } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { Link } from 'react-router-dom'
import equal from 'fast-deep-equal/es6'

import { InboxItemType } from '../../../../types/InboxItem'
import { useUnreadCount } from '../../../../context/UnreadCountProvider'
import InboxSearchInput from '../../components/InboxSearchInput'
import InboxList from '../../../../components/Inbox/InboxList'
import { useWallet } from '../../../../context/WalletProvider'
import { decryptMessageWithLit } from '../../../../helpers/decryptMessageWithLit'

const DMInboxList = () => {
	const { account, web3, isAuthenticated } = useWallet()

	const [inboxData, setInboxData] = useState<InboxItemType[]>(
		localStorage['inbox_' + account]
			? JSON.parse(localStorage['inbox_' + account])
			: []
	)
	const [encryptedChatData, setEncChatData] = useState<InboxItemType[]>(
		localStorage['inboxEnc_' + account]
			? JSON.parse(localStorage['inboxEnc_' + account])
			: []
	)
	const [isFetchingInboxData, setIsFetchingInboxData] = useState(false)
	const [dms, setDms] = useState<InboxItemType[]>()
	const [communities, setCommunities] = useState<InboxItemType[]>()
	const { unreadCount } = useUnreadCount()

	let semaphore = false

	useEffect(() => {
		const interval = setInterval(() => {
			getInboxData()
		}, 5000) // every 5s

		return () => clearInterval(interval)
	}, [isAuthenticated, account, inboxData])

	useEffect(() => {
		setDms(
			inboxData.filter(
				(d) => d.context_type === 'dm' && !(d.chain === 'none')
			)
		)
		setCommunities(
			inboxData.filter(
				(d) => d.context_type === 'community' && !(d.chain === 'none')
			)
		)
	}, [inboxData])

	useEffect(() => {
		getInboxData()
	}, [isAuthenticated, account])

	const getInboxData = () => {
		// GET request to get off-chain data for RX user
		if (!process.env.REACT_APP_REST_API) {
			console.log('REST API url not in .env', process.env)
			return
		}
		if (!account) {
			console.log('No account connected')
			return
		}
		if (!isAuthenticated) {
			console.log('Not authenticated')
			return
		}
		if (semaphore) {
			//console.log('Don't perform re-entrant call')
			return
		}
		setIsFetchingInboxData(true)
		semaphore = true
		fetch(
			` ${process.env.REACT_APP_REST_API}/${process.env.REACT_APP_API_VERSION}/get_inbox/${account}`,
			{
				method: 'GET',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${localStorage.getItem('jwt')}`,
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
					//setEncChatData(data)
					localStorage['inboxEnc_' + account] = JSON.stringify(data)

					const replica = JSON.parse(JSON.stringify(data))
					// Get data from LIT and replace the message with the decrypted text
					for (let i = 0; i < replica.length; i++) {
						if (replica[i].encrypted_sym_lit_key) {
							replica[i].message = decryptMessageWithLit(replica[i])
						}
					}
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
			<Box
				px={5}
				pt={5}
				pb={3}
				pos='sticky'
				top='0'
				background='white'
				zIndex='sticky'
			>
				<Flex justifyContent='space-between' mb={2}>
					<Heading size='lg'>Wallet-to-wallet chat</Heading>
					<Button
						as={Link}
						to='/dm/new'
						size='sm'
						variant='outline'
						_hover={{
							textDecoration: 'none',
							backgroundColor: 'var(--chakra-colors-lightgray-300)',
						}}
					>
						+ New
					</Button>
				</Flex>
				<InboxSearchInput />
			</Box>

			<InboxList context='dms' data={dms} web3={web3} account={account} />
		</Box>
	)
}

export default DMInboxList
