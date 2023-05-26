import React from 'react'
import { AnalyticsBrowser } from '@segment/analytics-next'
import ReactGA from "react-ga4";
import { IconSend } from '@tabler/icons'
import { Textarea, Button, Flex } from '@chakra-ui/react'
import { postFetchOptions } from '@/helpers/fetch'
import lit from '../../../../utils/lit'
import * as ENV from '@/constants/env'
import {
  updateLocalDmDataForAccountToAddr,
  addLocalDmDataForAccountToAddr,
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
  const msgInput = React.useRef<string>('')
  const analytics = AnalyticsBrowser.load({
    writeKey: ENV.REACT_APP_SEGMENT_KEY as string,
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
        updateLocalDmDataForAccountToAddr(account, toAddr, currentChatData)

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

  const postMessage = React.useCallback(
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
        if ((createMessageData.fromaddr.includes(".eth") || createMessageData.fromaddr.startsWith("0x")) &&
            (createMessageData.toaddr.includes(".eth") || createMessageData.toaddr.startsWith("0x"))) {  //only encrypt ethereum for now
          const accessControlConditions = getAccessControlConditions(
            createMessageData.fromaddr,
            (createMessageData.toaddr.includes('.eth') &&
              (await provider.resolveName(toAddr))) ||
              createMessageData.toaddr
          )

          log(
            'ℹ️[POST][Encrypting Message]',
            createMessageData.message,
            accessControlConditions
          )

          const encrypted = await lit.encryptString(
            account,
            createMessageData.message,
            accessControlConditions
          )
          createMessageData.message = await lit.blobToB64(encrypted.encryptedFile)
          newMessage.encryptedMessage = createMessageData.message
          updateSentMessage(newMessage, timestamp)
          createMessageData.encrypted_sym_lit_key =
            encrypted.encryptedSymmetricKey
          createMessageData.lit_access_conditions = JSON.stringify(
            accessControlConditions
          )
          log('✅[POST][Encrypted Message]:', newMessage)
        }

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
                log('✅[POST][Retry Message - TODO debug]:', responseData)
                postMessage(
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
    const value = msgInput.current

    if (value.length <= 0) return

    analytics.track('SendMessage', {
      site: document.referrer,
      account,
    })
    ReactGA.event({
      category: "SendMessageCategory",
      action: "SendMessage",
      label: "SendMessage", // optional
    });
    

    // clear input field
    if (textAreaRef.current) textAreaRef.current.value = ''

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

    // Already show message on the UI with the spinner as Loading
    // because it will begin to encrypt the message and only confirm
    // it was sent after a successful response
    addPendingMessageToUI(newMessage)

    postMessage(createMessageData, newMessage, timestamp)

    if (
      toAddr.toLocaleLowerCase() ===
      '0x17FA0A61bf1719D12C08c61F211A063a58267A19'.toLocaleLowerCase()
    ) {
      if (!ENV.REACT_APP_SLEEKPLAN_API_KEY) {
        log('Missing REACT_APP_SLEEKPLAN_API_KEY')
      } else {
        fetch(`https://api.sleekplan.com/v1/post`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${ENV.REACT_APP_SLEEKPLAN_API_KEY}`,
          },
          body: JSON.stringify({
            title: account,
            type: 'feedback',
            description: value,
            user: 347112,
          }),
        })
          .then((response) => response.json())
          .then((responseData) => {
            log('✅[POST][Feedback]:', responseData)
          })
          .catch((error) => {
            console.error(
              '🚨[POST][Feedback]:',
              error,
              JSON.stringify(createMessageData)
            )
          })
      }
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      sendMessage()
    }
  }

  return (
    <Flex p='4' alignItems='center' justifyContent='center' gap='4'>
      <Textarea
        placeholder='Write a message...'
        ref={textAreaRef}
        onChange={(e) => {
          msgInput.current = e.target.value
        }}
        onKeyPress={handleKeyPress}
        minH='full'
        resize='none'
        px='3'
        py='3'
        w='100%'
        fontSize='md'
        background='lightgray.400'
        borderRadius='xl'
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
