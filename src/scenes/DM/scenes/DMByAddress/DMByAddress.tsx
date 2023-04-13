import { Box, Flex, Spinner } from '@chakra-ui/react'
import React from 'react'
import { useParams } from 'react-router-dom'
import { createSelector } from '@reduxjs/toolkit'
import { useAppSelector } from '@/hooks/useSelector'
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
  selectEncryptedDmIds,
} from '@/redux/reducers/dm'
import Submit from './Submit'
import { getSupportWallet } from '@/helpers/widget'
import * as ENV from '@/constants/env'

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

const DMByAddress = ({ account }: { account: string }) => {
  const supportHeader =
    ENV.REACT_APP_SUPPORT_HEADER ||
    'We welcome all feedback and bug reports. Thank you! 😊'

  const bodyRef = React.useRef<any>(null)
  const maxPages = React.useRef(1)

  const selectorPageRef = React.useRef<number>(1)
  const [selectorPage, setSelectorPage] = React.useState<number>(
    selectorPageRef.current
  )

  const layoutPageRef = React.useRef<number>(selectorPage)
  const fullChatData = React.useRef<undefined | ChatMessageType[]>()
  const prevLastMsg = React.useRef<string | undefined>()
  const topMostItem = React.useRef<number>()
  const prevTopMostItem = React.useRef(topMostItem.current)
  const shouldScrollBack = React.useRef<boolean>(false)

  const dispatch = useAppDispatch()

  const { address: toAddr = '' } = useParams()

  const encryptedDms = useAppSelector((state) =>
    selectEncryptedDmIds(state, account, toAddr)
  )

  const selectChatDataForPage = React.useMemo(
    () =>
      createSelector(
        (chatData: {
          messages: ChatMessageType[]
          pendingMsgs: ChatMessageType[]
        }) => chatData,
        (chatData) => {
          if (!chatData?.messages) return chatData?.messages

          const decryptedAndPendingChats = chatData.pendingMsgs
            ? [...chatData.messages, ...chatData.pendingMsgs].sort(
                (a, b) =>
                  new Date(a.timestamp).getTime() -
                  new Date(b.timestamp).getTime()
              )
            : chatData.messages

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
    [selectorPage]
  )

  // for effect deps, makes sure it won't re-calculate many times even with the same value
  // so it will only retry when the array changes like removing some
  const encryptedDmsStr = encryptedDms && JSON.stringify(encryptedDms)

  const { currentData: fetchedData, pendingMsgs } = useGetChatDataQuery(
    { account, toAddr },
    {
      ...POLLING_QUERY_OPTS,
      selectFromResult: (options) => {
        const cachedData = getLocalDmDataForAccountToAddr(account, toAddr)
        const currentData =
          options.currentData && JSON.parse(options.currentData)
        fullChatData.current = currentData

        return {
          ...options,
          currentData: selectChatDataForPage(
            currentData || { messages: cachedData }
          ),
          pendingMsgs: currentData?.pendingMsgs || [],
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
        const isNewPage = previousAddr !== msg.fromaddr
        const lastMsgMine = previousAddr === account

        if (isNewPage || lastMsgMine) {
          node.scrollIntoView({ behavior: !isNewPage ? 'smooth' : 'auto' })
        }

        prevLastMsg.current = `${msg.fromaddr}:${String(msg.Id)}`
        selectorPageRef.current = 1
        setSelectorPage(selectorPageRef.current)
      }
    },
    [account]
  )

  React.useEffect(() => {
    const bodyElem = bodyRef.current

    if (bodyElem) {
      const autoScrollPagination = () => {
        const scrollThreshold = 200
        const scrollTop = bodyElem.scrollTop || 0

        if (scrollTop <= scrollThreshold) {
          if (
            layoutPageRef.current < maxPages.current &&
            layoutPageRef.current === selectorPageRef.current
          ) {
            shouldScrollBack.current = true
            selectorPageRef.current += 1
            setSelectorPage(selectorPageRef.current)
            decryptDMMessages(
              pendingMsgs.slice(selectorPageRef.current * PAGE_SIZE),
              account,
              dispatch
            )
          }
        } else {
          // On any other scroll movement that is not in the direction of
          // pagination, we should reset behavior to scroll back to the last message
          // to avoid overtaking the user's scroll position
          shouldScrollBack.current = false
        }
      }

      bodyElem.addEventListener('scroll', autoScrollPagination)

      return () => bodyElem.removeEventListener('scroll', autoScrollPagination)
    }
  }, [account, dispatch, pendingMsgs, selectorPageRef, toAddr])

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
    <Flex background='white' flexDirection='column' flex='1'>
      <DMHeader />

      <DottedBackground ref={bodyRef} className='custom-scrollbar'>
        {toAddr.toLocaleLowerCase() === getSupportWallet() && (
          <AlertBubble color='green'>{supportHeader}</AlertBubble>
        )}

        {chatData.map((msg: ChatMessageType, i: number) => {
          const isLast = i === chatData.length - 1
          const isFirst = i === 0
          const msgId = msg.Id
          const key = `${String(i)}_${msg.Id}`
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
