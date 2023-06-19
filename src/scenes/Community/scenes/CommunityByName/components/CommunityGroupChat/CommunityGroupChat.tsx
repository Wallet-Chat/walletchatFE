import {
  Box,
  Button,
  Divider,
  Flex,
  Spinner,
  Tag,
  Text,
  Icon, 
  InputRightElement,
  InputGroup, 
  Popover, 
  PopoverTrigger, 
  PopoverContent, 
  Textarea, 
} from '@chakra-ui/react'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { BsEmojiSmile } from "react-icons/bs"
import { IconSend } from '@tabler/icons'
import { useEffect, useState, KeyboardEvent, useRef } from 'react'
import { Link as RLink } from 'react-router-dom'
import TextareaAutosize from 'react-textarea-autosize'
import ChatMessage from '../../../../../../components/Chat/ChatMessage'
import { getFormattedDate } from '../../../../../../helpers/date'
import { truncateAddress } from '../../../../../../helpers/truncateString'
import { DottedBackground } from '../../../../../../styled/DottedBackground'
import * as ENV from '@/constants/env'
import { log } from '@/helpers/log'

import {
  GroupMessageType,
  MessageUIType,
} from '../../../../../../types/Message'
import generateItems from '../../../../helpers/generateGroupedByDays'
import { AnalyticsBrowser } from '@segment/analytics-next'
import ReactGA from "react-ga4";
import Analytics from 'analytics'
import googleAnalyticsPlugin from '@analytics/google-analytics'
import { getJwtForAccount } from '@/helpers/jwt'

