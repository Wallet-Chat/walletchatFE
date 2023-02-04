import { Box, Text } from '@chakra-ui/react';
import Web3 from 'web3';
import NFTInboxItem from './NFT/NFTInboxListItem';
import { InboxItemType } from '../../types/InboxItem';
import { memo } from 'react';
import CommunityInboxItem from './Community/CommunityInboxListItem';
import StartConversationWithAddress from '../StartConversationWithAddress';
import DMInboxItem from './DM/DMInboxListItem';

const InboxList = ({
	context,
	data,
	account,
	web3,
}: {
	context: string;
	data: InboxItemType[] | undefined;
	account: string;
	web3: Web3;
}) => {
	return (
		<Box>
			{data?.map((conversation, i) => {
				if (conversation.context_type === 'nft') {
					return (
						<NFTInboxItem
							key={`${conversation.timestamp.toString()}${i}`}
							data={conversation}
						/>
					);
				} else if (conversation.context_type === 'community') {
					return (
						<CommunityInboxItem
							key={`${conversation.timestamp.toString()}${i}`}
							data={conversation}
							account={account}
						/>
					);
				} else if (
					conversation.context_type === 'dm' ||
					conversation.context_type === 'community'
				) {
					return (
						<DMInboxItem
							key={`${conversation.timestamp.toString()}${i}`}
							data={conversation}
							account={account}
						/>
					);
				}
				return <Box key={`inbox-list-item-empty-box}${i}`}></Box>;
			})}
			{data?.length === 0 && (context === 'dms' || context === 'all') && (
				<Box p={5}>
					<Text mb={4} fontSize='md'>
						You have no messages.
					</Text>
					<StartConversationWithAddress web3={web3} />
				</Box>
			)}
			{data?.length === 0 && !(context === 'dms' || context === 'all') && (
				<Box p={5} textAlign='center' d='block'>
					<Text mb={4} fontSize='md' color='darkgray.100'>
						You have not joined any group
					</Text>
				</Box>
			)}
		</Box>
	);
};

export default memo(InboxList);
