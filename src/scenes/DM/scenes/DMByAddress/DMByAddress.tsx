import { Box, Flex, Spinner } from '@chakra-ui/react'
import React from 'react'
import { useParams } from 'react-router-dom'
import { MessageUIType } from '../../../../types/Message'
import { DottedBackground } from '../../../../styled/DottedBackground'
import ChatMessage from '../../../../components/Chat/ChatMessage'
import DMHeader from './DMHeader'
import {
  useGetChatDataQuery,
  getLocalDmDataForAccountToAddr,
  useGetReadChatItemsQuery,
} from '@/redux/reducers/dm'
import Submit from './Submit'

const QUERY_OPTS = {
  pollingInterval: 5000, // 5 sec
  refetchOnMountOrArgChange: true,
}

const DMByAddress = ({
  account,
  delegate,
}: {
  account: string
  delegate: string
}) => {
  const didInitialScroll = React.useRef()

  const { address: toAddr = '' } = useParams()

  const { currentData: fetchedData, isFetching } = useGetChatDataQuery(
    { account, toAddr },
    QUERY_OPTS
  )

  const cachedChatData = getLocalDmDataForAccountToAddr(account, toAddr)
  const localChatData =
    fetchedData || (cachedChatData && JSON.stringify(cachedChatData)) || ''
  const chatData = localChatData ? JSON.parse(localChatData) : []

  const scrollToBottomCb = React.useCallback(
    (msg: MessageUIType) => (node: any) => {
      if (node) {
        const sentByMe = msg.fromaddr === account

        if (!didInitialScroll.current || sentByMe) {
          node.scrollIntoView({ smooth: true })
        }
      }
    },
    [toAddr]
  )

  useGetReadChatItemsQuery({ account, toAddr }, QUERY_OPTS)

  // TODO: if already has encrypted chats, show skeletons
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

        <Submit
          delegate={delegate}
          loadedMsgs={chatData}
          toAddr={toAddr}
          account={account}
        />
      </Flex>
    )
  }

  return (
    <Flex background='white' height='100vh' flexDirection='column' flex='1'>
      <DMHeader />

      <DottedBackground className='custom-scrollbar'>
        {toAddr ===
          '0x17FA0A61bf1719D12C08c61F211A063a58267A19'.toLocaleLowerCase() && (
            <Flex
              justifyContent='center'
              alignItems='center'
              borderRadius='lg'
              background='green.200'
              p={4}
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
