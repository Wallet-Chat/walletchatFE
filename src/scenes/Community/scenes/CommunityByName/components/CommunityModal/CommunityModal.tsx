import {
	Avatar,
	Box,
	Button,
	CloseButton,
	Flex,
	Heading,
	Input,
	InputGroup,
	InputLeftElement,
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
	Spinner,
	Text,
	useToast,
} from '@chakra-ui/react'
import pluralize from 'pluralize'
import { ChangeEvent, useEffect, useState } from 'react'
import { useParams } from 'react-router'
import Resizer from 'react-image-file-resizer'
import { FixedSizeList as List } from 'react-window'

import { useWallet } from '../../../../../../context/WalletProvider'
import CommunityType from '../../../../../../types/Community'
import {
	IconDots,
	IconLogout,
	IconPhoto,
	IconSearch,
	IconUsers,
} from '@tabler/icons'
import CommunityModalMember from '../CommunityModalMember'
import { useDebounce } from '../../../../../../hooks/useDebounce'
import User from '../../../../../../types/User'

const CommunityModal = ({
	isOpen,
	onClose,
	communityData,
}: {
	isOpen: boolean
	onClose: () => void
	communityData: CommunityType | undefined
}) => {
	const { community = '' } = useParams()
	const { account } = useWallet()

	const [searchTerm, setSearchTerm] = useState<string>('')
	const debouncedSearchTerm: string = useDebounce<string>(searchTerm, 500)
	const [filteredMembers, setFilteredMembers] = useState<User[]>(
		communityData?.members ? communityData.members : []
	)

	const [joined, setJoined] = useState<boolean | null>(null)
	const [isFetchingJoining, setIsFetchingJoining] = useState(false)

	const [file, setFile] = useState<Blob | MediaSource>()
	const [filePreview, setFilePreview] = useState('')
	const [isFetchingAvatar, setIsFetchingAvatar] = useState(false)
	const [isSuccessAvatar, setIsSuccessAvatar] = useState(false)
	const toast = useToast()

	useEffect(() => {
		if (communityData?.joined === true && joined !== true) {
			setJoined(true)
		} else if (communityData?.joined === false && joined !== false) {
			setJoined(false)
		}
		if (communityData?.members) {
			setFilteredMembers(communityData.members)
		}
	}, [communityData])

	const joinGroup = () => {
		if (!isFetchingJoining) {
			setIsFetchingJoining(true)
			fetch(
				`${process.env.REACT_APP_REST_API}/${process.env.REACT_APP_API_VERSION}/create_bookmark`,
				{
					method: 'POST',
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${localStorage.getItem('jwt')}`,
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
				` ${process.env.REACT_APP_REST_API}/${process.env.REACT_APP_API_VERSION}/delete_bookmark`,
				{
					method: 'POST',
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${localStorage.getItem('jwt')}`,
					},
					body: JSON.stringify({
						walletaddr: account,
						nftaddr: community,
					}),
				}
			)
				.then((response) => response.json())
				.then((count: number) => {
					console.log('✅[POST][Community][Leave]')
					setJoined(false)
				})
				.catch((error) => {
					console.error('🚨[POST][Community][Leave]:', error)
				})
				.then(() => {
					setIsFetchingJoining(false)
				})
		}
	}

	useEffect(
		() => {
			if (
				debouncedSearchTerm &&
				communityData?.members &&
				communityData?.members?.length > 0
			) {
				setFilteredMembers(
					communityData.members.filter(
						(m) =>
							m.name.includes(debouncedSearchTerm) ||
							m.address.includes(debouncedSearchTerm)
					)
				)
			} else {
				setFilteredMembers([])
			}
		},
		[debouncedSearchTerm] // Only call effect if debounced search term changes
	)

	const resizeFile = (file: Blob) =>
		new Promise((resolve) => {
			Resizer.imageFileResizer(
				file,
				64,
				64,
				'JPEG',
				100,
				0,
				(uri) => {
					resolve(uri)
				},
				'base64'
			)
		})

	useEffect(() => {
		// create the preview
		if (file) {
			const objectUrl = URL.createObjectURL(file)
			setFilePreview(objectUrl)

			// free memory whenever this component is unmounted
			return () => URL.revokeObjectURL(objectUrl)
		}
	}, [file])

	const upload = async (e: ChangeEvent<HTMLInputElement>) => {
		console.warn(e.target.files)
		const files = e.target.files
		if (files && files.length !== 0) {
			setFile(files[0])
			const image = await resizeFile(files[0])

			setIsFetchingAvatar(true)
			if (isSuccessAvatar) {
				setIsSuccessAvatar(false)
			}

			if (!community) {
				console.log('Missing community name')
				return
			}

			fetch(
				` ${process.env.REACT_APP_REST_API}/${process.env.REACT_APP_API_VERSION}/image`,
				{
					method: 'PUT',
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${localStorage.getItem('jwt')}`,
					},
					body: JSON.stringify({
						base64data: image,
						addr: community,
					}),
				}
			)
				.then((response) => response.json())
				.then((response) => {
					console.log('✅[POST][Image]:', response)
					toast({
						title: 'Success',
						description: 'Community avatar updated',
						status: 'success',
						position: 'top',
						duration: 2000,
						isClosable: true,
					})
					setIsSuccessAvatar(true)
				})
				.catch((error) => {
					console.error('🚨[POST][Image]:', error)
					toast({
						title: 'Error',
						description: `Image Not Updated - Unknown error`,
						status: 'error',
						position: 'top',
						duration: 2000,
						isClosable: true,
					})
				})
				.then(() => {
					setIsFetchingAvatar(false)
				})
		}
	}

	return (
		<Modal isOpen={isOpen} onClose={onClose} size='sm'>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>Community Info</ModalHeader>
				<ModalCloseButton />
				<Menu>
					<MenuButton
						as={CloseButton}
						position='absolute'
						top={2}
						right={12}
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
					<Box px={6}>
						<Flex
							alignItems='center'
							justifyContent='space-between'
							p={2}
							borderRadius='md'
							flex='1'
						>
							<Flex>
								<label
									style={{
										pointerEvents: isFetchingAvatar ? 'none' : 'auto',
									}}
								>
									<Avatar
										size='md'
										name={communityData?.name}
										src={
											isSuccessAvatar
												? filePreview
												: communityData?.logo
										}
										mr={1}
										cursor='pointer'
										overflow='hidden'
										data-group
									>
										<input
											type='file'
											onChange={(e) => upload(e)}
											name='img'
											style={{
												position: 'absolute',
												opacity: '0',
											}}
										/>
										{isFetchingAvatar && (
											<Flex
												background='rgba(0,0,0,0.5)'
												position='absolute'
												bottom='0%'
												width='100%'
												height='100%'
												borderRadius='50%'
												justifyContent='center'
												alignItems='center'
											>
												<Spinner color='gray.500' size='sm' />
											</Flex>
										)}
										<Flex
											background='gray.300'
											position='absolute'
											bottom='0%'
											width='100%'
											justifyContent='center'
											py={0.5}
											px={1}
											transform='translateY(100%)'
											transition='transform 0.2s ease-in-out'
											_groupHover={{
												transform: 'translateY(0)',
											}}
										>
											<IconPhoto
												color='black'
												size={20}
												strokeWidth={1.5}
											/>
										</Flex>
									</Avatar>
								</label>
								<Box px={2}>
									<Box>
										{communityData?.name && (
											<Flex alignItems='center' d='inline-flex'>
												<Heading
													size='md'
													mr='1'
													maxWidth={[140, 140, 200, 300]}
													overflow='hidden'
													textOverflow='ellipsis'
													whiteSpace='nowrap'
												>
													{communityData.name}
												</Heading>
											</Flex>
										)}
									</Box>
									<Box>
										{communityData?.member_count && (
											<Box>
												<Text fontSize='md' color='darkgray.300'>
													{communityData.member_count}{' '}
													{pluralize(
														'member',
														communityData?.member_count
													)}
												</Text>
											</Box>
										)}
									</Box>
								</Box>
							</Flex>
							<Button variant='outline' size='xs'>
								Edit group
							</Button>
						</Flex>
					</Box>
					<Box
						height='2'
						background='lightgray.400'
						borderTopWidth={1}
						borderTopColor='gray.300'
					></Box>

					<Box py={3}>
						<Flex
							alignItems='center'
							mb={2}
							px={6}
							justifyContent='space-between'
						>
							<Flex alignItems='center'>
								<Box flex='0 0 30px'>
									<IconUsers strokeWidth={1.5} size={20} />
								</Box>
								<Text fontSize='md' flexGrow={1} mr={3}>
									Members
								</Text>
							</Flex>
							<InputGroup
								size='sm'
								role='group'
								width='fit-content'
								_groupFocus={{ width: '100%' }}
							>
								<InputLeftElement
									pointerEvents='none'
									color='gray.300'
									fontSize='1.2em'
								>
									<IconSearch size={20} />
								</InputLeftElement>
								<Input
									size='sm'
									onChange={(e) => setSearchTerm(e.target.value)}
									border='none'
									width='fit-content'
									_groupFocus={{
										border: 'unset',
									}}
								/>
							</InputGroup>
						</Flex>

						{filteredMembers.length > 1 && (
							<Box height='300px'>
								<List
									width='100%'
									height={300}
									itemSize={55}
									itemCount={filteredMembers.length}
									className='custom-scrollbar'
								>
									{({ index, style }) => (
										<CommunityModalMember
											member={filteredMembers[index]}
											style={style}
										/>
									)}
								</List>
							</Box>
						)}
					</Box>
				</ModalBody>
			</ModalContent>
		</Modal>
	)
}

export default CommunityModal
