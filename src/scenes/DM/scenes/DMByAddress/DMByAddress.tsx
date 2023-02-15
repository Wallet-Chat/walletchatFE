/* eslint-disable no-console */
import { Box, Flex, Spinner } from '@chakra-ui/react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import equal from 'fast-deep-equal/es6'
import { MessageType, MessageUIType } from '../../../../types/Message'
import { DottedBackground } from '../../../../styled/DottedBackground'
import ChatMessage from '../../../../components/Chat/ChatMessage'
import lit from '../../../../utils/lit'
import Header from './Header'
import * as ENV from '@/constants/env'
import { getFetchOptions } from '@/helpers/fetch'
import { useAppSelector } from '@/hooks/useSelector'
import { fetchPfpDataForAddr } from '@/redux/reducers/dm'
import { useAppDispatch } from '@/hooks/useDispatch'
import Submit from './Submit'

const DEFAULT_LAST_MESSAGE_TIME = '2006-01-02T15:04:05.000Z'

const DMByAddress = ({
  account,
  delegate,
  isAuthenticated,
}: {
  account: string
  delegate: string
  isAuthenticated: boolean
}) => {
  const { pfpDataByAddr } = useAppSelector((state) => state.dm)
  const dispatch = useAppDispatch()

  const semaphore = React.useRef(false)
  const { address: toAddr = '' } = useParams()

  const localStorageKeyDmDataToAddr = `dmData_${account}_${toAddr.toLowerCase()}`
  const localStorageKeyDmDataEncToAddr = `dmDataEnc_${account}_${toAddr.toLowerCase()}`
  const localStorageKeyDmReadIDsToAddr = `dmReadIDs_${account}_${toAddr.toLowerCase()}`

  const [prevAddr, setPrevAddr] = useState<string>('')
  const [loadedMsgs, setLoadedMsgs] = useState<MessageUIType[]>([])
  const [chatData, setChatData] = useState<MessageType[]>(
    localStorage['dmData_' + account + '_' + toAddr.toLowerCase()]
      ? JSON.parse(
        localStorage['dmData_' + account + '_' + toAddr.toLowerCase()]
      )
      : []
  )
  const [encryptedChatData, setEncChatData] = useState<MessageType[]>(
    localStorage['dmDataEnc_' + account + '_' + toAddr.toLowerCase()]
      ? JSON.parse(
        localStorage['dmDataEnc_' + account + '_' + toAddr.toLowerCase()]
      )
      : []
  )
  const [isFetchingChatData, setIsFetchingChatData] = useState(false)

  const scrollToBottomRef = React.useRef<HTMLDivElement>(null)

  const accountPfp = pfpDataByAddr[account] || ''
  const toAddrPfp = pfpDataByAddr[toAddr]

  useEffect(() => {
    if (accountPfp === undefined) {
      dispatch(fetchPfpDataForAddr(account))
    }

    if (toAddrPfp === undefined) {
      dispatch(fetchPfpDataForAddr(toAddr))
    }
  }, [account, toAddr, accountPfp, toAddrPfp, dispatch])

  const getChatData = useCallback(() => {
    // GET request to get off-chain data for RX user
    if (!ENV.REACT_APP_REST_API) {
      console.log('REST API url not in .env', ENV)
      return
    }
    if (!account) {
      console.log('No account connected')
      return
    }
    if (!isAuthenticated) {
      console.log('Not authenticated')
      return
    }
    if (!toAddr) {
      console.log('Recipient address is not available')
      return
    }
    if (semaphore.current) {
      console.log(
        'preventing re-entrant calls if fetching is slow (happens at statup with decryption sometimes)'
      )
      return
    }
    setIsFetchingChatData(true)

    if (toAddr !== prevAddr) {
      setPrevAddr(toAddr)
      setIsFetchingChatData(false)
      const temp = [] as MessageUIType[]
      setLoadedMsgs(temp)
      return // skip the account transition glitch
    }
    setPrevAddr(toAddr)
    semaphore.current = true

    let lastTimeMsg = DEFAULT_LAST_MESSAGE_TIME
    if (chatData.length > 0) {
      lastTimeMsg = chatData[chatData.length - 1].timestamp
    }
    lastTimeMsg = encodeURIComponent(lastTimeMsg)

    fetch(
      ` ${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/getall_chatitems/${account}/${toAddr}/${lastTimeMsg}`,
      getFetchOptions()
    )
      .then((response) => response.json())
      .then(async (data: MessageType[]) => {
        if (chatData.length > 0) {
          if (data.length > 0) {
            // START LIT ENCRYPTION
            localStorage[localStorageKeyDmDataEncToAddr] = JSON.stringify(
              encryptedChatData.concat(data)
            )
            setEncChatData(encryptedChatData.concat(data))

            const replica = JSON.parse(JSON.stringify(data))
            // Get data from LIT and replace the message with the decrypted text
            for (let i = 0; i < replica.length; i += 1) {
              if (replica[i].encrypted_sym_lit_key) {
                // only needed for mixed DB with plain and encrypted data
                const accessControlConditions = JSON.parse(
                  replica[i].lit_access_conditions
                )

                // console.log('✅[POST][Decrypt Message]:', replica[i], replica[i].encrypted_sym_lit_key, accessControlConditions)
                // after change to include SC conditions, we had to change LIT accessControlConditions to UnifiedAccessControlConditions
                // this is done to support legacy messages (new databases wouldn't need this)
                if (
                  String(replica[i].lit_access_conditions).includes('evmBasic')
                ) {
                  // console.log('✅[INFO][Using Orig Decrypt Conditions]')
                  const rawmsg = await lit.decryptString(
                    lit.b64toBlob(replica[i].message),
                    replica[i].encrypted_sym_lit_key,
                    accessControlConditions
                  )
                  replica[i].message = rawmsg.decryptedFile.toString()
                } else {
                  const rawmsg = await lit.decryptStringOrig(
                    lit.b64toBlob(replica[i].message),
                    replica[i].encrypted_sym_lit_key,
                    accessControlConditions
                  )
                  replica[i].message = rawmsg.decryptedFile.toString()
                }
              }
            }
            // END LIT ENCRYPTION
            const allChats = chatData.concat(replica)
            setChatData(allChats)
            localStorage[localStorageKeyDmDataToAddr] = JSON.stringify(allChats) // store so when user switches views, data is ready
            console.log('✅[GET][New Chat items]:', data)
          }
        } else if (equal(data, encryptedChatData) === false) {
          console.log('✅[GET][Chat items]:', data)
          // START LIT ENCRYPTION
          localStorage[localStorageKeyDmDataEncToAddr] = JSON.stringify(data)
          setEncChatData(data)

          const replica = JSON.parse(JSON.stringify(data))
          // Get data from LIT and replace the message with the decrypted text
          for (let i = 0; i < replica.length; i += 1) {
            if (replica[i].encrypted_sym_lit_key) {
              // only needed for mixed DB with plain and encrypted data
              const accessControlConditions = JSON.parse(
                replica[i].lit_access_conditions
              )

              // console.log('✅[POST][Decrypt Message]:', replica[i], replica[i].encrypted_sym_lit_key, accessControlConditions)
              // after change to include SC conditions, we had to change LIT accessControlConditions to UnifiedAccessControlConditions
              // this is done to support legacy messages (new databases wouldn't need this)
              if (
                String(replica[i].lit_access_conditions).includes('evmBasic')
              ) {
                // console.log('✅[INFO][Using Orig Decrypt Conditions]')
                const rawmsg = await lit.decryptString(
                  lit.b64toBlob(replica[i].message),
                  replica[i].encrypted_sym_lit_key,
                  accessControlConditions
                )
                replica[i].message = rawmsg.decryptedFile.toString()
              } else {
                const rawmsg = await lit.decryptStringOrig(
                  lit.b64toBlob(replica[i].message),
                  replica[i].encrypted_sym_lit_key,
                  accessControlConditions
                )
                replica[i].message = rawmsg.decryptedFile.toString()
              }
            }
          }
          setChatData(replica)
          localStorage[localStorageKeyDmDataToAddr] = JSON.stringify(replica)
          // END LIT ENCRYPTION
          // setChatData(data) use when not using encryption
        }
        setIsFetchingChatData(false)
        semaphore.current = false
      })
      .catch((error) => {
        console.error('🚨[GET][Chat items]:', error)
        setIsFetchingChatData(false)
        semaphore.current = false
      })
    // since we are only loading new messages, we need to update read status async and even after we aren't get new messages
    // in the case its a while before a user reads the message
    fetch(
      ` ${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/getread_chatitems/${account}/${toAddr}`,
      getFetchOptions()
    )
      .then((response) => response.json())
      .then(async (data: Int32Array[]) => {
        const localRead = localStorage[localStorageKeyDmReadIDsToAddr]
        if (localRead !== data) {
          if (data.length > 0) {
            let localData = localStorage[localStorageKeyDmDataToAddr]
            if (localData) {
              localData = JSON.parse(localData)
              for (let j = 0; j < localData.length; j += 1) {
                for (let i = 0; i < data.length; i += 1) {
                  if (localData[j].Id === data[i]) {
                    localData[j].read = true
                    break
                  }
                }
              }
              setChatData(localData)
              localStorage[localStorageKeyDmReadIDsToAddr] = data
              localStorage[localStorageKeyDmDataToAddr] =
                JSON.stringify(localData) // store so when user switches views, data is ready
              console.log('✅[GET][Updated Read Items]:', data)
            }
          }
        }
      })
      .catch((error) => {
        console.error('🚨[GET][Update Read items]:', error)
        setIsFetchingChatData(false)
      })
  }, [account, chatData, isAuthenticated, toAddr])

  useEffect(() => {
    getChatData()

    // Interval needs to reset else getChatData will use old state
    const interval = setInterval(() => getChatData, 5000) // every 5s

    return () => clearInterval(interval)
  }, [isAuthenticated, account, toAddr, chatData, getChatData])

  useEffect(() => {
    const toAddToUI = [] as MessageUIType[]

    for (let i = 0; i < chatData.length; i += 1) {
      if (
        chatData[i] &&
        chatData[i].toaddr &&
        chatData[i].toaddr.toLowerCase() === account.toLowerCase()
      ) {
        toAddToUI.push({
          sender_name: chatData[i].sender_name,
          message: chatData[i].message,
          fromAddr: chatData[i].fromaddr,
          toAddr: chatData[i].toaddr,
          timestamp: chatData[i].timestamp,
          read: chatData[i].read,
          id: chatData[i].id,
          position: 'left',
          isFetching: false,
          nftAddr: chatData[i].nftaddr,
          nftId: chatData[i].nftid,
        })
      } else if (
        chatData[i] &&
        chatData[i].toaddr &&
        chatData[i].fromaddr.toLowerCase() === account.toLowerCase()
      ) {
        toAddToUI.push({
          sender_name: chatData[i].sender_name,
          message: chatData[i].message,
          fromAddr: chatData[i].fromaddr,
          toAddr: chatData[i].toaddr,
          timestamp: chatData[i].timestamp,
          read: chatData[i].read,
          id: chatData[i].id,
          position: 'right',
          isFetching: false,
          nftAddr: chatData[i].nftaddr,
          nftId: chatData[i].nftid,
        })
      }
    }
    if (!equal(toAddToUI, chatData)) {
      setLoadedMsgs(toAddToUI)
    }
  }, [chatData, account])

  const updateRead = useCallback(
    (data: MessageUIType) => {
      console.log('updateRead')
      let indexOfMsg = -1
      const newLoadedMsgs = [...loadedMsgs]
      for (let i = newLoadedMsgs.length - 1; i > 0; i -= 1) {
        if (newLoadedMsgs[i].timestamp === data.timestamp) {
          indexOfMsg = i
          break
        }
      }
      if (indexOfMsg !== -1) {
        newLoadedMsgs[indexOfMsg] = {
          ...newLoadedMsgs[indexOfMsg],
          read: true,
        }
        setLoadedMsgs(newLoadedMsgs)
      }
    },
    [loadedMsgs]
  )

  const renderedMessages = useMemo(() => {
    return loadedMsgs.map((msg: MessageUIType, i) => {
      if (msg && msg.message) {
        if (msg.fromAddr?.toLocaleLowerCase() === account.toLocaleLowerCase()) {
          return (
            <ChatMessage
              key={i}
              context='dms'
              account={account}
              msg={msg}
              pfpImage={accountPfp}
              updateRead={updateRead}
            />
          )
        } else {
          return (
            <ChatMessage
              key={i}
              context='dms'
              account={account}
              msg={msg}
              pfpImage={toAddrPfp}
              updateRead={updateRead}
            />
          )
        }
      }
      return null
    })
  }, [account, accountPfp, loadedMsgs, toAddrPfp, updateRead])

  return (
    <Flex background='white' height='100vh' flexDirection='column' flex='1'>
      <Header />

      <DottedBackground className='custom-scrollbar'>
        {isFetchingChatData && loadedMsgs.length === 0 && (
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
        )}
        {isFetchingChatData && loadedMsgs.length === 0 && (
          <Flex justifyContent='center' alignItems='center' height='100%'>
            <Spinner />
          </Flex>
        )}
        {toAddr === '0x17FA0A61bf1719D12C08c61F211A063a58267A19' && (
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
        {renderedMessages}
        <Box ref={scrollToBottomRef} float='left' style={{ clear: 'both' }} />
      </DottedBackground>

      <Submit
        delegate={delegate}
        loadedMsgs={loadedMsgs}
        toAddr={toAddr}
        setLoadedMsgs={setLoadedMsgs}
        account={account}
        scrollToBottomRef={scrollToBottomRef}
      />
    </Flex>
  )
}

export default DMByAddress
