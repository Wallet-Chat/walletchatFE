import {
    Badge,
   Box,
   Button,
   Divider,
   Flex,
   FormControl,
   Heading,
   Image,
   Tab,
   TabList,
   TabPanel,
   TabPanels,
   Tabs,
   Text,
} from '@chakra-ui/react'
import { IconExternalLink, IconSend } from '@tabler/icons'
import { useState, useEffect, KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import TextareaAutosize from 'react-textarea-autosize'

import { truncateAddress } from '../../helpers/truncateString'
import NFTMetadataType from '../../types/NFTMetadata'
import NFTOwnerAddressType from '../../types/NFTOwnerAddressType'
import Comment from './components/Comment'
import CommentType from '../../types/Comment'

// const nftContractAddr = '0x1a92f7381b9f03921564a437210bb9396471050c'
// const nftId = '878'
const nftContractAddr = '0x716f29b8972d551294d9e02b3eb0fc1107fbf4aa'
const nftId = '1484'
const tokenType = 'erc721'

const NFT = ({ account }: { account: string }) => {
   const [nftData, setNftData] = useState<NFTMetadataType>()
   const [ownerAddress, setOwnerAddress] = useState<string>()
   const [msgInput, setMsgInput] = useState<string>('')
   const [loadedComments, setLoadedComments] =
      useState<CommentType[]>(dummyComments)
    const [isFetchingComments, setIsFetchingComments] = useState<boolean>(false)
    const [isPostingComment, setIsPostingComment] = useState<boolean>(false)

   const { metadata } = nftData || {}

   const getNftMetadata = () => {
      const baseURL = `https://eth-mainnet.alchemyapi.io/v2/${process.env.REACT_APP_ALCHEMY_API_KEY}/getNFTMetadata`
      const fetchURL = `${baseURL}?contractAddress=${nftContractAddr}&tokenId=${nftId}&tokenType=${tokenType}`

      fetch(fetchURL, {
         method: 'GET',
      })
         .then((response) => response.json())
         .then((result: NFTMetadataType) => {
            console.log('✅[GET][NFT data]:', result)
            // console.log(JSON.stringify(result, null, 2))
            setNftData(result)
         })
         .catch((error) => console.log('error', error))
   }

   const getOwnerAddress = () => {
      const baseURL = `https://eth-mainnet.alchemyapi.io/v2/${process.env.REACT_APP_ALCHEMY_API_KEY}/getOwnersForToken`

      const fetchURL = `${baseURL}?contractAddress=${nftContractAddr}&tokenId=${nftId}&tokenType=${tokenType}`

      fetch(fetchURL, {
         method: 'GET',
      })
         .then((response) => response.json())
         .then((result: NFTOwnerAddressType) => {
            console.log('✅[GET][NFT Owner Address]:', result)
            console.log(JSON.stringify(result, null, 2))
            setOwnerAddress(result.owners[0])
         })
         .catch((error) => console.log('error', error))
   }

   const getComments = () => {
       setIsFetchingComments(true)
      fetch(
         ` ${process.env.REACT_APP_REST_API}/get_comments/${nftContractAddr}/${nftId}`,
         {
            method: 'GET',
         }
      )
         .then((response) => response.json())
         .then((data) => {
            console.log('✅[GET][Comments]:', data)
            const translatedData = data.map((item: any) => ({
                fromAddr: item.fromaddr,
                nftAddr: item.nftaddr,
                nftId: item.nftid,
                timestamp: item.timestamp,
                message: item.message,
            }))
            
            setLoadedComments(translatedData)
         })
         .catch((error) => {
            console.error('🚨🚨[POST][Comments]:', error)
         })
         .finally(() => setIsFetchingComments(false))
   }

   const handleKeyPress = (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter') {
         event.preventDefault()
         sendComment()
      }
   }

   const sendComment = async () => {
      if (msgInput.length <= 0) return

      // Make a copy and clear input field
      const msgInputCopy = (' ' + msgInput).slice(1)
      setMsgInput('')

      const timestamp = new Date()

      let data = {
         fromAddr: account.toLocaleLowerCase(),
         nftAddr: nftContractAddr,
         nftId: parseInt(nftId),
         timestamp: new Date(),
         message: msgInputCopy,
      }

    setIsPostingComment(true)
      fetch(` ${process.env.REACT_APP_REST_API}/create_comments`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify(data),
      })
         .then((response) => response.json())
         .then((data) => {
            console.log('✅[POST][Comment]:', data)
            addCommentToUI(
               account,
               nftContractAddr,
               nftId,
               timestamp,
               msgInputCopy
            )
         })
         .catch((error) => {
            console.error('🚨🚨[POST][Comment]:', error, JSON.stringify(data))
         })
         .finally(() => setIsPostingComment(false))
   }

   const addCommentToUI = (
      fromAddr: string,
      nftAddr: string,
      nftId: string,
      timestamp: Date,
      message: string
   ) => {
      console.log(`Add comment to UI: ${message}`)

      const newComment: CommentType = {
         fromAddr,
         nftAddr,
         nftId: parseInt(nftId),
         timestamp: timestamp.toISOString(),
         message,
      }
      let newLoadedComments: CommentType[] = [...loadedComments] // copy the old array
      newLoadedComments = [newComment].concat(newLoadedComments) // place new comment in 0 index
      console.log(newLoadedComments)
      setLoadedComments(newLoadedComments)
   }

   useEffect(() => {
      getNftMetadata()
      getOwnerAddress()
      getComments()
   }, [])

   return (
      <Flex flexDirection="column" background="white" height="100vh" p={5}>
         <Flex alignItems="center" mb={2}>
            {metadata && metadata.image && (
               <Image
                  src={metadata.image}
                  alt=""
                  height="60px"
                  borderRadius="var(--chakra-radii-xl)"
                  mr={3}
               />
            )}
            <Box>
               {metadata && metadata.name && (
                  <Heading size="md">{metadata.name}</Heading>
               )}
               {ownerAddress && (
                  <Box>
                     <Text fontSize="md" color="lightgray.800">
                        Owned by {truncateAddress(ownerAddress)}{' '}
                        <Link
                           to={`https://etherscan.io/address/${ownerAddress}`}
                           target="_blank"
                           style={{
                              display: 'inline-block',
                              verticalAlign: 'middle',
                           }}
                        >
                           <IconExternalLink
                              size={16}
                              color="var(--chakra-colors-lightgray-900)"
                              stroke="1.5"
                           />
                        </Link>
                     </Text>
                  </Box>
               )}
            </Box>
         </Flex>
         <Tabs display="flex" flexDirection="column" overflowY="auto">
            <TabList>
               <Tab>Chat</Tab>
               <Tab>Comments <Badge variant="black" ml={1}>{loadedComments.length}</Badge></Tab>
            </TabList>

            <TabPanels overflowY="auto" className="custom-scrollbar">
               <TabPanel>
                  <p>one!</p>
               </TabPanel>
               <TabPanel>
                  <Flex mb={5}>
                     <FormControl style={{ flexGrow: 1 }}>
                        <TextareaAutosize
                           placeholder="Comment..."
                           value={msgInput}
                           onChange={(e) => setMsgInput(e.target.value)}
                           onKeyPress={(e) => handleKeyPress(e)}
                           className="custom-scrollbar"
                           style={{
                              resize: 'none',
                              padding: '.5rem 1rem',
                              width: '100%',
                              fontSize: 'var(--chakra-fontSizes-md)',
                              background: 'var(--chakra-colors-lightgray-400)',
                              borderRadius: '0.3rem',
                              marginBottom: '-6px',
                           }}
                           maxRows={8}
                        />
                     </FormControl>
                     <Flex alignItems="flex-end">
                        <Button
                           variant="black"
                           height="100%"
                           onClick={() => sendComment()}
                           isLoading={isPostingComment}
                        >
                           <IconSend size="20" />
                        </Button>
                     </Flex>
                  </Flex>
                  {loadedComments.map((comment: CommentType, i) => (
                     <>
                        <Comment data={comment} key={i} />
                        {i + 1 !== loadedComments.length && <Divider mb={4} />}
                     </>
                  ))}
               </TabPanel>
            </TabPanels>
         </Tabs>
      </Flex>
   )
}

