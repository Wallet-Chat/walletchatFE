import { IconX } from '@tabler/icons'
import { Button, Flex } from '@chakra-ui/react'

function ExtensionCloseButton() {
	return (
		<Flex textAlign='right' position='fixed' top={0} right={0}>
			<Button
				borderBottomLeftRadius='lg'
				borderBottomRightRadius='lg'
				borderTopLeftRadius={0}
				borderTopRightRadius={0}
				background='lightgray.500'
				py={0}
				px={1}
				size='lg'
				height='24px'
				onClick={() => window.close()}
			>
				<IconX size={18} color='var(--chakra-colors-darkgray-700)' />
			</Button>
		</Flex>
	)
}

export default ExtensionCloseButton