const CommunityGroupChat = ({
  account,
  community,
  chatData,
  isFetchingCommunityDataFirstTime,
}: {
  account: string | undefined
  community: string
  chatData: GroupMessageType[]
  isFetchingCommunityDataFirstTime: boolean
}) => {
  const [firstLoad, setFirstLoad] = useState(true)
  const [msgInput, setMsgInput] = useState<string>('')
  const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false)
  const [loadedMsgs, setLoadedMsgs] = useState<MessageUIType[]>([])

  const scrollToBottomRef = useRef<HTMLDivElement>(null)
  const analytics = AnalyticsBrowser.load({ writeKey: ENV.REACT_APP_SEGMENT_KEY as string })
 ReactGA.initialize(ENV.REACT_APP_GOOGLE_GA4_KEY);
   /* Initialize analytics instance */
   const analyticsGA4 = Analytics({
    app: 'WalletChatApp',
    plugins: [
      /* Load Google Analytics v4 */
      googleAnalyticsPlugin({
        measurementIds: [ENV.REACT_APP_GOOGLE_GA4_KEY],
      }),
    ],
  })

  useEffect(() => {
    const toAddToUI = [] as MessageUIType[]

    for (let i = 0; i < chatData.length; i++) {
      if (
        account &&
        chatData[i] &&
        chatData[i].fromaddr &&
        chatData[i].fromaddr.toLowerCase() === account.toLowerCase()
      ) {
        toAddToUI.push({
          sender_name: chatData[i].sender_name,
          type: chatData[i].type,
          message: chatData[i].message,
          fromAddr: chatData[i].fromaddr,
          timestamp: chatData[i].timestamp,
          position: 'right',
          isFetching: false,
        })
      } else {
        toAddToUI.push({
          sender_name: chatData[i].sender_name,
          type: chatData[i].type,
          message: chatData[i].message,
          fromAddr: chatData[i].fromaddr,
          timestamp: chatData[i].timestamp,
          position: 'left',
          isFetching: false,
        })
      }
    }
    const items = generateItems(toAddToUI)
    setLoadedMsgs(items)
  }, [chatData, account])

  useEffect(() => {
    // Scroll to bottom of chat once all messages are loaded
    if (scrollToBottomRef?.current && firstLoad) {
      scrollToBottomRef.current.scrollIntoView()

      setTimeout(() => {
        setFirstLoad(false)
      }, 5000)
    }
  }, [loadedMsgs])

  const handleKeyPress = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      sendMessage()
    }
  }

  const sendMessage = async () => {
    if (msgInput.length <= 0) return
    if (!account) {
      log('No account connected')
      return
    }

    analytics.track('SendCommunityMessage', {
       site: document.referrer,
       community,
       account
     });
    // ReactGA.event({
    //   category: "SendCommunityMessageCategory",
    //   action: "SendCommunityMessage",
    //   label: "SendCommunityLabel", // optional
    // });
    analyticsGA4.track('SendCommunityMessage', {
      site: document.referrer,
      community,
      account
    });

    // Make a copy and clear input field
    const msgInputCopy = (' ' + msgInput).slice(1)
    setMsgInput('')

    const timestamp = new Date()

    const latestLoadedMsgs = JSON.parse(JSON.stringify(loadedMsgs))

    let data = {
      type: 'message',
      message: msgInputCopy,
      nftaddr: community,
      fromaddr: account.toLocaleLowerCase(),
      timestamp,
    }

    addMessageToUI(
      'message',
      msgInputCopy,
      account,
      timestamp.toString(),
      'right',
      false
    )

    data.message = msgInputCopy

    setIsSendingMessage(true)

    fetch(`${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/community`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getJwtForAccount(account)}`,
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        log('✅[POST][Community][Message]:', data, latestLoadedMsgs)
      })
      .catch((error) => {
        console.error(
          '🚨[POST][Community][Message]:',
          error,
          JSON.stringify(data)
        )
      })
      .finally(() => {
        setIsSendingMessage(false)
      })
  }

  const addMessageToUI = (
    type: string,
    message: string,
    fromaddr: string,
    timestamp: string,
    position: string,
    isFetching: boolean
  ) => {
    log(`Add message to UI: ${message}`)

    const newMsg: MessageUIType = {
      type,
      message,
      fromAddr: fromaddr,
      timestamp,
      position,
      isFetching,
    }
    let newLoadedMsgs: MessageUIType[] = [...loadedMsgs] // copy the old array
    newLoadedMsgs.push(newMsg)
    setLoadedMsgs(newLoadedMsgs)
  }

  const addEmoji = (e: any) => {
    const sym = e.unified.split("_");
    const codeArray: any[] = [];
    sym.forEach((el: string) => codeArray.push("0x" + el));
    let emoji = String.fromCodePoint(...codeArray)
    setMsgInput(msgInput + emoji);
  }

  return (
    <Flex flexDirection='column' height='100%'>
      <DottedBackground className='custom-scrollbar'>
        {loadedMsgs.length === 0 && (
          <Flex
            justifyContent='center'
            alignItems='center'
            borderRadius='lg'
            background='white'
            p={4}
          >
            <Box fontSize='md'>
              {isFetchingCommunityDataFirstTime ? (
                <Spinner />
              ) : (
                'Be the first to post something here 😉'
              )}
            </Box>
          </Flex>
        )}
        {loadedMsgs.map((msg, i) => {
          if (msg.type && msg.type === 'day') {
            return (
              <Box position='relative' my={6} key={msg.timestamp}>
                <Tag
                  color='lightgray.800'
                  background='lightgray.200'
                  fontSize='xs'
                  fontWeight='bold'
                  mb={1}
                  position='absolute'
                  right='var(--chakra-space-4)'
                  top='50%'
                  transform='translateY(-50%)'
                >
                  {getFormattedDate(msg.timestamp.toString())}
                </Tag>
                <Divider />
              </Box>
            )
          } else if (msg.type && msg.type === 'welcome') {
            return (
              <Box textAlign='center' key={msg.timestamp}>
                <Text fontSize='sm' color='darkgray.200'>
                  A warm welcome to{' '}
                  <RLink to={`/dm/${msg.fromAddr}`}>
                    {msg.sender_name
                      ? msg.sender_name
                      : truncateAddress(msg.fromAddr)}
                  </RLink>
                </Text>
              </Box>
            )
          } else if (msg.message) {
            return (
              <ChatMessage
                key={msg.timestamp}
                context='community'
                account={account}
                msg={msg}
              />
            )
          }
          return null
        })}
        <Box
          float='left'
          style={{ clear: 'both' }}
          ref={scrollToBottomRef}
        ></Box>
      </DottedBackground>

      <Flex>
        <InputGroup resize="none" w="100%" fontSize="md" background="lightgray.400" borderRadius="xl">
          <Textarea
            placeholder="Write a message..."
            onChange={(e) => setMsgInput(e.target.value)}
            value={msgInput}
            onKeyPress={handleKeyPress}
            minH="full"
            resize="none"
          />
          <Popover placement="top-start" isLazy>
            <PopoverTrigger>
              <InputRightElement top="10px" right="10px">
                <Icon as={BsEmojiSmile} color="red.500" h={5} w={5} />
              </InputRightElement>
            </PopoverTrigger>
            <PopoverContent w="285px">
              <Picker
                data={data}
                emojiSize={20}
                emojiButtonSize={28}
                onEmojiSelect={addEmoji}
                maxFrequentRows={4}
              />
            </PopoverContent>
          </Popover>
        </InputGroup>
        <Flex alignItems="flex-end">
          <Button variant="black" height="100%" onClick={sendMessage} isLoading={isSendingMessage}>
            <IconSend size="20" />
          </Button>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default CommunityGroupChat
