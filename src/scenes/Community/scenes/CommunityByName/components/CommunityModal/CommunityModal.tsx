import {
	CloseButton,
	Flex,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
	ModalOverlay,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'

import CommunityType from '../../../../../../types/Community'
import { IconArrowBack, IconDots, IconLogout } from '@tabler/icons'
import User from '../../../../../../types/User'
import CommunityModalLanding from './scenes/CommunityModalLanding'
import { useWallet } from '../../../../../../context/WalletProvider'
import { useNavigate, useParams } from 'react-router'
import CommunityModalEdit from './scenes/CommunityModalEdit'
import * as ENV from '@/constants/env'
import { getJwtForAccount } from '@/helpers/jwt'
import { useAppSelector } from '@/hooks/useSelector'
import {
  selectAccount,
  selectIsAuthenticated,
  setAccount,
} from '@/redux/reducers/account'

const CommunityModal = ({
	isOpen,
	onClose,
	communityData,
	getCommunityData,
}: {
	isOpen: boolean
	onClose: () => void
	communityData: CommunityType | undefined
	getCommunityData: () => void
}) => {
	let navigate = useNavigate()

	const account = useAppSelector((state) => selectAccount(state))
	const { community = '' } = useParams()
	const [pageState, setPageState] = useState<string>('')

	const [joined, setJoined] = useState<boolean | null>(null)
	const [isFetchingJoining, setIsFetchingJoining] = useState(false)

	useEffect(() => {
		if (communityData?.joined === true && joined !== true) {
			setJoined(true)
		} else if (communityData?.joined === false && joined !== false) {
			setJoined(false)
		}
	}, [communityData])

	const joinGroup = () => {
		if (!isFetchingJoining) {
			setIsFetchingJoining(true)
			fetch(
				` ${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/create_bookmark`,
				{
					method: 'POST',
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${getJwtForAccount(account)}`,
					},
					body: JSON.stringify({
						walletaddr: account,
						nftaddr: community,
					}),
				}
			)
				.then((response) => response.json())
				.then((response) => {
					console.log('✅[POST][Community][Join]', response)
					setJoined(true)
				})
				.catch((error) => {
					console.error('🚨[POST][Community][Join]:', error)
				})
				.then(() => {
					setIsFetchingJoining(false)
				})
		}
	}

	const leaveGroup = () => {
		if (!isFetchingJoining) {
			setIsFetchingJoining(true)
			fetch(
				` ${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/delete_bookmark`,
				{
					method: 'POST',
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${getJwtForAccount(account)}`,
					},
					body: JSON.stringify({
						walletaddr: account,
						nftaddr: community,
					}),
				}
			)
				.then((response) => response.json())
				.then((response) => {
					console.log('✅[POST][Community][Leave]', response)
					setJoined(false)
					onClose()
					navigate('/community')
				})
				.catch((error) => {
					console.error('🚨[POST][Community][Leave]:', error)
				})
				.then(() => {
					setIsFetchingJoining(false)
				})
		}
	}

	return (
		<Modal isOpen={isOpen} onClose={onClose} size='sm'>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader d='flex' alignItems='center'>
					<CloseButton
						position='relative'
						mr={2}
						style={{
							display: pageState !== '' ? 'unset' : 'none',
						}}
						onClick={() => setPageState('')}
					>
						<Flex justifyContent='center'>
							<IconArrowBack strokeWidth={1.5} />
						</Flex>
					</CloseButton>
					Community Info
				</ModalHeader>
				<ModalCloseButton />
				<Menu>
					<MenuButton
						as={CloseButton}
						position='absolute'
						top={2}
						right={12}
						style={{
							display: pageState === '' ? 'unset' : 'none',
						}}
					>
						<Flex justifyContent='center'>
							<IconDots strokeWidth={1.5} />
						</Flex>
					</MenuButton>

					<MenuList>
						<MenuItem
							fontSize='md'
							color='red.600'
							icon={
								<IconLogout
									strokeWidth={1.5}
									size='20'
									color='var(--chakra-colors-red-600)'
								/>
							}
							onClick={() => {
								if (joined === false) {
									joinGroup()
								} else if (joined === true) {
									leaveGroup()
								}
							}}
						>
							Leave group
						</MenuItem>
					</MenuList>
				</Menu>
				<ModalBody px={0}>
					{pageState === '' && (
						<CommunityModalLanding
							communityData={communityData}
							setPageState={setPageState}
						/>
					)}
					{pageState === 'edit' && (
						<CommunityModalEdit
							communityData={communityData}
							getCommunityData={getCommunityData}
							setPageState={setPageState}
						/>
					)}
				</ModalBody>
			</ModalContent>
		</Modal>
	)
}

export default CommunityModal
