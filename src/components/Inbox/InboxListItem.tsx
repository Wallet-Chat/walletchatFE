import { Avatar, Box, Flex, Image, Tooltip } from '@chakra-ui/react'
import { memo } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import Blockies from 'react-blockies'

import { BlockieWrapper } from '../../styled/BlockieWrapper'
import IconPolygon from '../../images/icon-chains/icon-polygon.svg'
import IconEthereum from '../../images/icon-chains/icon-ethereum.svg'
import IconGnosis from '../../images/icon-chains/icon-gnosis.svg'
import { formatInboxDate } from '../../helpers/date'

const InboxItemWrapper = styled.button`
	display: block;
	width: 100%;
	padding: var(--chakra-space-3) var(--chakra-space-5);
	background: #fff;
	text-align: left;
	color: var(--chakra-colors-darkgray-900);

	&:not(:last-child) {
		border-bottom: 1px solid var(--chakra-colors-lightgray-300);
	}

	&:hover {
		background: var(--chakra-colors-lightgray-300);
	}

	.timestamp {
		display: block;
		color: var(--chakra-colors-darkgray-300);
		font-size: var(--chakra-fontSizes-md);
		user-select: none;
		line-height: 1.7;
	}
`

const InboxItemNotificationCount = styled.div`
	display: inline-block;
	background: var(--chakra-colors-information-400);
	border-radius: var(--chakra-radii-md);
	height: 18px;
	color: #fff;
	font-weight: 700;
	font-size: 90%;
	text-align: center;
	margin-left: auto;
	padding: 0 var(--chakra-space-2);
`

const InboxItemRecipientAddress = styled.div`
	font-size: var(--chakra-fontSizes-lg);
	font-weight: bold;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
`

const InboxItemChainImage = styled.div`
	position: absolute;
	bottom: 0;
	right: 0;
	width: 1rem;
	height: 1rem;
	background: rgba(255, 255, 255, 0.8);
	padding: var(--chakra-space-0-5);
	border-radius: 50%;
	z-index: var(--chakra-zIndices-docked);
`
const InboxItem = ({
	chain,
	displayName = '',
	url,
	image,
	isPoap = false,
	latestMessage,
	timestamp = '',
	unread = 0,
	address,
}: {
	chain?: string | undefined
	displayName: string | undefined
	url: string
	image: string | undefined
	isPoap?: boolean
	latestMessage: string | undefined
	timestamp: string
	unread: number
	address: string | undefined | null
}) => {
	return (
		<Link to={url} style={{ textDecoration: 'none' }}>
			<InboxItemWrapper>
				<Flex justifyContent='space-between'>
					<Flex width='75%'>
						<Box mr={2} flexShrink={0}>
							<BlockieWrapper>
								{chain === 'ethereum' && (
									<Tooltip label='Ethereum chain'>
										<InboxItemChainImage>
											<Image
												src={IconEthereum}
												alt='Ethereum chain'
												width='100%'
												height='100%'
											/>
										</InboxItemChainImage>
									</Tooltip>
								)}
								{chain === 'polygon' && (
									<Tooltip label='Polygon chain'>
										<InboxItemChainImage>
											<Image
												src={IconPolygon}
												alt='Polygon chain'
												width='100%'
												height='100%'
											/>
										</InboxItemChainImage>
									</Tooltip>
								)}
								{chain === 'xdai' && (
									<Tooltip label='Gnosis chain'>
										<InboxItemChainImage>
											<Image
												src={IconGnosis}
												alt='Gnosis chain'
												width='100%'
												height='100%'
											/>
										</InboxItemChainImage>
									</Tooltip>
								)}
								{image || displayName ? (
									<Avatar src={image} size='md' name={displayName} />
								) : address ? (
									<Blockies
										seed={
											isPoap
												? '0x22c1f6050e56d2876009903609a2cc3fef83b415'
												: address
										}
										scale={5}
									/>
								) : (
									''
								)}
							</BlockieWrapper>
						</Box>
						<Box minWidth='0'>
							{displayName && (
								<InboxItemRecipientAddress>
									{displayName}
								</InboxItemRecipientAddress>
							)}
							{latestMessage && (
								<Box
									fontSize='md'
									color='darkgray.100'
									whiteSpace='nowrap'
									overflow='hidden'
									textOverflow='ellipsis'
								>
									{latestMessage.substring(0, 25)}
									{latestMessage.length > 25 && '...'}
								</Box>
							)}
							{latestMessage === '' && (
								<Box
									fontSize='md'
									color='darkgray.100'
									whiteSpace='nowrap'
									overflow='hidden'
									textOverflow='ellipsis'
								>
									Welcome!
								</Box>
							)}
						</Box>
					</Flex>
					<Box textAlign='right' flexShrink={0}>
						{timestamp !== '' && (
							<Box className='timestamp'>
								{formatInboxDate(timestamp)}
							</Box>
						)}
						{unread && unread !== 0 ? (
							<InboxItemNotificationCount>
								{unread}
							</InboxItemNotificationCount>
						) : (
							''
						)}
					</Box>
				</Flex>
			</InboxItemWrapper>
		</Link>
	)
}

export default memo(InboxItem)
