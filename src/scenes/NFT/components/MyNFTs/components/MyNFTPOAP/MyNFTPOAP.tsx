import {
	Box,
	Button,
	Image,
	Text,
	Link,
	Flex,
	Tooltip,
	Badge,
} from '@chakra-ui/react';
import { IconArrowNarrowRight } from '@tabler/icons';
import { Link as RLink } from 'react-router-dom';
import { truncateAddress } from '../../../../../../helpers/truncateString';
import IconEtherscan from '../../../../../../images/icon-products/icon-etherscan-mono.svg';
import { chains, poapContractAddress } from '../../../../../../constants';
import POAP from '../../../../../../types/POAP/POAP';

export default function MyNFTItem({ poap }: { poap: POAP }) {
	let chain, blockExplorerUrl, chainLogo, chainName;
	if (poap?.chain && poap?.chain !== '') {
		chain = chains['100'];
		blockExplorerUrl = chain?.block_explorer_url;
		chainLogo = chain?.logo;
		chainName = chain?.name;
	}

	return (
		<Flex
			alignItems='center'
			border='1px'
			borderColor='lightgray.400'
			borderRadius='md'
			width='300px'
			maxW='100%'
		>
			{poap?.event?.image_url ? (
				<Image
					src={`${poap.event.image_url}`}
					alt=''
					width='100px'
					maxW='100%'
					maxH='100px'
					fit='cover'
					borderRadius='md'
					fallback={
						<Box background='lightgray.400' width='100px' height='100px'></Box>
					}
				/>
			) : (
				<Box
					background='lightgray.400'
					width='100px'
					height='100px'
					flex='0 0 100px'
				></Box>
			)}
			<Box p={3} overflow='hidden'>
				<Badge variant='black'>POAP</Badge>
				<Text
					fontSize='md'
					fontWeight='bold'
					textOverflow='ellipsis'
					whiteSpace='nowrap'
					overflow='hidden'
				>
					{poap?.event?.name}
				</Text>
				<Box mb={2}>
					{poapContractAddress && (
						<Link
							href={`${blockExplorerUrl}token/${poapContractAddress}/?a=${poap?.tokenId}#inventory`}
							target='_blank'
						>
							<Flex alignItems='center'>
								{chainLogo && (
									<Tooltip label={`${chainName} chain`}>
										<Image
											verticalAlign='middle'
											src={`data:image/svg+xml;base64,${chainLogo}`}
											width='15px'
											height='15px'
											mr={1}
											alt=''
										/>
									</Tooltip>
								)}
								<Image
									verticalAlign='middle'
									src={IconEtherscan}
									width='15px'
									height='15px'
									mr={1}
									alt=''
								/>
								<Box verticalAlign='middle' fontSize='sm'>
									{poapContractAddress && truncateAddress(poapContractAddress)}
								</Box>
								<Badge>{poap?.tokenId}</Badge>
							</Flex>
						</Link>
					)}
				</Box>
				{poap?.event?.id && (
					<RLink
						to={`/nft/poap/${poap.event.id}`}
						style={{ textDecoration: 'none' }}
					>
						<Button variant='outline' size='sm' width='100%'>
							Community <IconArrowNarrowRight stroke='1.5' />
						</Button>
					</RLink>
				)}
			</Box>
		</Flex>
	);
}
