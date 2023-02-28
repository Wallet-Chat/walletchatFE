import { Box, Flex, Spinner } from '@chakra-ui/react'
import React from 'react'
import { useParams } from 'react-router-dom'
import { createSelector } from '@reduxjs/toolkit'
import { useAppSelector } from '@/hooks/useSelector'
import { useAppDispatch } from '@/hooks/useDispatch'
import { MessageUIType } from '../../../../types/Message'
import { DottedBackground } from '../../../../styled/DottedBackground'
import ChatMessage from '../../../../components/Chat/ChatMessage'
import DMHeader from './DMHeader'
import {
  useGetChatDataQuery,
  getLocalDmDataForAccountToAddr,
  useGetReadChatItemsQuery,
  decryptMessage,
  addDmDataEnc,
  updateLocalDmDataForAccountToAddr,
  updateQueryData,
} from '@/redux/reducers/dm'
import Submit from './Submit'

const PAGE_SIZE = 25

const QUERY_OPTS = {
  pollingInterval: 5000, // 5 sec
}

const DMByAddress = ({
  account,
  delegate,
}: {
  account: string
  delegate: string
}) => {
  const bodyRef = React.useRef()
  const maxPages = React.useRef(1)

  const dispatch = useAppDispatch()
  const prevToAddr = React.useRef('')

  const { address: toAddr = '' } = useParams()

  const dmDataEncByAccountByAddr = useAppSelector(
    (state) => state.dm.dmDataEncByAccountByAddr
  )
  const encryptedDms =
    dmDataEncByAccountByAddr &&
    dmDataEncByAccountByAddr[account] &&
    dmDataEncByAccountByAddr[account][toAddr]

  const [page, setPage] = React.useState(1)

  const selectPostsForUser = React.useMemo(
    () =>
      createSelector(
        (options: any) => options.currentData,
        (options: any, pg: number) => pg,
        (currentData, pg) => {
          if (!currentData) return currentData

          const currentDataValue = [...JSON.parse(currentData)]
          maxPages.current = Math.ceil(currentDataValue.length / PAGE_SIZE)

          if (currentDataValue.length <= PAGE_SIZE) {
            return JSON.stringify(currentDataValue)
          }

          const currentDataForPage = currentDataValue.slice(-PAGE_SIZE * page)

          return JSON.stringify(currentDataForPage)
        }
      ),
    [page]
  )

  // for effect deps, makes sure it won't re-calculate many times even with the same value
  // so it will only retry when the array changes like removing some
  const encryptedDmsStr = encryptedDms && JSON.stringify(encryptedDms)

  const { currentData: fetchedData, isFetching } = useGetChatDataQuery(
    { account, toAddr },
    {
      ...QUERY_OPTS,
      selectFromResult: (options) => ({
        ...options,
        currentData: selectPostsForUser(options, page),
      }),
    }
  )

  const cachedChatData = getLocalDmDataForAccountToAddr(account, toAddr)
  const localChatData =
    fetchedData || (cachedChatData && JSON.stringify(cachedChatData)) || ''
  const chatData = localChatData ? JSON.parse(localChatData) : []

  const scrollToBottomCb = React.useCallback(
    (msg: MessageUIType) => (node: any) => {
      if (node) {
        const sentByMe = msg.fromaddr === account

        if (prevToAddr.current !== toAddr || sentByMe) {
          node.scrollIntoView({ smooth: true })
          prevToAddr.current = toAddr
          setPage(1)
        }
      }
    },
    [toAddr]
  )

  React.useEffect(() => {
    if (bodyRef.current) {
      const bodyElem = bodyRef.current

      const autoScrollPagination = () => {
        if (page < maxPages.current) {
          const scrollThreshold = 200
          const scrollTop = bodyElem.scrollTop || 0

          if (scrollTop <= scrollThreshold) {
            // Fetch more items here
            setPage((prev) => prev + 1)
          }
        }
      }

      bodyElem.addEventListener('scroll', autoScrollPagination)

      return () => bodyElem.removeEventListener('scroll', autoScrollPagination)
    }
  }, [page])

  useGetReadChatItemsQuery({ account, toAddr }, QUERY_OPTS)

  React.useEffect(() => {
    const newEncryptedDms = encryptedDmsStr && JSON.parse(encryptedDmsStr)

    if (localChatData && newEncryptedDms && newEncryptedDms.length > 0) {
      const retryFailed = async () => {
        const newChatData = localChatData ? JSON.parse(localChatData) : []
        const failedDms = newChatData.filter((msg: MessageUIType) =>
          newEncryptedDms.includes(msg.Id)
        )

        const { fetchedMessages, failedDecryptMsgs } = await decryptMessage(
          failedDms
        )

        fetchedMessages.forEach((msg: MessageUIType) => {
          newChatData[
            newChatData.findIndex((dm: MessageUIType) => dm.Id === msg.Id)
          ] = msg
        })

        updateLocalDmDataForAccountToAddr(account, toAddr, newChatData)

        dispatch(
          updateQueryData('getChatData', { account, toAddr }, () =>
            JSON.stringify(newChatData)
          )
        )
        dispatch(addDmDataEnc({ account, toAddr, data: failedDecryptMsgs }))
      }

      retryFailed()
    }
  }, [localChatData, encryptedDmsStr])

  // TODO: when some DMs are still encrypted due to fail or pending, show skeleton
  // instead of error message
  if (encryptedDms && encryptedDms.length > 0) {
    return (
      <Flex background='white' height='100vh' flexDirection='column' flex='1'>
        <DMHeader />

        <DottedBackground className='custom-scrollbar'>
          <Flex
            justifyContent='center'
            alignItems='center'
            borderRadius='lg'
            background='red.200'
            p={4}
          >
            <Box fontSize='md'>Failed to decrypt messages, retrying...</Box>
          </Flex>
          <Flex justifyContent='center' alignItems='center' height='100%'>
            <Spinner />
          </Flex>
        </DottedBackground>
      </Flex>
    )
  }

  if (isFetching && chatData.length === 0) {
    return (
      <Flex background='white' height='100vh' flexDirection='column' flex='1'>
        <DMHeader />

        <DottedBackground className='custom-scrollbar'>
          <Flex
            justifyContent='center'
            alignItems='center'
            borderRadius='lg'
            background='green.200'
            p={4}
          >
            <Box fontSize='md'>
              Decrypting Your Messages, Please Wait and Do Not Refresh 😊
            </Box>
          </Flex>
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
        {toAddr ===
          '0x17FA0A61bf1719D12C08c61F211A063a58267A19'.toLocaleLowerCase() && (
          <Flex
            justifyContent='center'
            alignItems='center'
            borderRadius='lg'
            background='green.200'
            p={4}
            position='sticky'
            top={0}
            right={0}
            zIndex={1}
          >
            <Box fontSize='md'>
              We welcome all feedback and bug reports. Thank you! 😊
            </Box>
          </Flex>
        )}

        {chatData.map((msg: MessageUIType, i: number) => {
          const isLast = i === chatData.length - 1

          return (
            <Box key={msg.Id} ref={isLast ? scrollToBottomCb(msg) : undefined}>
              <ChatMessage context='dms' account={account} msg={msg} />
            </Box>
          )
        })}
      </DottedBackground>

      <Submit
        delegate={delegate}
        loadedMsgs={chatData}
        toAddr={toAddr}
        account={account}
      />
    </Flex>
  )
}

export default DMByAddress
