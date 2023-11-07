import {
  Box,
  Button,
  Flex,
  Image,
  SkeletonText,
  Spinner,
  Text,
  Tooltip,
} from '@chakra-ui/react'
import { Link as RLink } from 'react-router-dom'
import styled from 'styled-components'
import { parseDomain } from 'parse-domain'
import {
  IconCheck,
  IconChecks,
  IconExternalLink,
  IconAlertCircle,
} from '@tabler/icons'
import { useCallback, useEffect, useState, memo, useRef } from 'react'
import equal from 'fast-deep-equal/es6'
import {
  getInboxDmDataForAccount,
  getInboxFrom,
  getLocalDmDataForAccountToAddr,
  updateLocalDmDataForAccountToAddr,
  updateLocalInboxDataForAccount,
  updateQueryChatData,
  updateQueryData,
  useGetNameQuery,
} from '@/redux/reducers/dm'
import { CHAT_CONTEXT_TYPES } from '@/constants'
import { formatMessageDate } from '../../helpers/date'
import { MessageUIType } from '../../types/Message'
import NFT from '../../types/NFT'
import OpenSeaNFT, { openseaToGeneralNFTType } from '../../types/OpenSea/NFT'
import AlchemyNFT, { alchemyToGeneralNFTType } from '../../types/Alchemy/NFT'
import UserProfileContextMenu from '../UserProfileContextMenu'
import { useIsInViewport } from '../../helpers/useIsInViewport'
import * as ENV from '@/constants/env'
import Avatar from '../Inbox/DM/Avatar'
import { useAppDispatch } from '@/hooks/useDispatch'
import { truncateAddressMore } from '@/helpers/truncateString'
import { getJwtForAccount } from '@/helpers/jwt'
import { log } from '@/helpers/log'

const MessageBox = styled.div`
  position: relative;
  width: auto;
  min-width: 75px;
  max-width: 80%;
  height: auto;
  background: #fff;
  background: var(--chakra-colors-lightgray-300);
  border-radius: var(--chakra-radii-md);
  padding: var(--chakra-space-2) var(--chakra-space-3) var(--chakra-space-5);
  font-size: var(--chakra-fontSizes-md);
  clear: both;
  word-break: break-word;

  .msg-img {
    display: inline-block;
  }

  .msg-bubble {
    display: inline-block;
  }

  .name {
    color: var(--chakra-colors-information-600);
  }

  &.left {
    float: left;
    background: #fff;
  }
  &.right {
    float: left;
    background: var(--chakra-colors-black);
    color: var(--chakra-colors-lightgray-100);

    .name {
      color: var(--chakra-colors-white);
    }
    .chakra-menu__menu-list {
      color: #000;
    }

    .nft-context-btn {
      background: var(--chakra-colors-darkgray-600);
      color: var(--chakra-colors-lightgray-500);
      color: var(--chakra-colors-white);
      &:hover {
        background: var(--chakra-colors-darkgray-500);
        color: var(--chakra-colors-lightgray-500);
      }
    }
  }
  .timestamp {
    display: block;
    position: absolute;
    /* right: var(--chakra-space-7); */
    right: var(--chakra-space-2);
    bottom: var(--chakra-space-2);
    color: #aaa;
    font-size: var(--chakra-fontSizes-sm);
    user-select: none;
    line-height: 1.2;
  }
  &.left {
    .timestamp {
      right: var(--chakra-space-2);
    }
  }
  .read-status {
    position: absolute;
    right: var(--chakra-space-2);
    bottom: var(--chakra-space-2);
    svg {
      stroke: var(--chakra-colors-lightgray-800);
    }
  }
  .read-status.alert {
    svg {
      stroke: var(--chakra-colors-red-500);
    }
  }
  &.read:not(.left) {
    .timestamp {
      color: darkgreen;
      user-select: none;
    }
    .read-status {
      svg {
        stroke: darkgreen;
      }
    }
  }
  &.right {
    &.read {
      .timestamp {
        color: var(--chakra-colors-success-500);
        user-select: none;
      }
      .read-status {
        svg {
          stroke: var(--chakra-colors-success-500);
        }
      }
    }
  }
`

