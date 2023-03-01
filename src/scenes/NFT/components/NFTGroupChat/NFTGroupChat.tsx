import { Box, Divider, Flex, Tag } from '@chakra-ui/react'
import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import equal from 'fast-deep-equal/es6'
import { useNavigate } from 'react-router-dom'
import * as ENV from '@/constants/env'

import { getFormattedDate } from '../../../../helpers/date'
import {
  GroupMessageType,
  MessageUIType,
  PfpType,
} from '../../../../types/Message'
import generateItems from '../../helpers/generateGroupedByDays'
import { DottedBackground } from '../../../../styled/DottedBackground'
import ChatMessage from '../../../../components/Chat/ChatMessage'
import ChatTextAreaInput from '../../../../components/Chat/ChatTextAreaInput'

const NFTGroupChat = ({
  account,
  nftContractAddr,
}: {
  account: string | undefined
  nftContractAddr: string
}) => {
  const [firstLoad, setFirstLoad] = useState(true)
  // const [isFetchingMessages, setIsFetchingMessages] = useState<boolean>(false)
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [chatData, setChatData] = useState<GroupMessageType[]>([])
  const [loadedMsgs, setLoadedMsgs] = useState<MessageUIType[]>([])
  const [userPfpImage, setUserPfpImage] = useState<PfpType[]>([])
  let navigate = useNavigate()
  const scrollToBottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getChatData()
  }, [account, nftContractAddr])

  useEffect(() => {
    // Interval needs to reset else getChatData will use old state
    const interval = setInterval(() => {
      getChatData()
    }, 5000) // every 5s

    return () => {
      clearInterval(interval)
    }
  }, [chatData, account, nftContractAddr])

  const getChatData = async () => {
    if (!account) {
      console.log('No account connected')
      return
    }

    // setIsFetchingMessages(true)

    fetch(
      ` ${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/get_groupchatitems/${nftContractAddr}/${account}`,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('jwt')}`,
        },
      }
    )
      .then((response) => response.json())
      .then((data: GroupMessageType[]) => {
        if (equal(data, chatData) === false) {
          console.log('✅[GET][NFT][Group Chat Messages By Addr]:', data)
          setChatData(data)
        }
      })
      .catch((error) => {
        console.error('🚨[GET][NFT][Group Chat Messages By Addr]:', error)
        navigate(`/nft_error`)
      })
    // .finally(() => setIsFetchingMessages(false))
  }

  const sendMessage = async (msgInput: string) => {
    if (msgInput.length <= 0) return
    if (!account) {
      console.log('No account connected')
      return
    }

    // Make a copy
    const msgInputCopy = (' ' + msgInput).slice(1)

    const timestamp = new Date()

    const latestLoadedMsgs = JSON.parse(JSON.stringify(loadedMsgs))

    let data = {
      message: msgInputCopy,
      fromaddr: account.toLocaleLowerCase(),
      nftaddr: nftContractAddr.toLocaleLowerCase(),
      timestamp,
    }

    addMessageToUI(
      msgInputCopy,
      account,
      timestamp.toString(),
      'right',
      false,
      nftContractAddr
    )

    data.message = msgInputCopy

    setIsSendingMessage(true)
    fetch(
      ` ${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/create_groupchatitem`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('jwt')}`,
        },
        body: JSON.stringify(data),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        console.log('✅[POST][Message]:', data, latestLoadedMsgs)
        getChatData()
      })
      .catch((error) => {
        console.error('🚨[POST][Message]:', error, JSON.stringify(data))
      })
      .finally(() => {
        setIsSendingMessage(false)
      })
  }

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
          message: chatData[i].message,
          fromAddr: chatData[i].fromaddr,
          timestamp: chatData[i].timestamp,
          position: 'right',
          isFetching: false,
          nftAddr: chatData[i].nftaddr,
        })
      } else {
        toAddToUI.push({
          sender_name: chatData[i].sender_name,
          message: chatData[i].message,
          fromAddr: chatData[i].fromaddr,
          timestamp: chatData[i].timestamp,
          position: 'left',
          isFetching: false,
          nftAddr: chatData[i].nftaddr,
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

  const addMessageToUI = useCallback(
    (
      message: string,
      fromaddr: string,
      timestamp: string,
      position: string,
      isFetching: boolean,
      nftaddr: string | null
    ) => {
      console.log(`Add message to UI: ${message}`)

      const newMsg: MessageUIType = {
        message,
        fromAddr: fromaddr,
        timestamp,
        position,
        isFetching,
        nftAddr: nftaddr,
      }
      let newLoadedMsgs: MessageUIType[] = [...loadedMsgs] // copy the old array
      newLoadedMsgs.push(newMsg)
      setLoadedMsgs(newLoadedMsgs)
    },
    [loadedMsgs]
  )

  const renderedMessages = useMemo(() => {
    return loadedMsgs.map((msg, i) => {
      if (msg.type && msg.type === 'day') {
        return (
          <Box position='relative' my={6} key={i}>
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
      } else if (msg.message) {
        return <ChatMessage key={i} account={account} context='nft' msg={msg} />
      }
      return null
    })
  }, [loadedMsgs, account])

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
            <Box fontSize='md'>Be the first to post something here 😉</Box>
          </Flex>
        )}
        {renderedMessages}
        <Box
          float='left'
          style={{ clear: 'both' }}
          ref={scrollToBottomRef}
        ></Box>
      </DottedBackground>

      <ChatTextAreaInput
        isSendingMessage={isSendingMessage}
        sendMessage={sendMessage}
      />
    </Flex>
  )
}

export default NFTGroupChat
