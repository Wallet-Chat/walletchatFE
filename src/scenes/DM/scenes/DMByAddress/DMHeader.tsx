import React from 'react'
import { Box, Button, Flex, Text, Link as CLink } from '@chakra-ui/react'
import { useParams, Link } from 'react-router-dom'
import {
	IconArrowLeft,
	IconCheck,
	IconCopy,
	IconExternalLink,
} from '@tabler/icons'
import useIsSmallLayout from '@/hooks/useIsSmallLayout'
import { truncateAddress } from '../../../../helpers/truncateString'
import { useGetNameQuery } from '@/redux/reducers/dm'
import Avatar from '@/components/Inbox/DM/Avatar'

const DMHeader = () => {
  const isSmallLayout = useIsSmallLayout()

	const { address: toAddr = '' } = useParams()

	const timerRef: { current: NodeJS.Timeout | null } = React.useRef(null)

	const [copiedAddr, setCopiedAddr] = React.useState(false)

	const { data: name } = useGetNameQuery(toAddr)

	async function copyToClipboard() {
		if (toAddr) {
			let didCopy = false

			try {
				await navigator.clipboard.writeText(toAddr)
				setCopiedAddr(true)
				didCopy = true
			} finally {
				if (timerRef?.current) window.clearTimeout(timerRef.current)

				if (didCopy) {
					timerRef.current = setTimeout(() => {
						setCopiedAddr(false)
					}, 3000)
				}
			}
		}
	}

	return (
		<Box
			p={5}
			pb={3}
			borderBottom='1px solid var(--chakra-colors-lightgray-400)'
		>
			{isSmallLayout && (
				<Box mb={4}>
					<Link to='/dm' style={{ textDecoration: 'none' }}>
						<Button colorScheme='gray' background='lightgray.300' size='sm'>
							<Flex alignItems='center'>
								<IconArrowLeft size={18} />
								<Text ml='1'>Back to Inbox</Text>
							</Flex>
						</Button>
					</Link>
				</Box>
			)}

			{toAddr && (
				<Flex alignItems='center' justifyContent='space-between'>
					<Flex alignItems='center'>
						<Avatar account={toAddr} />
						<Box ml={2}>
							{name ? (
								<Box>
									<Text fontWeight='bold' color='darkgray.800' fontSize='md'>
										{name}
									</Text>
									<Text fontSize='sm' color='darkgray.500'>
										{truncateAddress(toAddr)}
									</Text>
								</Box>
							) : (
								<Text fontWeight='bold' color='darkgray.800' fontSize='md'>
									{truncateAddress(toAddr)}
								</Text>
							)}
						</Box>
					</Flex>
					<Box>
						<Button
							onClick={() => copyToClipboard()}
							size='xs'
							disabled={copiedAddr}
							ml={3}
						>
							{copiedAddr ? (
								<IconCheck
									size={20}
									color='var(--chakra-colors-darkgray-500)'
									stroke='1.5'
								/>
							) : (
								<IconCopy
									size={20}
									color='var(--chakra-colors-lightgray-900)'
									stroke='1.5'
								/>
							)}
						</Button>
						<Button
							href={`https://etherscan.io/address/${toAddr}`}
							target='_blank'
							as={CLink}
							size='xs'
							ml={2}
						>
							<IconExternalLink
								size={20}
								color='var(--chakra-colors-lightgray-900)'
								stroke='1.5'
							/>
						</Button>
					</Box>
				</Flex>
			)}
		</Box>
	)
}

export default DMHeader
