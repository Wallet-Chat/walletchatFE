import { Avatar, Box, Button, Flex } from '@chakra-ui/react'
import Blockies from 'react-blockies'
import User from '../../../../../../types/User'

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
			cursor='pointer'
			borderRadius='md'
			_hover={{ background: 'lightgray.200' }}
		>
			<Box flex='0 0 30px' mr={2}>
				{member?.image ? (
					<Avatar src={member?.image} name={member?.name} />
				) : (
					<Blockies seed={member.address.toLocaleLowerCase()} scale={4} />
				)}
			</Box>
			<Box fontSize='md' flexGrow={1} fontWeight='bold'>
				{member?.name}
			</Box>
		</Flex>
	)
}

export default CommunityModalMember
