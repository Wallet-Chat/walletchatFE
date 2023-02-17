import { Box, Heading, Flex } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import Web3 from 'web3'
import equal from 'fast-deep-equal/es6'
import * as ENV from '@/constants/env'

import { InboxItemType } from '../../types/InboxItem'
import InboxList from '../../components/Inbox/InboxList'
import InboxListLoadingSkeleton from '../../components/Inbox/InboxListLoadingSkeleton'
import lit from '../../utils/lit'
// import InboxSearchInput from './components/InboxSearchInput'

const Inbox = ({
	account,
	web3,
	isAuthenticated,
}: {
	account: string
	web3: Web3
	isAuthenticated: boolean
}) => {
	const semaphore = React.useRef(false)

	const localStorageKey = `inbox_ ${account}`
	const localStorageValue = localStorage[localStorageKey]

	const [inboxData, setInboxData] = useState<InboxItemType[]>(
		localStorageValue ? JSON.parse(localStorageValue) : []
	)

	const communities = React.useMemo<InboxItemType[]>(
		() => inboxData.filter((d) => d.context_type === 'community'),
		[inboxData]
	)

	const [isFetchingInboxData, setIsFetchingInboxData] = useState(false)

	const getInboxData = React.useCallback(() => {
		// GET request to get off-chain data for RX user
		if (!ENV.REACT_APP_REST_API) {
			console.log('REST API url not in .env', ENV)
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
		if (semaphore.current) {
			// console.log('Don't perform re-entrant call')
			return
		}
		setIsFetchingInboxData(true)
		semaphore.current = true
		fetch(
			` ${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/get_inbox/${account}`,
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
					localStorage[localStorageKey] = JSON.stringify([])
				} else if (
					!localStorageValue ||
					equal(JSON.parse(localStorageValue), data) !== true
				) {
					console.log('✅[GET][Inbox]:', data)
					// setEncChatData(data)
					localStorage[localStorageKey] = JSON.stringify(data)

					const replica = JSON.parse(JSON.stringify(data))
					// Get data from LIT and replace the message with the decrypted text
					for (let i = 0; i < replica.length; i += 1) {
						if (replica[i].encrypted_sym_lit_key) {
							// only needed for mixed DB with plain and encrypted data
							const accessControlConditions = JSON.parse(
								replica[i].lit_access_conditions
							)

							console.log(
								'✅[POST][Decrypt GetInbox Message]:',
								replica[i],
								replica[i].encrypted_sym_lit_key,
								accessControlConditions
							)
							const blob = lit.b64toBlob(replica[i].message)
							// after change to include SC conditions, we had to change LIT accessControlConditions to UnifiedAccessControlConditions
							// this is done to support legacy messages (new databases wouldn't need this)
							if (
								String(replica[i].lit_access_conditions).includes('evmBasic')
							) {
								replica[i].message = lit.decryptString(
									blob,
									replica[i].encrypted_sym_lit_key,
									accessControlConditions
								)
								// replica[i].message = rawmsg.decryptedFile.toString()
							} else {
								replica[i].message = lit.decryptStringOrig(
									blob,
									replica[i].encrypted_sym_lit_key,
									accessControlConditions
								)
								// replica[i].message = rawmsg.decryptedFile.toString()
							}
						}
					}

					const finalResults: any[] = []
					await Promise.allSettled(replica).then((results) =>
						results.forEach((result: any) =>
							finalResults.push(result.message.decryptedFile.toString)
						)
					)

					setInboxData(finalResults)
					// setInboxData(data)
					localStorage[localStorageKey] = JSON.stringify(finalResults)
				}
				setIsFetchingInboxData(false)
				semaphore.current = false
			})
			.catch((error) => {
				console.error('🚨[GET][Inbox]:', error)
				setIsFetchingInboxData(false)
				semaphore.current = false
			})
	}, [account, isAuthenticated, localStorageKey, localStorageValue])

	useEffect(() => {
		getInboxData()

		const interval = setInterval(getInboxData, 5000) // every 5s

		return () => clearInterval(interval)
	}, [getInboxData])

	if (isFetchingInboxData && inboxData.length === 0) {
		return <InboxListLoadingSkeleton />
	}

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
				</Flex>
				{/* <InboxSearchInput /> */}
			</Box>

			<InboxList
				context='communities'
				data={communities}
				web3={web3}
				account={account}
			/>
		</Box>
	)
}

export default Inbox
