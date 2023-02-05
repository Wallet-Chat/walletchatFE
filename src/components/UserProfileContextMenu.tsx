import React from 'react'
import {
	Divider,
	Flex,
	Image,
	Link,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	Text,
} from '@chakra-ui/react'
import { IconExternalLink, IconMessage } from '@tabler/icons'
import { Link as RLink } from 'react-router-dom'

import IconOpenSea from '../images/icon-products/icon-opensea.svg'
import IconGemXyz from '../images/icon-products/icon-gemxyz.svg'
import IconEtherscan from '../images/icon-products/icon-etherscan.svg'
import { truncateAddress } from '../helpers/truncateString'

const UserProfileContextMenu = ({
	address,
	children,
}: {
	address: string
	children?: React.ReactNode
}) => {
	return (
		<Menu isLazy>
			<MenuButton
				p={0}
				height='auto'
				minWidth='unset'
				_hover={{
					textDecoration: 'underline',
					cursor: 'pointer',
				}}
			>
				{children}
			</MenuButton>
			<MenuList>
				<Link
					as={RLink}
					to={`/dm/${address}`}
					_hover={{
						textDecoration: 'none',
						background: 'var(--chakra-colors-lightgray-400)',
					}}
				>
					<MenuItem icon={<IconMessage width='20px' height='20px' />}>
						<Text>Chat</Text>
					</MenuItem>
				</Link>
				<Divider />
				<Link
					href={`https://etherscan.io/address/${address}`}
					target='_blank'
					_hover={{
						textDecoration: 'none',
						background: 'var(--chakra-colors-lightgray-400)',
					}}
				>
					<MenuItem
						icon={
							<Image src={IconEtherscan} width='20px' height='20px' alt='' />
						}
					>
						<Flex alignItems='center'>
							<Text>{truncateAddress(address)}</Text>
							<IconExternalLink stroke='1.5' size='20' />
						</Flex>
					</MenuItem>
				</Link>

				<Divider />
				<Link
					href={`https://gem.xyz/profile/${address}`}
					target='_blank'
					_hover={{
						textDecoration: 'none',
						background: 'var(--chakra-colors-lightgray-400)',
					}}
				>
					<MenuItem
						icon={<Image src={IconGemXyz} width='20px' height='20px' alt='' />}
					>
						View in Gem.xyz
					</MenuItem>
				</Link>
				<Link
					href={`https://opensea.io/accounts/${address}`}
					target='_blank'
					_hover={{
						textDecoration: 'none',
						background: 'var(--chakra-colors-lightgray-400)',
					}}
				>
					<MenuItem
						icon={<Image src={IconOpenSea} width='20px' height='20px' alt='' />}
					>
						View in OpenSea
					</MenuItem>
				</Link>
			</MenuList>
		</Menu>
	)
}

export default UserProfileContextMenu
