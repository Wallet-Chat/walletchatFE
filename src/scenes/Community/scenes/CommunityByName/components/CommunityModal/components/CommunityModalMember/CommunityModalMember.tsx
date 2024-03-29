import { Avatar, Box, Button, Flex, Tag } from '@chakra-ui/react'
import makeBlockie from 'ethereum-blockies-base64'
import { Link } from 'react-router-dom'
import { truncateAddress } from '@/helpers/truncateString'
import User from '../../../../../../../../types/User'

const CommunityModalMember = ({
	member,
	style,
}: {
	member: User
	style: React.CSSProperties
}) => {
	return (
		<Flex
			alignItems='center'
			style={style}
			borderRadius='md'
			_hover={{ background: 'lightgray.200' }}
			px={6}
			role='group'
		>
			<Box flex='0 0 30px' mr={2}>
				<Avatar
					src={
						member?.image ||
						(member?.address &&
							makeBlockie(member.address.toLocaleLowerCase()))
					}
					name={member?.name}
					size='sm'
					loading='lazy'
				/>
			</Box>
			<Box>
				<Box fontSize='md' flexGrow={1} fontWeight='bold'>
					{member?.name}{' '}
					{member?.admin && (
						<Tag
							variant='outline'
							colorScheme='darkgray'
							size='sm'
							ml={1}
						>
							Admin
						</Tag>
					)}
				</Box>
				<Box fontSize='sm' flexGrow={1} color='lightgray.700'>
					{member?.address && truncateAddress(member.address)}
				</Box>
			</Box>
			<Button
				as={Link}
				to={`/dm/${member?.address}`}
				position='absolute'
				right={2}
				opacity={0}
				size='sm'
				_groupHover={{
					opacity: 1,
					textDecoration: 'none',
				}}
				variant='blue'
			>
				Chat
			</Button>
		</Flex>
	)
}

export default CommunityModalMember
