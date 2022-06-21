import {
   Badge,
   Box,
   Button,
   Divider,
   Flex,
   FormControl,
   Heading,
   Image,
   Spinner,
   Tab,
   TabList,
   TabPanel,
   TabPanels,
   Tabs,
   Text,
   Link as CLink,
} from '@chakra-ui/react'
import { IconCheck, IconCopy, IconExternalLink, IconSend } from '@tabler/icons'
import { useState, useEffect, KeyboardEvent } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import TextareaAutosize from 'react-textarea-autosize'
import styled from 'styled-components'
import Blockies from 'react-blockies'

import { truncateAddress } from '../../helpers/truncateString'
import NFTMetadataType from '../../types/NFTMetadata'
import NFTOwnerAddressType from '../../types/NFTOwnerAddressType'
import Comment from './components/Comment'
import CommentType from '../../types/Comment'
import MessageType from '../../types/Message'
import MessageUIType from '../../types/MessageUI'
import { getIpfsData, postIpfsData } from '../../services/ipfs'
import Message from './components/Message'
import EncryptedMsgBlock from '../../types/Message'
import SettingsType from '../../types/Message'
import TweetType from '../../types/Tweet'
import EthCrypto, { Encrypted } from 'eth-crypto'
import { parseIsolatedEntityName } from 'typescript'
import Tweet from './components/Tweet'

// const nftContractAddr = '0x1a92f7381b9f03921564a437210bb9396471050c'
// const nftId = '878'
// const nftContractAddr = '0x716f29b8972d551294d9e02b3eb0fc1107fbf4aa'
// const nftId = '1484'
const tokenType = 'erc721'

const BlockieWrapper = styled.div`
   border-radius: 0.3rem;
   overflow: hidden;
`
const DottedBackground = styled.div`
   flex-grow: 1;
   width: 100%;
   height: auto;
   background: linear-gradient(
            90deg,
            var(--chakra-colors-lightgray-200) 14px,
            transparent 1%
         )
         center,
      linear-gradient(var(--chakra-colors-lightgray-200) 14px, transparent 1%)
         center,
      #9dadc3 !important;
   background-size: 15px 15px !important;
   background-position: top left !important;
   padding: var(--chakra-space-1);
   overflow-y: scroll;
`

