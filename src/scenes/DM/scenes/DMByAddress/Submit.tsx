import React, { useState } from 'react'
import { AnalyticsBrowser } from '@segment/analytics-next'
import ReactGA from "react-ga4";
import Analytics from 'analytics'
import googleAnalyticsPlugin from '@analytics/google-analytics'
import { IconSend } from '@tabler/icons'
import { Textarea, Button, Flex, Icon, Popover, PopoverTrigger, PopoverContent, PopoverBody, InputRightElement, InputLeftElement, Container } from '@chakra-ui/react'
import { BsEmojiSmile } from "react-icons/bs"
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { postFetchOptions } from '@/helpers/fetch'
import lit from '../../../../utils/lit'
import * as ENV from '@/constants/env'
import {
  updateLocalDmDataForAccountToAddr,
  addLocalDmDataForAccountToAddr,
  addPendingDmDataForAccountToAddr,
  getLocalDmDataForAccountToAddr,
  endpoints,
  updateQueryChatData,
} from '@/redux/reducers/dm'
import { useAppDispatch } from '@/hooks/useDispatch'
import { ChatMessageType, CreateChatMessageType } from '@/types/Message'
import { getAccessControlConditions } from '@/helpers/lit'
import { useWallet } from '@/context/WalletProvider'
import { log } from '@/helpers/log'

