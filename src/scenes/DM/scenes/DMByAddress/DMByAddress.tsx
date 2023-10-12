import { Box, Flex, Spinner, useColorMode } from '@chakra-ui/react'
import React from 'react'
import { useParams } from 'react-router-dom'
import { createSelector } from '@reduxjs/toolkit'
import { useAppDispatch } from '@/hooks/useDispatch'
import { POLLING_QUERY_OPTS } from '@/constants'
import { ChatMessageType } from '@/types/Message'
import { DottedBackground } from '../../../../styled/DottedBackground'
import ChatMessage from '../../../../components/Chat/ChatMessage'
import DMHeader from './DMHeader'
import {
  useGetChatDataQuery,
  getLocalDmDataForAccountToAddr,
  useGetReadChatItemsQuery,
  decryptDMMessages,
  getPendingDmDataForAccountToAddr,
  getMessageToAddr,
} from '@/redux/reducers/dm'
import Submit from './Submit'
import { getSupportWallet } from '@/helpers/widget'
import * as ENV from '@/constants/env'
import { useAppSelector } from '@/hooks/useSelector'
import { selectAccount } from '@/redux/reducers/account'
import { useWallet } from '@/context/WalletProvider'

export const PAGE_SIZE = 25

const AlertBubble = ({
  children,
  color,
}: {
  children: string
  color: 'green' | 'red'
}) => (
  <Flex
    justifyContent='center'
    alignItems='center'
    borderRadius='lg'
    background={color === 'green' ? 'green.200' : 'red.200'}
    p={4}
    position='sticky'
    top={0}
    right={0}
    zIndex={1}
  >
    <Box fontSize='md'>{children}</Box>
  </Flex>
)

