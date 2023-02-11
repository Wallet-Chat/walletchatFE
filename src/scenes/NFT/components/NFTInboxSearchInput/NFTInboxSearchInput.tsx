import {
	Box,
	Button,
	Flex,
	FormControl,
	Image,
	Input,
	Spinner,
	Text,
} from '@chakra-ui/react'
import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import Blockies from 'react-blockies'
import { useWallet } from '../../../../context/WalletProvider'
import { truncateAddress } from '../../../../helpers/text'
import useOnClickOutside from '../../../../hooks/useOnClickOutside'
import OpenSeaNFTCollection, {
	openseaToGeneralNFTCollectionType,
} from '../../../../types/OpenSea/NFTCollection'
import NFTPortNFTCollection, {
	nftPortToGeneralNFTCollectionType,
} from '../../../../types/NFTPort/NFTCollection'
import NFTCollection from '../../../../types/NFTCollection'
import { convertIpfsUriToUrl } from '../../../../helpers/text'

export default function NFTInboxSearchInput() {
	const [toAddr, setToAddr] = useState<string>('')
	const [isFetchingEthereum, setIsFetchingEthereum] = useState(false)
	const [isFetchingPolygon, setIsFetchingPolygon] = useState(false)
	const [nft, setNft] = useState<NFTCollection>()
	const [chain, setChain] = useState('ethereum')
	const [isSuggestionListOpen, setIsSuggestionListOpen] = useState(false)
	const { web3 } = useWallet()

	const ref = useRef(null)

	const fetchNFTContractDetails = async (address: string) => {
		if (!web3.utils.isAddress(address)) {
			console.log('Invalid contract address')
			return
		}

		fetchEthereumContract(address)
	}

	const fetchEthereumContract = async (address: string) => {
		if (process.env.REACT_APP_OPENSEA_API_KEY === undefined) {
			console.log('Missing OpenSea API Key')
			return
		}
		setIsFetchingEthereum(true)
		fetch(`https://api.opensea.io/api/v1/asset_contract/${address}`, {
			method: 'GET',
			headers: {
				Authorization: process.env.REACT_APP_OPENSEA_API_KEY,
			},
		})
			.then((response) => response.json())
			.then((result: OpenSeaNFTCollection) => {
				if (result?.collection?.name) {
					// console.log(`✅[GET][NFT Contract]:`, result)
					setNft(openseaToGeneralNFTCollectionType(result))
					setIsSuggestionListOpen(true)
				}
			})
			.finally(() => {
				setIsFetchingEthereum(false)
			})
			.catch((error) => {
				console.log(`🚨[GET][NFT Contract]:`, error)
				fetchPolygonContract(address)
				setChain('polygon')
			})
	}

	const fetchPolygonContract = (address: string) => {
		if (process.env.REACT_APP_NFTPORT_API_KEY === undefined) {
			console.log('Missing NFT Port API Key')
			return
		}
		setIsFetchingPolygon(true)
		fetch(
			`https://api.nftport.xyz/v0/nfts/${address}/1?chain=polygon&page_size=1&include=all`,
			{
				method: 'GET',
				headers: {
					Authorization: process.env.REACT_APP_NFTPORT_API_KEY,
				},
			}
		)
			.then((response) => response.json())
			.then((data: NFTPortNFTCollection) => {
				// console.log('✅[GET][NFT Metadata]:', data)

				let _transformed: NFTCollection =
					nftPortToGeneralNFTCollectionType(data)
				setNft({
					..._transformed,
					image_url: _transformed.image_url?.includes('ipfs://')
						? convertIpfsUriToUrl(_transformed.image_url)
						: _transformed.image_url,
				})
				setIsSuggestionListOpen(true)
			})
			.finally(() => {
				setIsFetchingPolygon(false)
			})
			.catch((error) => {
				console.log('🚨[GET][NFT Metadata]:', error)
				setChain('ethereum')
			})
	}

	useEffect(() => {
		const delayDebounceFn = setTimeout(() => {
			fetchNFTContractDetails(toAddr)
		}, 800)

		return () => clearTimeout(delayDebounceFn)
	}, [toAddr])

	const handleClickOutside = () => {
		if (isSuggestionListOpen === true) setIsSuggestionListOpen(false)
	}

	useOnClickOutside(ref, handleClickOutside)

	return (
		<Box position={'relative'} ref={ref}>
			<FormControl pos='relative'>
				<Input
					type='text'
					value={toAddr}
					placeholder='Enter contract address (0x...) to chat'
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						setToAddr(e.target.value)
					}
					onFocus={(e: React.ChangeEvent<HTMLInputElement>) => {
						if (nft?.name) setIsSuggestionListOpen(true)
					}}
					background='lightgray.300'
				/>
				{(isFetchingEthereum || isFetchingPolygon) && (
					<Box
						pos='absolute'
						right='1.5rem'
						top='50%'
						transform='translateY(-50%)'
						zIndex='docked'
					>
						<Spinner size='sm' />
					</Box>
				)}
			</FormControl>

			{toAddr !== '' &&
				web3.utils.isAddress(toAddr) &&
				isSuggestionListOpen &&
				!(isFetchingEthereum || isFetchingPolygon) && (
					<Box
						position='absolute'
						top={'100%'}
						left={0}
						width='100%'
						borderRadius='md'
						p={2}
						background='white'
						borderColor='darkgray.100'
						borderWidth='1px'
					>
						<Text color='darkgray.500' fontSize='md' mb={1}>
							Start chatting with
						</Text>
						<Link
							to={`/nft/${chain}/${toAddr}`}
							onClick={() => {
								setIsSuggestionListOpen(false)
								setToAddr('')
							}}
							style={{ textDecoration: 'none', width: '100%' }}
						>
							<Flex
								alignItems='center'
								justifyContent='flex-start'
								p={3}
								background='lightgray.300'
								borderRadius='md'
								as={Button}
								width='100%'
							>
								{nft?.image_url ? (
									<Image
										src={nft.image_url}
										alt=''
										width='25px'
										height='25px'
									/>
								) : (
									<Blockies
										seed={toAddr.toLocaleLowerCase()}
										scale={3}
									/>
								)}
								<Text fontWeight='bold' fontSize='md' ml={2}>
									{nft?.name ? nft.name : truncateAddress(toAddr)}{' '}
									{nft?.name && `(${truncateAddress(toAddr)})`}
								</Text>
							</Flex>
						</Link>
					</Box>
				)}
		</Box>
	)
}
