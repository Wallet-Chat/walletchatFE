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
import * as ENV from '@/constants/env'
import { log } from '@/helpers/log'
import { getJwtForAccount } from '@/helpers/jwt'

const NFTInboxItem = ({ data, account }: { data: InboxItemType, account: string }) => {
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
   }${poapEvent?.name || ""}`

   const poapId = isPoap && data?.nftaddr?.split('_')[1]

   useEffect(() => {
      const getNftMetadata = () => {
         if (!data?.nftaddr) {
            log('Missing contract address')
            return
         }
         if (data?.chain === 'ethereum') {
            fetch(
               `${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/opensea_asset_contract/${data.nftaddr}`,
               {
                  method: 'GET',
                  credentials: 'include',
                  headers: {
                     'Content-Type': 'application/json',
                     Authorization: `Bearer ${getJwtForAccount(account)}`,
                  },
               }
            )
               .then((response) => response.json())
               .then((result: OpenSeaNFTCollection) => {
                  if (result?.collection?.name) {
                     // log(`✅[GET][NFT Contract]:`, result)
                     setNft(openseaToGeneralNFTCollectionType(result))
                  }
               })
               .catch((error) => {
                  log(`🚨[GET][NFT Contract]:`, error)
                  setIsError(error)
               })
         } else if (data?.chain === 'polygon') {
            if (ENV.REACT_APP_NFTPORT_API_KEY === undefined) {
               log('Missing NFT Port API Key')
               return
            }
            fetch(
               `https://api.nftport.xyz/v0/nfts/${data.nftaddr}/1?chain=${data.chain}&page_size=1&include=all`,
               {
                  method: 'GET',
                  headers: {
                     Authorization: ENV.REACT_APP_NFTPORT_API_KEY,
                  },
               }
            )
               .then((response) => response.json())
               .then((data: NFTPortNFTCollection) => {
                  // log('✅[GET][NFT Metadata]:', data)

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
                  log('🚨[GET][NFT Metadata]:', error)
                  setIsError(error)
               })
         }
      }

      const getPOAPEvent = () => {
         if (!ENV.REACT_APP_POAP_API_KEY) {
            log('Missing POAP API key')
            return
         }
         if (!poapId) {
            log('Missing POAP id')
            return
         }

         fetch(`https://api.poap.tech/events/id/${poapId}`, {
            method: 'GET',
            headers: {
               accept: 'application/json',
               'X-API-Key': ENV.REACT_APP_POAP_API_KEY,
             },
         })
            .then((response) => response.json())
            .then((result: POAPEvent) => {
               log(`✅[GET][POAP Event]:`, result)
               setPoapEvent(result)
            })
            .catch((error) => log(error))
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
