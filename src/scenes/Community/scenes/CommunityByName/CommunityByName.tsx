import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  Image,
  Link,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react'
import {
	IconBrandTwitter,
	IconCircleCheck,
	IconChevronDown,
	IconExternalLink,
} from '@tabler/icons'
import { useEffect, useState } from 'react'
import { useParams, NavLink, Route, Routes, useMatch } from 'react-router-dom'
import equal from 'fast-deep-equal/es6'
import * as ENV from '@/constants/env'

import CommunityGroupChat from './components/CommunityGroupChat'
import CommunityTweets from './components/CommunityTweets'
import { useHover } from '../../../../helpers/useHover'
import IconDiscord from '../../../../images/icon-products/icon-discord.svg'
import CommunityType from '../../../../types/Community'
import { getJwtForAccount } from '@/helpers/jwt'
import { selectAccount } from '@/redux/reducers/account'
import { useAppSelector } from '@/hooks/useSelector'
import { log } from '@/helpers/log'
import CommunityModal from './components/CommunityModal'
import pluralize from 'pluralize'

const CommunityByName = () => {
  const account = useAppSelector((state) => selectAccount(state))

	let { community = '' } = useParams()
	const match = useMatch('/community/:community/*')

  const [communityData, setCommunityData] = useState<CommunityType>()
  const [
    isFetchingCommunityDataFirstTime,
    setIsFetchingCommunityDataFirstTime,
  ] = useState(true)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [joined, setJoined] = useState<boolean | null>(null)
  const [joinBtnIsHovering, joinBtnHoverProps] = useHover()
  const [isFetchingJoining, setIsFetchingJoining] = useState(false)

  useEffect(() => {
    getCommunityData()
  }, [account, community])

  useEffect(() => {
    // Interval needs to reset else getChatData will use old state
    const interval = setInterval(() => {
      getCommunityData()
    }, 5000) // every 5s

    return () => {
      clearInterval(interval)
    }
  }, [communityData, account])

  const getCommunityData = () => {
    if (account) {
      if (!account) {
        log('No account connected')
        return
      }
      fetch(
        `${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/community/${community}/${account}`,
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
        .then(async (data: CommunityType) => {
					if (
						!equal(data?.messages, communityData?.messages) ||
						!equal(data?.name, communityData?.name) ||
						!equal(data?.social?.length, communityData?.social?.length)
					) {
            log('✅[GET][Community]:', data)
            setCommunityData({
              ...data,
              twitter: data?.social?.find((i) => i.type === 'twitter')
                ?.username,
              discord: data?.social?.find((i) => i.type === 'discord')
                ?.username,
            })
          }
        })
        .catch((error) => {
          console.error('🚨[GET][Community]:', error)
        })
        .finally(() => {
          if (isFetchingCommunityDataFirstTime) {
            setIsFetchingCommunityDataFirstTime(false)
          }
        })
    }
  }

	return (
		<Flex flexDirection='column' background='white' height='100vh' flex='1'>
			<Flex
				alignItems='center'
				px={5}
				py={2}
				borderBottomWidth={1}
				borderBottomColor='lightgray.300'
			>
				<Flex
					justifyContent='space-between'
					width='100%'
					alignItems='center'
				>
					<Flex alignItems='flex-start' p={2} borderRadius='md' flex='1'>
						<Avatar
							size='md'
							name={communityData?.name}
							src={communityData?.logo}
							mr={1}
							overflow='hidden'
							data-group
						/>
						<Box>
							<Button
								onClick={onOpen}
								display='inline-flex'
								textAlign='unset'
								height='unset'
								py={1}
								lineHeight='unset'
								flex='1'
								alignItems='center'
								background='white'
								_hover={{
									border: 'none',
									background: 'gray.100',
								}}
								rightIcon={<IconChevronDown size={20} />}
							>
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
							</Button>
							<Box px={4}>
								{communityData?.member_count && (
									<Box>
										<Text fontSize='md'>
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

					<Flex py={2}>
						{communityData?.discord && (
							<Tooltip
								label={
									<Flex>
										<Box mr={1}>Discord</Box>{' '}
										<IconExternalLink strokeWidth={1.5} size={15} />
									</Flex>
								}
							>
								<Button
									as={Link}
									href={`https://www.discord.gg/${communityData.discord}`}
									target='_blank'
									d='flex'
									textAlign='center'
									p={0}
									width='2rem'
									minWidth='unset'
									height='2rem'
									mr={1}
									borderRadius='50%'
									borderWidth={1}
									borderColor='gray.300'
									background='white'
								>
									<Image
										src={IconDiscord}
										alt=''
										height='22px'
										width='22px'
									/>
								</Button>
							</Tooltip>
						)}
						{communityData?.twitter && (
							<Tooltip
								label={
									<Flex>
										<Box mr={1}>Twitter</Box>{' '}
										<IconExternalLink strokeWidth={1.5} size={15} />
									</Flex>
								}
							>
								<Button
									as={Link}
									href={`https://twitter.com/${communityData?.twitter}`}
									target='_blank'
									d='flex'
									textAlign='center'
									p={0}
									width='2rem'
									minWidth='unset'
									height='2rem'
									mr={1}
									borderRadius='50%'
									borderWidth={1}
									borderColor='gray.300'
									background='white'
								>
									<IconBrandTwitter
										stroke={1.5}
										size='20'
										color='transparent'
										fill='var(--chakra-colors-lightgray-800)'
									/>
								</Button>
							</Tooltip>
						)}
					</Flex>
				</Flex>
			</Flex>

			<Box
				display='flex'
				overflowY='auto'
				flexGrow={1}
				background='lightgray.200'
			>
				{/* <Box
					bg='lightgray.100'
					p={2}
					borderRightWidth={1}
					borderRightColor='lightgray.300'
				>
					<Button
						as={NavLink}
						end
						to={`${match?.pathnameBase}`}
						relative='path'
						size='sm'
						fontWeight='bold'
						fontSize='md'
						d='block'
						variant='translucent80'
						background='transparent'
						mb={1}
						px={3}
						py={1.5}
						lineHeight='unset'
						color='darkgray.500'
						_hover={{
							textDecor: 'none',
							background: 'lightgray.400',
							color: 'darkgray.800',
						}}
						_activeLink={{
							background: 'lightgray.400',
							color: 'darkgray.600',
							_before: {
								opacity: 1,
							},
						}}
						_before={{
							content: '""',
							opacity: 0,
							display: 'inline-block',
							position: ' absolute',
							top: '50%',
							left: '0.2rem',
							width: '.25rem',
							height: '.25rem',
							borderRadius: '50%',
							background: 'lightgray.700',
							transform: 'translateY(-50%)',
						}}
					>
						Chat
					</Button>
					{communityData?.tweets && communityData.tweets.length > 0 ? (
						<Button
							as={NavLink}
							to={`${match?.pathnameBase}/tweets`}
							relative='path'
							size='sm'
							fontWeight='bold'
							fontSize='md'
							d='block'
							variant='translucent80'
							background='transparent'
							mb={1}
							px={3}
							py={1.5}
							lineHeight='unset'
							color='darkgray.500'
							_hover={{
								textDecor: 'none',
								background: 'lightgray.400',
								color: 'darkgray.800',
							}}
							_activeLink={{
								background: 'lightgray.400',
								color: 'darkgray.600',
								_before: {
									opacity: 1,
								},
							}}
							_before={{
								content: '""',
								opacity: 0,
								display: 'inline-block',
								position: ' absolute',
								top: '50%',
								left: '0.2rem',
								width: '.25rem',
								height: '.25rem',
								borderRadius: '50%',
								background: 'lightgray.700',
								transform: 'translateY(-50%)',
							}}
						>
							Tweets
						</Button>
					) : (
						<></>
					)}
				</Box> */}
				<Box
					overflowY='auto'
					className='custom-scrollbar'
					height='100%'
					flexGrow={1}
				>
					<Routes>
						<Route
							index
							element={
								<CommunityGroupChat
									account={account}
									community={community}
									chatData={communityData?.messages || []}
									isFetchingCommunityDataFirstTime={
										isFetchingCommunityDataFirstTime
									}
								/>
							}
						/>
						<Route
							path='tweets'
							element={
								<CommunityTweets tweets={communityData?.tweets || []} />
							}
						/>
					</Routes>
				</Box>
			</Box>
			<CommunityModal
				isOpen={isOpen}
				onClose={onClose}
				communityData={communityData}
				getCommunityData={getCommunityData}
			/>
		</Flex>
  )
}

export default CommunityByName