const ChatMessage = ({
  context,
  account,
  msg,
  pending,
  hasPendingMsgs,
}: {
  context: (typeof CHAT_CONTEXT_TYPES)[number]
  account: string | undefined
  msg: MessageUIType
  pending?: boolean
  hasPendingMsgs?: boolean
}) => {
  const sender = msg?.fromaddr || msg?.fromAddr
  const { data: senderName } = useGetNameQuery(sender, {
    selectFromResult: (options) =>
      // TODO: use localStorage, for own account, use same value for account name
      ({ ...options, data: options.data || truncateAddressMore(sender) }),
  })

  const dispatch = useAppDispatch()
  const [message, setMessage] = useState(msg.message);
  const [nftData, setNftData] = useState<NFT>()
  const fromAddr = msg?.fromaddr || msg?.fromAddr

  const messageRef = useRef(null)
  const isInViewport = useIsInViewport(messageRef)

  const msgSentByMe =
    fromAddr?.toLocaleLowerCase() === account?.toLocaleLowerCase()
  const msgPosition = msgSentByMe ? 'right' : 'left'

  useEffect(() => {
    const getNftMetadata = () => {
      if (!msg.nftAddr || !msg.nftId) {
        // log('Missing contract address or id')
        return
      }

      const fetchFromOpenSea = () => {
        //`https://api.opensea.io/api/v1/asset/${msg.nftAddr}/${msg.nftId}?account_address=${account}`,
        fetch(`${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/opensea_asset/${msg.nftAddr}/${msg.nftId}/${account}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
             'Content-Type': 'application/json',
             Authorization: `Bearer ${getJwtForAccount(account)}`,
          },
         })
          .then((response) => response.json())
          .then((result: OpenSeaNFT) => {
            if (result?.collection?.name && !equal(result, nftData)) {
              log(`✅[GET][NFT]:`, result)
              setNftData(openseaToGeneralNFTType(result))
            }
          })
          .catch((error) => {
            log(`🚨[GET][NFT Contract][OpenSea]:`, error)
            fetchFromAlchemy()
          })
      }

      const fetchFromAlchemy = () => {
        if (ENV.REACT_APP_ALCHEMY_API_KEY_POLYGON === undefined) {
          log('Missing Alchemy API Key')
          return
        }
        fetch(
          `https://polygon-mainnet.g.alchemy.com/v2/${ENV.REACT_APP_ALCHEMY_API_KEY_POLYGON}/getNFTMetadata?contractAddress=${msg?.nftAddr}&tokenId=${msg?.nftId}`,
          {
            method: 'GET',
          }
        )
          .then((response) => response.json())
          .then((data: AlchemyNFT) => {
            log('✅[GET][NFT Metadata]:', data)
            setNftData(alchemyToGeneralNFTType(data))
          })
          .catch((error) => log('error', error))
      }

      fetchFromOpenSea()
    }
    if (context === 'nft') {
      getNftMetadata()
    }
  }, [msg, account, context, nftData])

  function extractUrlsFromMessage(messageIn) {
    let returnUrls = []
    // Regular expression to match URLs in the message
    const urlRegex = /((https?|ftp):\/\/[^\s/$.?#].[^\s]*)|(\b[\w-]+(\.[\w-]+)+\b)/ig;
  
    // Use the regular expression to find all URLs in the message
    const urls = messageIn.match(urlRegex);
  
    if (urls?.length > 0) {
      // Filter out invalid URLs
      returnUrls = urls.filter((url) => {
        //standardize what we send to parse-domain
        url = url.replace('https://', '');
        url = url.replace('http://', '');
        url = url.replace('www.', '');
      
        const backslashIndex = url.indexOf('/');
        if (backslashIndex !== -1) {
          url = url.substring(0, backslashIndex);
        }

        const parsedDomain = parseDomain(url);
        // Check if the top-level domain is valid
        return parsedDomain && parsedDomain.type == 'LISTED';
      });
    }
  
    return returnUrls;
  }    

  function replaceBlockedUrls(statusArray, messageIn) {
    // Regular expression to match both http and https URLs
    const urlRegex = /((https?|ftp):\/\/[^\s/$.?#].[^\s]*)|(\b[\w-]+(\.[\w-]+)+\b)/ig;
  
    // Extract all URLs from the message
    const urlsInMessage = messageIn.match(urlRegex) || [];
  
    // Iterate through the URLs and their corresponding statuses
    urlsInMessage.forEach((url, index) => {
      const status = statusArray[index];
      if (status === "BLOCK") {
        messageIn = messageIn.replace(url, "URL_BLOCKED_BY_WALLETGUARD");
      }
    });
  
    return messageIn;
  }

  const handleScanAndRemoveURL = async (messageIn) => {
    let returnVal = messageIn
    //if (message.includes("https") || message.includes("http")) {

      const urls = extractUrlsFromMessage(message)

      if (urls?.length > 0) {
        await fetch(
          ` ${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/wallet_guard_check`,
          {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${getJwtForAccount(account)}`,
            },
            body: JSON.stringify(urls),
          }
        )
          .then((response) => response.json())
          .then((recommendedActions: string[]) => {
            log('✅[POST][WalletGuard Link Check]:', recommendedActions)

            const updatedMessage = replaceBlockedUrls(recommendedActions, messageIn) 
            log('Updated Message:', updatedMessage)
            setMessage(updatedMessage); // Update the local variable
            returnVal = updatedMessage
          })
          .catch((error) => {
            console.error('🚨[GET][WalletGuard URL Check]:', error)
          })
      }
     //}

     return returnVal
  };


  const setMessageAsRead = useCallback(() => {
    if (msg.toaddr && fromAddr && msg.timestamp && account && !msg.read) {
      fetch(
        ` ${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/update_chatitem/${fromAddr}/${msg.toaddr}}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getJwtForAccount(account)}`,
          },
          body: JSON.stringify({ ...msg, read: true }),
        }
      )
        .then((response) => response.json())
        .then(async (data) => {
          log('✅[PUT][Message]:', data)

          //WalletGuard API To check for scam links
          const updatedMessageNoBadLinks = await handleScanAndRemoveURL(message);
          //console.log("updatedMessageNoBadLinks: ", updatedMessageNoBadLinks)

          dispatch(
              updateQueryChatData({ account, toAddr: fromAddr }, () => {
              let currentChatData: any = (
                getLocalDmDataForAccountToAddr(account, fromAddr) || []
              )
              
              currentChatData = currentChatData.map((dataMsg: MessageUIType, i: number) => {
                if (dataMsg.Id === msg.Id) {
                  // Update the 'read' property to true for the matching message
                  // also update the message data locally in case WGuard blocked a bad link 
                  return { ...dataMsg, read: true, message: updatedMessageNoBadLinks};
                }
                return dataMsg; // Return the original message for non-matching messages
              });

              updateLocalDmDataForAccountToAddr(
                account,
                fromAddr,
                currentChatData
              )

              const newChatData = getLocalDmDataForAccountToAddr(
                account,
                fromAddr
              )

              return JSON.stringify({ messages: newChatData })
            })
          )

          if (account !== fromAddr) {
            dispatch(
              updateQueryData('getInbox', account, () => {
                const storedInboxData = getInboxDmDataForAccount(account)
                const unreadInbox =
                  storedInboxData.dm[getInboxFrom(account, data)]

                const newInboxItem = unreadInbox &&
                  unreadInbox.read === false && {
                    ...unreadInbox,
                    read: true,
                    unread: 0,
                  }

                if (newInboxItem) {
                  updateLocalInboxDataForAccount(account, [newInboxItem])
                }

                return JSON.stringify(getInboxDmDataForAccount(account))
              })
            )
          }
        })
        .catch((error) => {
          console.error('🚨[PUT][Message]:', error)
        })
    }
  }, [msg, account, fromAddr, dispatch])

  useEffect(async () => {
    if (
      context == 'dm' &&
      isInViewport &&
      msg?.read === false &&
      !msgSentByMe
    ) {
        setMessageAsRead()
    } else if (context != 'dm') {
      //WalletGuard API To check for scam links
      const updatedMessageNoBadLinks = await handleScanAndRemoveURL(message);
      //console.log("updatedMessageNoBadLinks: ", updatedMessageNoBadLinks)
      setMessage(updatedMessageNoBadLinks)
    }
  }, [context, isInViewport, msg, msgSentByMe, setMessageAsRead])

  return (
    <Flex
      alignItems='flex-start'
      margin='var(--chakra-space-3) var(--chakra-space-4)'
    >
      <Box
        className='msg-img'
        style={{ backgroundImage: `url(${msg.img})` }}
        padding='var(--chakra-space-2) var(--chakra-space-3)'
      >
        {fromAddr && (
          <UserProfileContextMenu address={fromAddr}>
            <Avatar account={fromAddr} />
          </UserProfileContextMenu>
        )}
      </Box>

      <MessageBox
        className={`msg ${msgPosition} ${msg.read && 'read'}`}
        ref={messageRef}
      >
        <Box className='msg-bubble'>
          {senderName && fromAddr && (
            <Flex>
              <UserProfileContextMenu address={fromAddr}>
                <Text fontSize='md' className='name'>
                  {senderName}
                </Text>
              </UserProfileContextMenu>

              {/* {pending && (
                <Text
                  marginLeft='2'
                  fontSize='md'
                  className='name'
                  as='i'
                  color='grey !important'
                >
                  Message being decrypted...
                </Text>
              )} */}
            </Flex>
          )}

          {/* {pending ? (
            <SkeletonText
              width='200px'
              skeletonHeight='10px'
              noOfLines={1}
              marginBottom='2'
            />
          ) : ( */}
            <Box>
              {msg.message?.includes("giphy.com") 
                ? 
                  <Image src={msg.message} alt='' height={60} width={60} />
                : 
                  msg.message
              }
              {/* {msg.message} */}
            </Box>
          {/* )} */}
          <Box
            d='inline-block'
            className='timestamp'
            style={{
              right: msgSentByMe
                ? 'var(--chakra-space-7)'
                : 'var(--chakra-space-2)',
            }}
          >
            {formatMessageDate(new Date(msg.timestamp))}
          </Box>

          {msgPosition === 'right' &&
            //  (msg.Id !== -1 ? (
              <span className='read-status'>
                {msg.read ? <IconChecks size={15} /> : <IconCheck size={15} />}
              </span>
            // ) : msg.failed ? (
            //   <Tooltip label='Message Failed'>
            //     <span className='read-status alert'>
            //       <IconAlertCircle size={15} color='red' />
            //     </span>
            //   </Tooltip>
            // )
            // : (
            //   <Spinner size='xs' className='read-status' />
            // )
            //)
          }
        </Box>
        {msg.nftAddr && msg.nftId && account && (
          <Box mb={1}>
            {nftData && (
              <RLink
                to={`/nft/ethereum/${msg.nftAddr}/${msg.nftId}?recipient=${
                  !msgSentByMe ? fromAddr : msg.toAddr
                }`}
                style={{ textDecoration: 'none' }}
              >
                <Button p={2} height='auto' className='nft-context-btn'>
                  <Flex alignItems='center'>
                    {nftData?.image && (
                      <Image
                        src={nftData?.image}
                        alt=''
                        height='15px'
                        borderRadius='var(--chakra-radii-sm)'
                        mr={1}
                      />
                    )}
                    {nftData?.name && (
                      <Text mr={1} fontSize='sm'>
                        {nftData?.name}
                      </Text>
                    )}
                    <IconExternalLink
                      size='13'
                      color='var(--chakra-colors-lightgray-900)'
                    />
                  </Flex>
                </Button>
              </RLink>
            )}
          </Box>
        )}
      </MessageBox>
    </Flex>
  )
}

export default memo(ChatMessage)