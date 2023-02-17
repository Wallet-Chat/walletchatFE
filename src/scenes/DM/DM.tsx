import {
  Box,
  Heading,
  Flex,
  Button,
} from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { Link } from 'react-router-dom'
import Web3 from 'web3'
import equal from 'fast-deep-equal/es6'

import { InboxItemType } from '../../types/InboxItem'
import InboxSearchInput from './components/InboxSearchInput'
import InboxList from '../../components/Inbox/InboxList'
// import InboxListLoadingSkeleton from '../../components/Inbox/InboxListLoadingSkeleton'
import lit from "../../utils/lit";
import * as ENV from '@/constants/env'

const Inbox = ({
  account,
  web3,
  isAuthenticated,
}: {
  account: string
  web3: Web3
  isAuthenticated: boolean
}) => {
  const semaphore = React.useRef<boolean>(false)

  const localStorageKey = `inbox_${account}`
  const localStorageValue = localStorage[localStorageKey]
  const storedInboxData = localStorageValue ? JSON.parse(localStorageValue) : []

  const [inboxData, setInboxData] = useState<InboxItemType[]>(
    storedInboxData
  )

  const dms = React.useMemo(() => inboxData.filter((d) => d.context_type === 'dm' && !(d.chain === 'none')), [inboxData])
  // const communities = React.useMemo(() => inboxData.filter((d) => d.context_type === 'community' && !(d.chain === 'none')), [inboxData])

  // const [encryptedChatData, setEncChatData] = useState<InboxItemType[]>(
  //   localStorage[localStorageKey] ? JSON.parse(localStorage[localStorageKey]) : []
  // )
  const [isFetchingInboxData, setIsFetchingInboxData] = useState(false)
  // const { unreadCount } = useUnreadCount()

  const getInboxData = React.useCallback(() => {
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
    if (semaphore.current) {
      // console.log('Don't perform re-entrant call')
      return
    }
    setIsFetchingInboxData(true)
    semaphore.current = true;
    fetch(`${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/get_inbox/${account}`, {
      method: 'GET',
      credentials: "include",
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('jwt')}`,
      },
    })
      .then((response) => response.json())
      .then(async (data: InboxItemType[]) => {
        if (data === null) {
          setInboxData([])
          localStorage[localStorageKey] = JSON.stringify([])
        } else if (!localStorage['inboxEnc_' + account] || equal(JSON.parse(localStorage['inboxEnc_' + account]), data) !== true) {
          console.log('✅[GET][Inbox]:', data)
          // setEncChatData(data)
          localStorage[localStorageKey] = JSON.stringify(data)

          const replica = JSON.parse(JSON.stringify(data));
          // Get data from LIT and replace the message with the decrypted text
          for (let i = 0; i < replica.length; i += 1) {
            if (replica[i].encrypted_sym_lit_key) {  // only needed for mixed DB with plain and encrypted data
              const accessControlConditions = JSON.parse(replica[i].lit_access_conditions)

              console.log('✅[POST][Decrypt GetInbox Message]:', replica[i], replica[i].encrypted_sym_lit_key, accessControlConditions)
              const blob = lit.b64toBlob(replica[i].message)

              let rawmsg: any = ''
              // after change to include SC conditions, we had to change LIT accessControlConditions to UnifiedAccessControlConditions
              // this is done to support legacy messages (new databases wouldn't need this)
              if (String(replica[i].lit_access_conditions).includes('evmBasic')) {
                rawmsg = lit.decryptString(blob, replica[i].encrypted_sym_lit_key, accessControlConditions)
              } else {
                rawmsg = lit.decryptStringOrig(blob, replica[i].encrypted_sym_lit_key, accessControlConditions)
              }
              replica[i].message = rawmsg
            }
          }

          const messages = replica.map((i: any) => i.message)
          await Promise.allSettled(messages).then((results: any) => results.forEach((result: any, i: number) => {
            replica[i].message = result.value.decryptedFile.toString()
          }))

          setInboxData(replica)
          // setInboxData(data)
          localStorage[localStorageKey] = JSON.stringify(replica)
        }
        setIsFetchingInboxData(false)
        semaphore.current = false;
      })
      .catch((error) => {
        console.error('🚨[GET][Inbox]:', error)
        setIsFetchingInboxData(false)
        semaphore.current = false;
      })
  }, [account, isAuthenticated, localStorageKey])

  useEffect(() => {
    getInboxData()

    const interval = setInterval(() => {
      getInboxData()
    }, 5000) // every 5s

    return () => clearInterval(interval)
  }, [])

   // if (isFetchingInboxData && inboxData.length === 0) {
   //    return <InboxListLoadingSkeleton />
   // }

  return (
    <Box
      background="white"
      height={isMobile ? 'unset' : '100vh'}
      borderRight="1px solid var(--chakra-colors-lightgray-400)"
      width="360px"
      maxW="100%"
      overflowY="scroll"
      className="custom-scrollbar"
    >
      <Box
        px={5}
        pt={5}
        pb={3}
        pos="sticky"
        top="0"
        background="white"
        zIndex="sticky"
      >
        <Flex justifyContent="space-between" mb={2}>
          <Heading size="lg">Wallet-to-wallet chat</Heading>
          <Button
            as={Link}
            to="/dm/new"
            size="sm"
            variant="outline"
            _hover={{
              textDecoration: 'none',
              backgroundColor: 'var(--chakra-colors-lightgray-300)',
            }}
          >
            + New
          </Button>
        </Flex>
        <InboxSearchInput />
      </Box>

      <InboxList context="dms" data={dms} web3={web3} account={account} />
    </Box>
  )
}

export default Inbox
