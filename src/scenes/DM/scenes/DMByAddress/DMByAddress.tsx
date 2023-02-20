/* eslint-disable no-console */
import { Box, Flex, Spinner } from '@chakra-ui/react'
import React, { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { MessageUIType } from '../../../../types/Message'
import { DottedBackground } from '../../../../styled/DottedBackground'
import ChatMessage from '../../../../components/Chat/ChatMessage'
import DMHeader from './DMHeader'
import {
	useGetChatDataQuery,
	getLocalDmDataForAccountToAddr,
} from '@/redux/reducers/dm'
import Submit from './Submit'

const GET_CHATS_POLLING_INTERVAL = 5000 // 5 sec

const DMByAddress = ({
	account,
	delegate,
}: {
	account: string
	delegate: string
}) => {
	const { address: toAddr = '' } = useParams()

	const { data: fetchedData, isFetching } = useGetChatDataQuery(
		{ account, toAddr },
		{
			pollingInterval: GET_CHATS_POLLING_INTERVAL,
			refetchOnMountOrArgChange: true,
		}
	)
	const cachedChatData = getLocalDmDataForAccountToAddr(account, toAddr)
	const localChatData =
		fetchedData && !isFetching
			? fetchedData
			: (cachedChatData && JSON.stringify(cachedChatData)) || ''
	const chatData = localChatData ? JSON.parse(localChatData) : []

	const scrollToBottomRef = React.useRef<HTMLDivElement>(null)

	// since we are only loading new messages, we need to update read status async and even after we aren't get new messages
	// in the case its a while before a user reads the message
	// fetch(
	// 	` ${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/getread_chatitems/${account}/${toAddr}`,
	// 	getFetchOptions()
	// )
	// 	.then((response) => response.json())
	// 	.then(async (data: Int32Array[]) => {
	// 		const localRead = localStorage[localStorageKeyDmReadIDsToAddr]
	// 		if (localRead !== data) {
	// 			if (data.length > 0) {
	// 				let localData = localStorage[localStorageKeyDmDataToAddr]
	// 				if (localData) {
	// 					localData = JSON.parse(localData)
	// 					for (let j = 0; j < localData.length; j += 1) {
	// 						for (let i = 0; i < data.length; i += 1) {
	// 							if (localData[j].Id === data[i]) {
	// 								localData[j].read = true
	// 								break
	// 							}
	// 						}
	// 					}
	// 					setChatData(localData)
	// 					localStorage[localStorageKeyDmReadIDsToAddr] = data
	// 					localStorage[localStorageKeyDmDataToAddr] =
	// 						JSON.stringify(localData) // store so when user switches views, data is ready
	// 					console.log('✅[GET][Updated Read Items]:', data)
	// 				}
	// 			}
	// 		}
	// 	})
	// 	.catch((error) => {
	// 		console.error('🚨[GET][Update Read items]:', error)
	// 	})
	// }, [account, isAuthenticated, toAddr])

	const updateRead = useCallback(
		(data: MessageUIType) => {
			console.log('updateRead')
			let indexOfMsg = -1
			const newLoadedMsgs = [...chatData]
			for (let i = newLoadedMsgs.length - 1; i > 0; i -= 1) {
				if (newLoadedMsgs[i].timestamp === data.timestamp) {
					indexOfMsg = i
					break
				}
			}
			if (indexOfMsg !== -1) {
				newLoadedMsgs[indexOfMsg] = {
					...newLoadedMsgs[indexOfMsg],
					read: true,
				}
			}
		},
		[localChatData]
	)

	// TODO: if already has encrypted chats, show skeletons
	if (isFetching && chatData.length === 0) {
		return (
			<Flex background='white' height='100vh' flexDirection='column' flex='1'>
				<DMHeader />

				<DottedBackground className='custom-scrollbar'>
					<Flex
						justifyContent='center'
						alignItems='center'
						borderRadius='lg'
						background='green.200'
						p={4}
					>
						<Box fontSize='md'>
							Decrypting Your Messages, Please Wait and Do Not Refresh 😊
						</Box>
					</Flex>
					<Flex justifyContent='center' alignItems='center' height='100%'>
						<Spinner />
					</Flex>
					<Box ref={scrollToBottomRef} float='left' style={{ clear: 'both' }} />
				</DottedBackground>

				<Submit
					delegate={delegate}
					loadedMsgs={chatData}
					toAddr={toAddr}
					account={account}
					scrollToBottomRef={scrollToBottomRef}
				/>
			</Flex>
		)
	}

	return (
		<Flex background='white' height='100vh' flexDirection='column' flex='1'>
			<DMHeader />

			<DottedBackground className='custom-scrollbar'>
				{toAddr ===
					'0x17FA0A61bf1719D12C08c61F211A063a58267A19'.toLocaleLowerCase() && (
					<Flex
						justifyContent='center'
						alignItems='center'
						borderRadius='lg'
						background='green.200'
						p={4}
					>
						<Box fontSize='md'>
							We welcome all feedback and bug reports. Thank you! 😊
						</Box>
					</Flex>
				)}

				{chatData.map((msg: MessageUIType) => (
					<ChatMessage
						key={msg.Id}
						context='dms'
						account={account}
						msg={msg}
						updateRead={updateRead}
					/>
				))}

				<Box ref={scrollToBottomRef} float='left' style={{ clear: 'both' }} />
			</DottedBackground>

			<Submit
				delegate={delegate}
				loadedMsgs={chatData}
				toAddr={toAddr}
				account={account}
				scrollToBottomRef={scrollToBottomRef}
			/>
		</Flex>
	)
}

export default DMByAddress
