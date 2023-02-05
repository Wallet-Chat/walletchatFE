import { Box } from '@chakra-ui/react'
import { memo, useEffect, useState } from 'react'
import { truncateAddress } from '../../../helpers/truncateString'
import { InboxItemType } from '../../../types/InboxItem'
import { convertIpfsUriToUrl } from '../../../helpers/ipfs'
import NFTCollection from '../../../types/NFTCollection'
import OpenSeaNFTCollection, {
	openseaToGeneralNFTCollectionType,
} from '../../../types/OpenSea/NFTCollection'
import NFTPortNFTCollection, {
	nftPortToGeneralNFTCollectionType,
} from '../../../types/NFTPort/NFTCollection'
import POAPEvent from '../../../types/POAP/POAPEvent'
import InboxItem from '../InboxListItem'

const NFTInboxItem = ({ data }: { data: InboxItemType }) => {
	const [nft, setNft] = useState<NFTCollection>()
	const [poapEvent, setPoapEvent] = useState<POAPEvent>()
	const [isError, setIsError] = useState(false)

	const isPoap = data?.nftaddr?.includes('poap') ? true : false
	const url = isPoap
		? `/nft/poap/${data?.nftaddr?.split('_')[1]}`
		: `/nft/ethereum/${data.nftaddr}`
	const displayName = `${
		nft?.name
			? nft.name
			: data?.nftaddr?.includes('poap_')
			? ''
			: truncateAddress(data?.nftaddr)
	}${poapEvent?.name || ''}`

	const poapId = isPoap && data?.nftaddr?.split('_')[1]

	useEffect(() => {
		const getNftMetadata = () => {
			if (!data?.nftaddr) {
				console.log('Missing contract address')
				return
			}
			if (data?.chain === 'ethereum') {
				if (process.env.REACT_APP_OPENSEA_API_KEY === undefined) {
					console.log('Missing OpenSea API Key')
					return
				}
				fetch(`https://api.opensea.io/api/v1/asset_contract/${data.nftaddr}`, {
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
						}
					})
					.catch((error) => {
						console.log(`🚨[GET][NFT Contract]:`, error)
						setIsError(error)
					})
			} else if (data?.chain === 'polygon') {
				if (process.env.REACT_APP_NFTPORT_API_KEY === undefined) {
					console.log('Missing NFT Port API Key')
					return
				}
				fetch(
					`https://api.nftport.xyz/v0/nfts/${data.nftaddr}/1?chain=${data.chain}&page_size=1&include=all`,
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
					})
					.catch((error) => {
						console.log('🚨[GET][NFT Metadata]:', error)
						setIsError(error)
					})
			}
		}

		const getPOAPEvent = () => {
			if (!process.env.REACT_APP_POAP_API_KEY) {
				console.log('Missing POAP API key')
				return
			}
			if (!poapId) {
				console.log('Missing POAP id')
				return
			}

			fetch(`https://api.poap.tech/events/id/${poapId}`, {
				method: 'GET',
				headers: {
					accept: 'application/json',
					'X-API-Key': process.env.REACT_APP_POAP_API_KEY,
				},
			})
				.then((response) => response.json())
				.then((result: POAPEvent) => {
					console.log(`✅[GET][POAP Event]:`, result)
					setPoapEvent(result)
				})
				.catch((error) => console.log(error))
		}
		isPoap ? getPOAPEvent() : getNftMetadata()
	}, [data.nftaddr, data?.chain, poapId])

	if (isError || data?.chain === 'none') return <Box></Box>

	return (
		<InboxItem
			chain={data?.chain}
			displayName={displayName}
			url={url}
			image={nft?.image_url || poapEvent?.image_url}
			isPoap={isPoap}
			latestMessage={data?.message}
			timestamp={data?.timestamp}
			unread={data?.unread || 0}
			address={data?.nftaddr}
		/>
	)
}

export default memo(NFTInboxItem)
