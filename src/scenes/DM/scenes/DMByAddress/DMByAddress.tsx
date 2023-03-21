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
  decryptMessage,
  addEncryptedDmIds,
  updateLocalDmDataForAccountToAddr,
  updateQueryData,
  selectEncryptedDmIds,
} from '@/redux/reducers/dm'
import Submit from './Submit'
import { walletChatEth } from '@/constants/wallets'

const PAGE_SIZE = 25

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
  const bodyRef = React.useRef<any>(null)
  const maxPages = React.useRef(1)
  const pageRef = React.useRef<number>(1)
  const fullChatData = React.useRef<undefined | ChatMessageType[]>()
  const prevLastMsg = React.useRef<string | undefined>()

  const dispatch = useAppDispatch()

  const { address: toAddr = '' } = useParams()

  const encryptedDms = useAppSelector((state) =>
    selectEncryptedDmIds(state, account, toAddr)
  )
  const [page, setPage] = React.useState<number>(pageRef.current)

  const selectChatDataForPage = React.useMemo(
    () =>
      createSelector(
        (chatData: ChatMessageType[]) => chatData,
        (chatData) => {
          if (!chatData) return chatData

          if (chatData.length <= PAGE_SIZE) {
            return JSON.stringify(chatData)
          }

          const newChatData = [...chatData]
          maxPages.current = Math.ceil(newChatData.length / PAGE_SIZE)

          if (newChatData.length <= PAGE_SIZE) {
            return JSON.stringify(newChatData)
          }

          const currentDataForPage = newChatData.slice(
            -PAGE_SIZE * pageRef.current
          )

          return JSON.stringify(currentDataForPage)
        }
      ),
    []
  )

  // for effect deps, makes sure it won't re-calculate many times even with the same value
  // so it will only retry when the array changes like removing some
  const encryptedDmsStr = encryptedDms && JSON.stringify(encryptedDms)

  const { currentData: fetchedData, isFetching } = useGetChatDataQuery(
    { account, toAddr },
    {
      ...POLLING_QUERY_OPTS,
      selectFromResult: (options) => {
        const cachedData = getLocalDmDataForAccountToAddr(account, toAddr)
        fullChatData.current =
          options.currentData && JSON.parse(options.currentData)

        return {
          ...options,
          currentData: selectChatDataForPage(
            options.currentData ? JSON.parse(options.currentData) : cachedData
          ),
        }
      },
    }
  )

  const chatData = fetchedData ? JSON.parse(fetchedData) : []

  const scrollToBottomCb = React.useCallback(
    (msg: ChatMessageType, useSmooth?: boolean) => (node: HTMLElement) => {
      const previousScrolledMsg = prevLastMsg.current
      const previousAddr = previousScrolledMsg?.split(':')[0]
      const previousMsgId = previousScrolledMsg?.split(':')[1]

      if (node && previousMsgId !== String(msg.Id)) {
        const isNewPage = previousAddr !== toAddr
        const lastMsgMine = previousAddr === account

        if (isNewPage || lastMsgMine) {
          node.scrollIntoView({ behavior: !isNewPage ? 'smooth' : 'auto' })
        }

        prevLastMsg.current = `${toAddr}:${String(msg.Id)}`
        setPage(1)
        pageRef.current = 1
      }
    },
    [account, toAddr]
  )

  React.useEffect(() => {
    const bodyElem = bodyRef.current

    if (bodyElem) {
      const autoScrollPagination = () => {
        if (page < maxPages.current) {
          const scrollThreshold = 200
          const scrollTop = bodyElem.scrollTop || 0

          if (scrollTop <= scrollThreshold) {
            pageRef.current += 1
            setPage((prev) => prev + 1)
          }
        }
      }

      bodyElem.addEventListener('scroll', autoScrollPagination)

      return () => bodyElem.removeEventListener('scroll', autoScrollPagination)
    }
  }, [page])

  useGetReadChatItemsQuery({ account, toAddr }, POLLING_QUERY_OPTS)

  React.useEffect(() => {
    const newEncryptedDms = encryptedDmsStr && JSON.parse(encryptedDmsStr)
    const allDms = fullChatData.current

    if (allDms && newEncryptedDms && newEncryptedDms.length > 0) {
      const retryFailed = async () => {
        const newChatData = allDms || []
        const failedDms = newChatData.filter((msg: ChatMessageType) =>
          newEncryptedDms.includes(msg.Id)
        )

        const { fetchedMessages, failedDecryptMsgs } = await decryptMessage(
          failedDms,
          account
        )

        fetchedMessages.forEach((msg: ChatMessageType) => {
          newChatData[
            newChatData.findIndex((dm: ChatMessageType) => dm.Id === msg.Id)
          ] = msg
        })

        updateLocalDmDataForAccountToAddr(account, toAddr, newChatData)

        dispatch(
          updateQueryData('getChatData', { account, toAddr }, () =>
            JSON.stringify(newChatData)
          )
        )
        dispatch(
          addEncryptedDmIds({ account, toAddr, data: failedDecryptMsgs })
        )
      }

      retryFailed()
    }
  }, [dispatch, encryptedDmsStr, account, toAddr])

  // TODO: 'back to bottom' button
  if (isFetching && !encryptedDmsStr && chatData.length === 0) {
    return (
      <Flex background='white' height='100vh' flexDirection='column' flex='1'>
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

  // TODO: when some DMs are still encrypted due to fail or pending, show skeleton
  // instead of error message
  if (encryptedDms && encryptedDms.length > 0) {
    return (
      <Flex background='white' height='100vh' flexDirection='column' flex='1'>
        <DMHeader />

        <DottedBackground className='custom-scrollbar' overflow='hidden'>
          <AlertBubble color='red'>
            Failed to decrypt messages, retrying...
          </AlertBubble>

          <Flex justifyContent='center' alignItems='center' height='100%'>
            <Spinner />
          </Flex>
        </DottedBackground>
      </Flex>
    )
  }

  return (
    <Flex background='white' height='100vh' flexDirection='column' flex='1'>
      <DMHeader />

      <DottedBackground ref={bodyRef} className='custom-scrollbar'>
        {toAddr.toLocaleLowerCase() === walletChatEth && (
          <AlertBubble color='green'>
            We welcome all feedback and bug reports. Thank you! 😊
          </AlertBubble>
        )}

        {chatData.map((msg: ChatMessageType, i: number) => {
          const isLast = i === chatData.length - 1

          return (
            <Box
              key={`${String(i)}_${msg.Id}`}
              ref={isLast ? (scrollToBottomCb(msg) as any) : undefined}
            >
              <ChatMessage context='dm' account={account} msg={msg} />
            </Box>
          )
        })}
      </DottedBackground>

      <Submit toAddr={toAddr} account={account} />
    </Flex>
  )
}

export default DMByAddress
