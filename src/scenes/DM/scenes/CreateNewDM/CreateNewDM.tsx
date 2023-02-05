import { Flex } from '@chakra-ui/react'
import { isMobile } from 'react-device-detect'
import StartConversationWithAddress from '../../../../components/StartConversationWithAddress'
import { useWallet } from '../../../../context/WalletProvider'

const NewConversation = () => {
	const { web3 } = useWallet()

	return (
		<Flex
			px={5}
			py={10}
			background='white'
			minHeight={isMobile ? 'unset' : '100vh'}
			justifyContent='center'
			alignItems='center'
			width='360px'
		>
			<StartConversationWithAddress web3={web3} />
		</Flex>
	)
}

export default NewConversation