function Submit({ toAddr, account }: { toAddr: string; account: string }) {
  const { provider } = useWallet()

  const { currentData: name } = endpoints.getName.useQueryState(
    account?.toLocaleLowerCase()
  )

  const dispatch = useAppDispatch()

  const textAreaRef = React.useRef<HTMLTextAreaElement>(null)
  // const msgInput = React.useRef<string>('')
  const [msgInput, setMsgInput] = useState<string>("")
  const analytics = AnalyticsBrowser.load({
    writeKey: ENV.REACT_APP_SEGMENT_KEY as string,
  })
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
  ReactGA.initialize(ENV.REACT_APP_GOOGLE_GA4_KEY);

  const pendingMsgs = React.useRef<
    {
      createMessageData: CreateChatMessageType
      newMessage: ChatMessageType
      timestamp: string
    }[]
  >([])

  const addPendingMessageToUI = (newMessage: ChatMessageType) =>
    dispatch(
      updateQueryChatData({ account, toAddr }, () => {
        const currentChatData =
          getLocalDmDataForAccountToAddr(account, toAddr) || []
        currentChatData.push(newMessage)
        //TODO - clean up a bit once we got back to e2e encryption, sending might look slow with the status bar on send (only want for RX side)
        addPendingDmDataForAccountToAddr(account, toAddr, newMessage) 
        //updateLocalDmDataForAccountToAddr(account, toAddr, currentChatData) //this was used originally, but race condition for "double message" occured
                                                                              //it was because accessing Local Storage and operating on read items was out of sync

        const newChatData = getLocalDmDataForAccountToAddr(account, toAddr)

        return JSON.stringify({ messages: newChatData })
      })
    )

  const updateSentMessage = (message: ChatMessageType, timestamp: string) =>
    dispatch(
      updateQueryChatData({ account, toAddr }, () => {
        const currentChatData =
          getLocalDmDataForAccountToAddr(account, toAddr) || []

        const newChatData = currentChatData.map((chat: ChatMessageType) => {
          if (chat.timestamp === timestamp) {
            return { ...message, message: chat.message }
          }

          return chat
        })

        updateLocalDmDataForAccountToAddr(account, toAddr, newChatData)

        const finalChatData = getLocalDmDataForAccountToAddr(account, toAddr)

        return JSON.stringify({ messages: finalChatData })
      })
    )

  const postMessageToAPI = React.useCallback(
    async (
      createMessageData: CreateChatMessageType,
      newMessage: ChatMessageType,
      timestamp: string
    ) => {
      const isNextMsg =
        !pendingMsgs.current[0] ||
        pendingMsgs.current[0].timestamp === timestamp

      const index = pendingMsgs.current.findIndex(
        (obj) => obj.timestamp === timestamp
      )

      if (!pendingMsgs.current || index === -1) {
        pendingMsgs.current = [
          ...(pendingMsgs.current || []),
          { createMessageData, newMessage, timestamp },
        ]
      }

      if (isNextMsg) {
        //Currently only LIT works for EVM addresses (both to and from have to be EVM addrs)
        // if ((createMessageData.fromaddr.includes(".eth") || createMessageData.fromaddr.startsWith("0x")) &&
        //     (createMessageData.toaddr.includes(".eth") || createMessageData.toaddr.startsWith("0x"))) {  //only encrypt ethereum for now
        //   const accessControlConditions = getAccessControlConditions(
        //     createMessageData.fromaddr,
        //     (createMessageData.toaddr.includes('.eth') &&
        //       (await provider.resolveName(toAddr))) ||
        //       createMessageData.toaddr
        //   )

        //   log(
        //     'ℹ️[POST][Encrypting Message]',
        //     createMessageData.message,
        //     accessControlConditions
        //   )

        //   const encrypted = await lit.encryptString(
        //     account,
        //     createMessageData.message,
        //     accessControlConditions
        //   )
        //   createMessageData.message = await lit.blobToB64(encrypted.encryptedFile)
        //   newMessage.encryptedMessage = createMessageData.message
        //   updateSentMessage(newMessage, timestamp)
        //   createMessageData.encrypted_sym_lit_key =
        //     encrypted.encryptedSymmetricKey
        //   createMessageData.lit_access_conditions = JSON.stringify(
        //     accessControlConditions
        //   )
        //   log('✅[POST][Encrypted Message]:', newMessage)
        // }

        fetch(
          ` ${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/create_chatitem`,
          postFetchOptions(createMessageData, account)
        )
          .then((response) => response.json())
          .then((responseData) => {
            log('✅[POST][Send Message]:', responseData)
            updateSentMessage(responseData, timestamp)

            if (pendingMsgs.current[0]?.timestamp === timestamp) {
              pendingMsgs.current.shift()

              if (pendingMsgs.current[0]) {
                log('✅[POST][************Retry Message - TODO debug]:')
                postMessageToAPI(
                  pendingMsgs.current[0].createMessageData,
                  pendingMsgs.current[0].newMessage,
                  pendingMsgs.current[0].timestamp
                )
              }
            }
          })
          .catch((error) => {
            console.error('🚨[POST][Send message]:', error, createMessageData)
            newMessage.failed = true
            updateSentMessage(newMessage, timestamp)
          })
      }
    },
    [account]
  )

  const sendMessage = async () => {
    const value = msgInput

    if (value.length <= 0) return

    analytics.track('SendMessage', {
      site: document.referrer,
      account,
    })
    // ReactGA.event({
    //   category: "SendMessageCategory",
    //   action: "SendMessage",
    //   label: "SendMessageLabel", // optional
    // });
    analyticsGA4.track('SendMessage', {
      site: document.referrer,
      account,
    })
    

    // clear input field
    setMsgInput("");

    const createMessageData: CreateChatMessageType = {
      message: value,
      fromaddr: account.toLocaleLowerCase(),
      toaddr: toAddr.toLocaleLowerCase(),
      nftid: '0',
      lit_access_conditions: '',
      encrypted_sym_lit_key: '',
    }

    const now = new Date()

    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0') // January is 0
    const day = String(now.getDate()).padStart(2, '0')

    const hours = String(now.getUTCHours()).padStart(2, '0')
    const minutes = String(now.getUTCMinutes()).padStart(2, '0')
    const seconds = String(now.getUTCSeconds()).padStart(2, '0')
    const milliseconds = String(now.getUTCMilliseconds()).padStart(3, '0')

    const timestamp = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`

    const newMessage: ChatMessageType = {
      ...createMessageData,
      Id: -1,
      timestamp,
      timestamp_dtm: timestamp,
      sender_name: name,
      read: false,
      nftaddr: '',
    }

    //TODO: during cleartext testing, the spinner is gone for now, makes UI look slow
    // Already show message on the UI with the spinner as Loading
    // because it will begin to encrypt the message and only confirm
    // it was sent after a successful response
    addPendingMessageToUI(newMessage)

    postMessageToAPI(createMessageData, newMessage, timestamp)
  }

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      sendMessage()
    }
  }

  const addEmoji = (e: any) => {
    const sym = e.unified.split("_");
    const codeArray: any[] = [];
    sym.forEach((el: string) => codeArray.push("0x" + el));
    let emoji = String.fromCodePoint(...codeArray)
    setMsgInput(msgInput + emoji);
  }

  return (
    <Flex p='4' alignItems='center' justifyContent='center' gap='4'>
      <Popover placement='top-start' isLazy>
        <PopoverTrigger>
          <Container 
            w={0}
            children={<Icon as={BsEmojiSmile} color="black.500" h={5} w={5} />}
          />
        </PopoverTrigger>
        <PopoverContent w="283px">  
          <Picker 
            data={data}
            emojiSize={20}
            emojiButtonSize={28}
            onEmojiSelect={addEmoji}
            maxFrequentRows={4}
          />
        </PopoverContent>
      </Popover>

      <Textarea 
        placeholder='Write a message...'
        ref={textAreaRef}
        onChange={(e) => setMsgInput(e.target.value)}
        value={msgInput}
        onKeyPress={handleKeyPress}
        backgroundColor='lightgray.400'
        minH='full'
        pt={3.5}
        resize='none'
      />

      <Flex alignItems='flex-end'>
        <Button
          variant='black'
          onClick={sendMessage}
          borderRadius='full'
          minH='full'
          px='0'
          py='0'
          w='12'
          h='12'
        >
          <IconSend size='22' />
        </Button>
      </Flex>
    </Flex>
  )
}

export default Submit