const NFT = ({
   account,
   publicKey,
   privateKey,
}: {
   account: string
   publicKey: string
   privateKey: string
}) => {
   let { nftContractAddr = '', nftId = 0 } = useParams()
   let [searchParams] = useSearchParams()

   // Basic data
   const [nftData, setNftData] = useState<NFTMetadataType>()
   const [ownerAddr, setOwnerAddr] = useState<string>()
   const recipientAddr = searchParams.get('recipient') === null ? ownerAddr : searchParams.get('recipient') 
   const [copiedAddr, setCopiedAddr] = useState<boolean>(false)
   const [imageUrl, setImageUrl] = useState<string>()

   // Chat
   const [unreadCount, setUnreadCount] = useState<number>(0)
   const [msgInput, setMsgInput] = useState<string>('')
   const [loadedMsgs, setLoadedMsgs] = useState<MessageUIType[]>([])
   const [chatData, setChatData] = useState<MessageType[]>(
      new Array<MessageType>()
   )
   const [isFetchingMessages, setIsFetchingMessages] = useState<boolean>(false)
   const [isPostingMessage, setIsPostingMessage] = useState<boolean>(false)

   // Comment
   const [commentInput, setCommentInput] = useState<string>('')
   const [loadedComments, setLoadedComments] = useState<CommentType[]>([])
   const [isFetchingComments, setIsFetchingComments] = useState<boolean>(false)
   const [isPostingComment, setIsPostingComment] = useState<boolean>(false)

   // Twitter
   const [twitterID, setTwitterID] = useState<string>()
   const [tweets, setTweets] = useState<TweetType[]>([])

   const { metadata } = nftData || {}
   let timer: ReturnType<typeof setTimeout>

   useEffect(() => {
      getNftMetadata()
      getOwnerAddress()
      getComments()
   }, [])

   useEffect(() => {
      getChatData()
         getComments()
         getUnreadCount()
         if (nftContractAddr) getTwitterInfo(nftContractAddr)
      const interval = setInterval(() => {
         getChatData()
         getComments()
         getUnreadCount()
         if (twitterID) {
            getTweetsFromAPI(twitterID)
         } else if (nftContractAddr) {
            getTwitterInfo(nftContractAddr)
         }
      }, 5000) // every 5s

      return () => clearInterval(interval)
   }, [account, ownerAddr])

   const getUnreadCount = () => {
      if (account) {
         fetch(
            ` ${process.env.REACT_APP_REST_API}/get_unread_cnt/${account}/${nftContractAddr}/${nftId}`,
            {
               method: 'GET',
               headers: {
                  'Content-Type': 'application/json',
               },
            }
         )
            .then((response) => response.json())
            .then((count: number) => {
               console.log('✅ [GET][NFT][No. of unread msgs]:', count)
               setUnreadCount(count)
            })
            .catch((error) => {
               console.error('🚨🚨REST API Error [GET]:', error)
            })
      }
   }

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

            let url = result.metadata && result.metadata.image
            if (url?.includes('ipfs://')) {
               let parts = url.split('ipfs://')
               let cid = parts[parts.length - 1]
               url = `https://ipfs.io/ipfs/${cid}`
               setImageUrl(url)
            } else {
               setImageUrl(url)
            }
         })
         .catch((error) => console.log('error', error))
   }

   const getTwitterHandle = async (slug: string): Promise<string|null> => {
      return fetch(`https://opensea.io/collection/${slug}`, {
         method: 'GET',
         // headers: {
         //    'Content-Type': 'application/json',
         // },
      })
         .then((response) => response.text())
         .then((data) => {
            let twitter = data.split("twitterUsername")[1].split(',')[0].replace(':', '').replace(/"/g, '')
            if (twitter === "null" || twitter === null) {
               twitter = data.split("connectedTwitterUsername")[1].split(',')[0].replace(':', '').replace(/"/g, '')
            }
            console.log('✅[GET][Twitter Handle]:', twitter)
            return Promise.resolve(twitter)
         })
         .catch((error) => {
            console.error('🚨[GET][Twitter Handle]:', error)
            return Promise.resolve(null)
         })
   }

   //if we end up implementing this, we should move to server and return the data needed
   const getTwitterID = async (_twitterHandle: string) : Promise<string|null> => {
      return fetch(`https://api.twitter.com/2/users/by/username/${_twitterHandle}`, {
         method: 'GET',
         headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAAAjRdgEAAAAAK2TFwi%2FmA5pzy1PWRkx8OJQcuko%3DH6G3XZWbJUpYZOW0FUmQvwFAPANhINMFi94UEMdaVwIiw9ne0e',
         },
      })
      .then((response) => response.json())
      .then((data) => {
         let id = null
         if (data.data) {
            id = data.data['id']
            setTwitterID(id)
            console.log('✅[GET][Twitter ID]:', id)
         }
         return Promise.resolve(id)
      })
      .catch((error) => {
         console.error('🚨[GET][Twitter ID]:', error)
         return Promise.resolve(null)
      })
   }

   const getTweetsFromAPI = (_twitterId: string) => {
      fetch(`https://api.twitter.com/2/users/${_twitterId}/tweets`, {
         method: 'GET',
         headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAAAjRdgEAAAAAK2TFwi%2FmA5pzy1PWRkx8OJQcuko%3DH6G3XZWbJUpYZOW0FUmQvwFAPANhINMFi94UEMdaVwIiw9ne0e',
         },
      })
      .then((response) => response.json())
      .then((data) => {
         console.log('✅[GET][Twitter Tweets]:', data)
         if (data.data && data.data.length > 0) {
            setTweets(data.data)
         }
      })
      .catch((error) => {
         console.error('🚨[GET][Twitter Tweets]:', error)
      })
   }

   const getTwitterInfo = async (nftContractAddr: string) => {

      fetch(`https://api.opensea.io/api/v1/asset_contract/${nftContractAddr}`, {
         method: 'GET',
         headers: {
            'Content-Type': 'application/json',
         },
      })
      .then((response) => response.json())
      .then(async (data) => {
         let collectionSlug = data['collection']
         let slug = collectionSlug['slug']
         console.log('✅[GET][Slug Info]:', slug)
         const handle = await getTwitterHandle(slug)
         if (handle) {
            const id = await getTwitterID(handle)
            if (id) getTweetsFromAPI(id)
         }
      })
      .catch((error) => {
         console.error('🚨[GET][Slug Info]:', error)
      })
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
            setOwnerAddr(result.owners[0])
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
            console.log('✅[GET][NFT][Comments]:', data)
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
            console.error('🚨🚨[POST][NFT][Comments]:', error)
         })
         .finally(() => setIsFetchingComments(false))
   }

   const handleCommentKeyPress = (
      event: KeyboardEvent<HTMLTextAreaElement>
   ) => {
      if (event.key === 'Enter') {
         event.preventDefault()
         sendComment()
      }
   }

   const sendComment = async () => {
      if (commentInput.length <= 0) return

      // Make a copy and clear input field
      const commentInputCopy = (' ' + commentInput).slice(1)
      setCommentInput('')

      const timestamp = new Date()

      let data = {
         fromAddr: account.toLocaleLowerCase(),
         nftAddr: nftContractAddr,
         nftId: typeof nftId === 'string' ? parseInt(nftId) : nftId,
         timestamp: new Date(),
         message: commentInputCopy,
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
            console.log('nft id: ', nftId)
            console.log('✅[POST][NFT][Comment]:', data)
            addCommentToUI(
               account,
               nftContractAddr,
               nftId.toString(),
               timestamp,
               commentInputCopy
            )
         })
         .catch((error) => {
            console.error(
               '🚨🚨[POST][NFT][Comment]:',
               error,
               JSON.stringify(data)
            )
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

   const getChatData = () => {
      // GET request to get off-chain data for RX user
      if (!process.env.REACT_APP_REST_API) {
         console.log('REST API url not in .env', process.env)
         return
      }
      if (!account || !recipientAddr) {
         console.log('No account connected')
         return
      }
      setIsFetchingMessages(true)
      fetch(
         ` ${process.env.REACT_APP_REST_API}/getnft_chatitems/${account}/${recipientAddr}/${nftContractAddr}/${nftId}`,
         {
            method: 'GET',
            headers: {
               'Content-Type': 'application/json',
            },
         }
      )
         .then((response) => response.json())
         .then(async (data: MessageType[]) => {
            console.log('✅[GET][NFT][Messages]:', data)

            const replica = JSON.parse(JSON.stringify(data))

            // Get data from IPFS and replace the message with the fetched text
            // for (let i = 0; i < replica.length; i++) {
            //    const rawmsg = await getIpfsData(replica[i].message)
            //    //console.log("raw message decoded", rawmsg)

            //    // let encdatablock: EncryptedMsgBlock = JSON.parse(rawmsg)

            //    // //we only need to decrypt the side we are print to UI (to or from)
            //    // let decrypted
            //    // if (replica[i].toaddr === account) {
            //    //    decrypted = await EthCrypto.decryptWithPrivateKey(
            //    //       privateKey,
            //    //       encdatablock.to
            //    //    )
            //    // } else {
            //    //    decrypted = await EthCrypto.decryptWithPrivateKey(
            //    //       privateKey,
            //    //       encdatablock.from
            //    //    )
            //    // }

            //    //replica[i].message = decrypted
            //    replica[i].message = rawmsg
            // }

            //setChatData(replica)
            setChatData(data)

            // TODO: DECRYPT MESSAGES HERE / https://github.com/cryptoKevinL/extensionAccessMM/blob/main/sample-extension/index.js
            setIsFetchingMessages(false)
         })
         .catch((error) => {
            console.error('🚨[GET][NFT][Messages]:', error)
            setIsFetchingMessages(false)
         })
   }

   const handleMessageKeyPress = (
      event: KeyboardEvent<HTMLTextAreaElement>
   ) => {
      if (event.key === 'Enter') {
         event.preventDefault()
         sendMessage()
      }
   }

   //TODO: only get this TO address public key once per conversation (was't sure where this would go yet)
   const getPublicKeyFromSettings = async () => {
      let toAddrPublicKey = ''
      await fetch(
         ` ${process.env.REACT_APP_REST_API}/get_settings/${
            recipientAddr ? recipientAddr.toLocaleLowerCase() : ''
         }`,
         {
            method: 'GET',
            headers: {
               'Content-Type': 'application/json',
            },
         }
      )
         .then((response) => response.json())
         .then(async (settings: SettingsType[]) => {
            console.log('✅ GET [Public Key]:', settings)
            toAddrPublicKey = settings[0].publickey
         })

      return await toAddrPublicKey
   }

   const sendMessage = async () => {
      if (msgInput.length <= 0) return

      // Make a copy and clear input field
      const msgInputCopy = (' ' + msgInput).slice(1)
      setMsgInput('')

      const timestamp = new Date()

      const latestLoadedMsgs = JSON.parse(JSON.stringify(loadedMsgs))

      console.log('nft id from sendMessage: ', nftId)
      let data = {
         message: msgInputCopy,
         fromAddr: account.toLocaleLowerCase(),
         toAddr: recipientAddr ? recipientAddr.toLocaleLowerCase() : '',
         timestamp,
         nftaddr: nftContractAddr,
         nftid: typeof nftId === 'string' ? parseInt(nftId) : nftId,
         read: false,
      }

      addMessageToUI(
         msgInputCopy,
         account,
         recipientAddr ? recipientAddr.toLocaleLowerCase() : '',
         timestamp,
         false,
         'right',
         true,
         "",
         null
      )

      // TODO: ENCRYPT MESSAGES HERE / https://github.com/cryptoKevinL/extensionAccessMM/blob/main/sample-extension/index.js

      // let toAddrPublicKey = await getPublicKeyFromSettings() //TODO: should only need to do this once per convo (@manapixels help move it)

      // console.log('encrypt with public key: ', toAddrPublicKey)
      // const encryptedTo = await EthCrypto.encryptWithPublicKey(
      //    toAddrPublicKey,
      //    msgInputCopy
      // )

      // //we have to encrypt the sender side with its own public key, if we want to refresh data from server
      // const encryptedFrom = await EthCrypto.encryptWithPublicKey(
      //    publicKey,
      //    msgInputCopy
      // )

      // //lets try and use IPFS instead of any actual data stored on our server
      // const cid = await postIpfsData(
      //    JSON.stringify({ to: encryptedTo, from: encryptedFrom })
      // )
      
      //const cid = await postIpfsData(msgInputCopy)
      data.message = msgInputCopy //await cid

      fetch(` ${process.env.REACT_APP_REST_API}/create_chatitem`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify(data),
      })
         .then((response) => response.json())
         .then((data) => {
            console.log('✅[POST][NFT][Send message]:', data, latestLoadedMsgs)
            getChatData()
         })
         .catch((error) => {
            console.error(
               '🚨[POST][NFT][Send message]:',
               error,
               JSON.stringify(data)
            )
         })
   }

   const addMessageToUI = (
      message: string,
      fromAddr: string,
      toAddr: string,
      timestamp: Date,
      read: boolean,
      position: string,
      isFetching: boolean,
      nftAddr: string | null,
      nftId: number | null
   ) => {
      console.log(`Add message to UI: ${message}`)

      const newMsg: MessageUIType = {
         message,
         fromAddr,
         toAddr,
         timestamp,
         read,
         position,
         isFetching,
         nftAddr,
         nftId
      }
      let newLoadedMsgs: MessageUIType[] = [...loadedMsgs] // copy the old array
      newLoadedMsgs.push(newMsg)
      setLoadedMsgs(newLoadedMsgs)
   }

   const updateRead = (data: MessageUIType) => {
      let indexOfMsg = -1
      let newLoadedMsgs = [...loadedMsgs]
      for (let i = newLoadedMsgs.length - 1; i > 0; i--) {
         if (newLoadedMsgs[i].timestamp === data.timestamp) {
            indexOfMsg = i
            break
         }
      }
      if (indexOfMsg !== -1) {
         newLoadedMsgs[indexOfMsg] = {
            ...newLoadedMsgs[indexOfMsg],
            read: true,
         }
         setLoadedMsgs(newLoadedMsgs)
      }
   }

   const copyToClipboard = () => {
      if (recipientAddr) {
         console.log('Copy to clipboard', recipientAddr)
         let textField = document.createElement('textarea')
         textField.innerText = recipientAddr
         document.body.appendChild(textField)
         textField.select()
         document.execCommand('copy')
         textField.focus()
         textField.remove()
         setCopiedAddr(true)

         window.clearTimeout(timer)
         timer = setTimeout(() => {
            setCopiedAddr(false)
         }, 3000)
      }
   }

   useEffect(() => {
      const toAddToUI = [] as MessageUIType[]

      for (let i = 0; i < chatData.length; i++) {
         if (
            chatData[i] &&
            chatData[i].toaddr &&
            chatData[i].toaddr.toLowerCase() === account.toLowerCase()
         ) {
            toAddToUI.push({
               message: chatData[i].message,
               fromAddr: chatData[i].fromaddr,
               toAddr: chatData[i].toaddr,
               timestamp: chatData[i].timestamp,
               read: chatData[i].read,
               id: chatData[i].id,
               position: 'left',
               isFetching: false,
               nftAddr: chatData[i].nftaddr,
               nftId: chatData[i].nftid
            })
         } else if (
            chatData[i] &&
            chatData[i].toaddr &&
            chatData[i].fromaddr.toLowerCase() === account.toLowerCase()
         ) {
            toAddToUI.push({
               message: chatData[i].message,
               fromAddr: chatData[i].fromaddr,
               toAddr: chatData[i].toaddr,
               timestamp: chatData[i].timestamp,
               read: chatData[i].read,
               id: chatData[i].id,
               position: 'right',
               isFetching: false,
               nftAddr: chatData[i].nftaddr,
               nftId: chatData[i].nftid
            })
         }
      }
      setLoadedMsgs(toAddToUI)
   }, [chatData, account])

   return (
      <Flex flexDirection="column" background="white" height="100vh">
         <Flex alignItems="center" mb={2} p={5}>
            {imageUrl && (
               <Image
                  src={imageUrl}
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
               {ownerAddr && (
                  <Box>
                     <Text fontSize="md" color="lightgray.800">
                        Owned by {truncateAddress(ownerAddr)}{' '}
                        <Link
                           to={`https://etherscan.io/address/${ownerAddr}`}
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
         <Tabs
            display="flex"
            flexDirection="column"
            overflowY="auto"
            flexGrow={1}
         >
            <TabList padding="0 var(--chakra-space-5)">
               <Tab>
                  Chat{' '}
                  {unreadCount && unreadCount !== 0 ? (
                     <Badge variant="black" ml={1}>
                        {unreadCount} xx
                     </Badge>
                  ) : (
                     <></>
                  )}
               </Tab>
               <Tab>
                  Comments{' '}
                  <Badge variant="black" ml={1}>
                     {loadedComments.length}
                  </Badge>
               </Tab>
               {tweets && tweets.length > 0 && (
                  <Tab>
                     Update{' '}
                     <Badge variant="black" ml={1}>
                        {tweets.length}
                     </Badge>
                  </Tab>
               )}
            </TabList>

            <TabPanels
               overflowY="auto"
               className="custom-scrollbar"
               height="100%"
            >
               <TabPanel px="0" height="100%" padding="0">
                  <Flex flexDirection="column" height="100%">
                     {recipientAddr && (
                        <Flex
                           alignItems="center"
                           justifyContent="space-between"
                           padding="var(--chakra-space-4) var(--chakra-space-5)"
                        >
                           <Flex alignItems="center">
                              <BlockieWrapper>
                                 <Blockies
                                    seed={recipientAddr.toLocaleLowerCase()}
                                    scale={4}
                                 />
                              </BlockieWrapper>
                              <Box>
                                 <Text
                                    ml={2}
                                    fontSize="md"
                                    fontWeight="bold"
                                    color="darkgray.800"
                                 >
                                    {truncateAddress(recipientAddr)}
                                 </Text>
                                 {/* {ens && (
                           <Text fontWeight="bold" color="darkgray.800">
                              {ens}
                           </Text>
                        )} */}
                              </Box>
                           </Flex>
                           <Box>
                              {document.queryCommandSupported('copy') && (
                                 <Button
                                    onClick={() => copyToClipboard()}
                                    size="xs"
                                    disabled={copiedAddr}
                                    ml={3}
                                 >
                                    {copiedAddr ? (
                                       <IconCheck
                                          size={20}
                                          color="var(--chakra-colors-darkgray-500)"
                                          stroke="1.5"
                                       />
                                    ) : (
                                       <IconCopy
                                          size={20}
                                          color="var(--chakra-colors-lightgray-900)"
                                          stroke="1.5"
                                       />
                                    )}
                                 </Button>
                              )}
                              <Button
                                 href={`https://etherscan.io/address/${recipientAddr}`}
                                 target="_blank"
                                 as={CLink}
                                 size="xs"
                                 ml={2}
                              >
                                 <IconExternalLink
                                    size={20}
                                    color="var(--chakra-colors-lightgray-900)"
                                    stroke="1.5"
                                 />
                              </Button>
                           </Box>
                        </Flex>
                     )}
                     <DottedBackground className="custom-scrollbar">
                        {isFetchingMessages && loadedMsgs.length === 0 && (
                           <Flex
                              justifyContent="center"
                              alignItems="center"
                              height="100%"
                           >
                              <Spinner />
                           </Flex>
                        )}
                        {loadedMsgs.map((msg: MessageUIType, i) => {
                           if (msg && msg.message) {
                              return (
                                 <Message
                                    key={`${msg.message}${msg.timestamp}`}
                                    account={account}
                                    msg={msg}
                                    updateRead={updateRead}
                                 />
                              )
                           }
                           return null
                        })}
                     </DottedBackground>

                     <Flex>
                        <FormControl style={{ flexGrow: 1 }}>
                           <TextareaAutosize
                              placeholder="Write a message..."
                              value={msgInput}
                              onChange={(e) => setMsgInput(e.target.value)}
                              onKeyPress={(e) => handleMessageKeyPress(e)}
                              className="custom-scrollbar"
                              style={{
                                 resize: 'none',
                                 padding: '.5rem 1rem',
                                 width: '100%',
                                 fontSize: 'var(--chakra-fontSizes-md)',
                                 background:
                                    'var(--chakra-colors-lightgray-400)',
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
                              onClick={() => sendMessage()}
                           >
                              <IconSend size="20" />
                           </Button>
                        </Flex>
                     </Flex>
                  </Flex>
               </TabPanel>
               <TabPanel p={5}>

                  <Flex mb={5}>
                     <FormControl style={{ flexGrow: 1 }}>
                        <TextareaAutosize
                           placeholder="Comment..."
                           value={commentInput}
                           onChange={(e) => setCommentInput(e.target.value)}
                           onKeyPress={(e) => handleCommentKeyPress(e)}
                           className="custom-scrollbar"
                           style={{
                              resize: 'none',
                              padding: '.5rem 1rem',
                              width: '100%',
                              fontSize: 'var(--chakra-fontSizes-md)',
                              background:
                                 'var(--chakra-colors-lightgray-400)',
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
               <TabPanel p={5}>
               {tweets && tweets.map((tweet: TweetType, i) => (
                     <>
                        <Tweet data={tweet} key={i} />
                        {i + 1 !== tweets.length && <Divider mb={4} />}
                     </>
                  ))}
               </TabPanel>
            </TabPanels>
         </Tabs>
      </Flex>
   )
}

// const dummyComments: CommentType[] = [
//    {
//       fromAddr: '0x8999531b12D3577c50D9bEb8E2C1857C7cA62808',
//       nftAddr: nftContractAddr,
//       nftId: parseInt(nftId),
//       timestamp: new Date().toISOString(),
//       message:
//          'Sed lacus mi, rutrum sed sem sagittis, imperdiet pellentesque purus. Pellentesque mi libero, varius non fermentum sed, bibendum sed metus. Quisque id turpis ut dui posuere luctus.',
//    },
//    {
//       fromAddr: '0x19871B6F5f64657d6Bf35C88b628F3d1778db81d',
//       nftAddr: nftContractAddr,
//       nftId: parseInt(nftId),
//       timestamp: new Date().toISOString(),
//       message: 'Proin ac diam ac elit molestie vehicula vitae nec felis.',
//    },
//    {
//       fromAddr: '0x91D7A110E0cE462d428F3ac700b4371990735517',
//       nftAddr: nftContractAddr,
//       nftId: parseInt(nftId),
//       timestamp: new Date(
//          new Date().setDate(new Date().getDate() - 1)
//       ).toISOString(),
//       message:
//          'Donec tristique, magna sed sodales eleifend, lectus ligula tempor enim, non porttitor ipsum nibh id odio. Sed lorem nisl, venenatis sed lorem et, euismod porttitor orci. ',
//    },
//    {
//       fromAddr: '0xbf9ceF53327Be908CBcFe1D8d217852d44b027de',
//       nftAddr: nftContractAddr,
//       nftId: parseInt(nftId),
//       timestamp: new Date(
//          new Date().setDate(new Date().getDate() - 1)
//       ).toISOString(),
//       message: 'Vivamus vel lectus a neque blandit viverra.',
//    },
//    {
//       fromAddr: '0x785F375F2B819d875Ce07009a15779E9c3679C1D',
//       nftAddr: nftContractAddr,
//       nftId: parseInt(nftId),
//       timestamp: new Date(
//          new Date().setDate(new Date().getDate() - 2)
//       ).toISOString(),
//       message:
//          'Quisque vitae neque nunc. In hac habitasse platea dictumst. Phasellus gravida fringilla nisl at malesuada. Pellentesque vitae ipsum at elit ultrices facilisis.',
//    },
// ]

export default NFT