const dummyComments: CommentType[] = [
   {
      fromAddr: '0x8999531b12D3577c50D9bEb8E2C1857C7cA62808',
      nftAddr: nftContractAddr,
      nftId: parseInt(nftId),
      timestamp: new Date().toISOString(),
      message:
         'Sed lacus mi, rutrum sed sem sagittis, imperdiet pellentesque purus. Pellentesque mi libero, varius non fermentum sed, bibendum sed metus. Quisque id turpis ut dui posuere luctus.',
   },
   {
      fromAddr: '0x19871B6F5f64657d6Bf35C88b628F3d1778db81d',
      nftAddr: nftContractAddr,
      nftId: parseInt(nftId),
      timestamp: new Date().toISOString(),
      message: 'Proin ac diam ac elit molestie vehicula vitae nec felis.',
   },
   {
      fromAddr: '0x91D7A110E0cE462d428F3ac700b4371990735517',
      nftAddr: nftContractAddr,
      nftId: parseInt(nftId),
      timestamp: new Date(
         new Date().setDate(new Date().getDate() - 1)
      ).toISOString(),
      message:
         'Donec tristique, magna sed sodales eleifend, lectus ligula tempor enim, non porttitor ipsum nibh id odio. Sed lorem nisl, venenatis sed lorem et, euismod porttitor orci. ',
   },
   {
      fromAddr: '0xbf9ceF53327Be908CBcFe1D8d217852d44b027de',
      nftAddr: nftContractAddr,
      nftId: parseInt(nftId),
      timestamp: new Date(
         new Date().setDate(new Date().getDate() - 1)
      ).toISOString(),
      message: 'Vivamus vel lectus a neque blandit viverra.',
   },
   {
      fromAddr: '0x785F375F2B819d875Ce07009a15779E9c3679C1D',
      nftAddr: nftContractAddr,
      nftId: parseInt(nftId),
      timestamp: new Date(
         new Date().setDate(new Date().getDate() - 2)
      ).toISOString(),
      message:
         'Quisque vitae neque nunc. In hac habitasse platea dictumst. Phasellus gravida fringilla nisl at malesuada. Pellentesque vitae ipsum at elit ultrices facilisis.',
   },
]

export default NFT