const DMByAddress = () => {
  const { provider } = useWallet()
  const { colorMode } = useColorMode();
  const account = useAppSelector((state) => selectAccount(state))

  const maxPages = React.useRef(1)

  const selectorPageRef = React.useRef<number>(1)
  const [selectorPage, setSelectorPage] = React.useState<number>(
    selectorPageRef.current
  )

  const layoutPageRef = React.useRef<number>(selectorPage)
  const prevLastMsg = React.useRef<string | undefined>()
  const topMostItem = React.useRef<number>()
  const prevTopMostItem = React.useRef(topMostItem.current)
  const shouldScrollBack = React.useRef<boolean>(false)

  const dispatch = useAppDispatch()

  const { address: dmAddr = '' } = useParams()
  const [toAddr, setToAddr] = React.useState<string>(dmAddr)
  const toAddrRef = React.useRef<string>(dmAddr)

  React.useEffect(() => {
    async function setNewDmAddr() {
      const newDmAddr = dmAddr.includes('.eth')
        ? await provider.resolveName(dmAddr)
        : dmAddr

      if (newDmAddr) {
        setToAddr(newDmAddr)
        toAddrRef.current = newDmAddr
      }
    }

    setNewDmAddr()
  }, [dmAddr, provider])

  const selectChatDataForPage = React.useMemo(
    () =>
      createSelector(
        (chatData: { messages: ChatMessageType[] }) => chatData,
        (chatData) => {
          if (!chatData?.messages) return null

          let decryptedAndPendingChats =
            getPendingDmDataForAccountToAddr(account, toAddr) &&
            getLocalDmDataForAccountToAddr(account, toAddr)
              ? [
                  ...getLocalDmDataForAccountToAddr(account, toAddr),
                  ...getPendingDmDataForAccountToAddr(account, toAddr),
                ]
              : chatData.messages

          const chatDataWithoutDuplicates: ChatMessageType[] = []
          const submittingMsgs: ChatMessageType[] = []

          decryptedAndPendingChats.forEach((msg) => {
            if (msg.Id === -1) {
              submittingMsgs.push(msg)
            } else if (
              !chatDataWithoutDuplicates.some(
                (chat) => chat.Id === msg.Id && chat.message === msg.message
              )
            ) {
              chatDataWithoutDuplicates.push(msg)
            }
          })

          decryptedAndPendingChats = [
            ...chatDataWithoutDuplicates.sort((a, b) => a.Id - b.Id),
            ...submittingMsgs,
          ]

          if (decryptedAndPendingChats.length <= PAGE_SIZE) {
            return JSON.stringify(decryptedAndPendingChats)
          }

          const newChatData = [...decryptedAndPendingChats]
          maxPages.current = Math.ceil(newChatData.length / PAGE_SIZE)

          if (newChatData.length <= PAGE_SIZE) {
            return JSON.stringify(newChatData)
          }

          const currentDataForPage = newChatData.slice(
            -PAGE_SIZE * selectorPage
          )

          if (layoutPageRef.current !== selectorPage) {
            prevTopMostItem.current = topMostItem.current
          }
          layoutPageRef.current = selectorPage

          return JSON.stringify(currentDataForPage)
        }
      ),
    [account, toAddr, selectorPage]
  )

  const { currentData: fetchedData } = useGetChatDataQuery(
    {
      account: account?.toLocaleLowerCase(),
      toAddr: toAddr.toLocaleLowerCase(),
    },
    {
      ...POLLING_QUERY_OPTS,
      selectFromResult: (options) => {
        const cachedData = getLocalDmDataForAccountToAddr(account, toAddr)
        const currentData =
          options.currentData && JSON.parse(options.currentData)

        return {
          ...options,
          currentData: selectChatDataForPage(
            currentData || { messages: cachedData }
          ),
        }
      },
    }
  )

  const chatData = fetchedData && JSON.parse(fetchedData)

  const scrollToBottomCb = React.useCallback(
    (msg: ChatMessageType) => (node: HTMLElement) => {
      const previousScrolledMsg = prevLastMsg.current
      const previousAddr = previousScrolledMsg?.split(':')[0]
      const previousMsgId = previousScrolledMsg?.split(':')[1]

      if (node && previousMsgId !== String(msg.Id)) {
        const isNewPage = previousAddr !== getMessageToAddr(account, msg)
        const lastMsgMine = previousAddr === account

        if (isNewPage || lastMsgMine) {
          node.scrollIntoView({ behavior: !isNewPage ? 'smooth' : 'auto' })
        }

        prevLastMsg.current = `${getMessageToAddr(account, msg)}:${String(
          msg.Id
        )}`
        selectorPageRef.current = 1
        setSelectorPage(selectorPageRef.current)
      }
    },
    [account]
  )

  const infiniteScrollRef = React.useCallback(
    (node) => {
      if (node) {
        const autoScrollPagination = () => {
          const scrollThreshold = 200
          const scrollTop = node.scrollTop || 0

          if (scrollTop <= scrollThreshold) {
            if (
              layoutPageRef.current < maxPages.current &&
              layoutPageRef.current === selectorPageRef.current
            ) {
              shouldScrollBack.current = true
              selectorPageRef.current += 1
              setSelectorPage(selectorPageRef.current)

              const pendingMessages =
                getPendingDmDataForAccountToAddr(account, toAddrRef.current) ||
                []

              if (pendingMessages.length > 0) {
                decryptDMMessages(pendingMessages, account, dispatch)
              }
            }
          } else {
            // On any other scroll movement that is not in the direction of
            // pagination, we should reset behavior to scroll back to the last message
            // to avoid overtaking the user's scroll position
            shouldScrollBack.current = false
          }
        }

        node.addEventListener('scroll', autoScrollPagination)

        return () => node.removeEventListener('scroll', autoScrollPagination)
      }
    },
    [account, dispatch, selectorPageRef]
  )

  React.useEffect(() => {
    if (account && toAddr) {
      const pendingMessages = getPendingDmDataForAccountToAddr(account, toAddr)

      if (pendingMessages?.length > 0)
        decryptDMMessages(pendingMessages, account, dispatch)
    }
  }, [account, toAddr, dispatch])

  React.useEffect(() => {
    selectorPageRef.current = 1

    return () => {
      selectorPageRef.current = 1
    }
  }, [account, toAddr])

  useGetReadChatItemsQuery({ account, toAddr }, POLLING_QUERY_OPTS)

  const scrollIntoViewCb = React.useCallback(
    (node) => shouldScrollBack.current && node?.scrollIntoView(),
    []
  )

  // TODO: 'back to bottom' button
  if (!chatData) {
    return (
      <Flex background='white' flexDirection='column' flex='1'>
        <DMHeader />

        <DottedBackground className='custom-scrollbar' overflow='hidden'>
          <AlertBubble color='green'>
            Decrypting Your Messages, Please Wait and Do Not Refresh 😊
          </AlertBubble>

          <Flex justifyContent='center' alignItems='center' height='100%'>
            <Spinner />
          </Flex>
        </DottedBackground>
      </Flex>
    )
  }

  return (
    <Flex background={colorMode} flexDirection='column' flex='1'>
      <DMHeader />

      <DottedBackground ref={infiniteScrollRef} className='custom-scrollbar'>
        {toAddr.toLocaleLowerCase() === getSupportWallet() && (
          <AlertBubble color='green'>{"Customer Support Chat"}</AlertBubble>
        )}

        {chatData.map((msg: ChatMessageType, i: number) => {
          const isLast = i === chatData.length - 1
          const isFirst = i === 0
          const msgId = msg.Id
          const key = `${String(i)}_${msg.Id}`
          const pendingMsgs = getPendingDmDataForAccountToAddr(account, toAddr)
          const decryptionPending = pendingMsgs?.some(
            (pendingMsg: any) => pendingMsg.Id === msgId
          )

          let ref
          if (isLast) {
            ref = scrollToBottomCb(msg) as any
          } else if (isFirst) {
            topMostItem.current = msgId
          } else if (msgId === prevTopMostItem.current) {
            ref = scrollIntoViewCb
          }

          return (
            <Box key={key} ref={ref}>
              <ChatMessage
                pending={decryptionPending}
                hasPendingMsgs={pendingMsgs?.length > 1}
                context='dm'
                account={account}
                msg={msg}
              />
            </Box>
          )
        })}
      </DottedBackground>

      <Submit toAddr={toAddr} account={account} />
    </Flex>
  )
}

export default DMByAddress
