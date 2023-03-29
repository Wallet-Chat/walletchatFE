import { createSlice } from '@reduxjs/toolkit'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { createErrorResponse } from '@/redux/reducers/helpers'
import { prepareHeaderCredentials } from '@/helpers/fetch'
import * as ENV from '@/constants/env'
import { RootState } from '@/redux/store'
import storage from '@/utils/storage'
import lit from '@/utils/lit'
import { ChatMessageType, InboxMessageType } from '@/types/Message'

export const STORAGE_KEYS = Object.freeze({
  DM_DATA: 'dmData',
  INBOX_DATA: 'inboxData',
  ENC_DM_IDS: 'encDmIds',
})

export function getSessionDataByAccount(key: string) {
  try {
    const sessionDataByAccount = sessionStorage.getItem(key)
    return sessionDataByAccount ? JSON.parse(sessionDataByAccount) : null
  } catch (error: any) {
    return null
  }
}

export function getSessionData(account: string, key: string) {
  const sessionDataByAccount = getSessionDataByAccount(key)
  if (!sessionDataByAccount) return null

  const sessionData = sessionDataByAccount[account.toLocaleLowerCase()]
  return sessionData || null
}

export function getLocalDataByAccount(key: string) {
  const localDataByAccount = storage.get(key)
  return localDataByAccount || null
}

export function getLocalData(account: string, key: string) {
  const localDataByAccount = getLocalDataByAccount(key)
  if (!localDataByAccount) return null

  const localData = localDataByAccount[account.toLocaleLowerCase()]
  return localData || null
}

export function getLocalEncDmIdsByAddrByAcc(account: string, toAddr: string) {
  const localEncDmIdsByAddr = getLocalData(account, STORAGE_KEYS.ENC_DM_IDS)
  if (!localEncDmIdsByAddr) return null

  const localEncDmIds = localEncDmIdsByAddr[toAddr.toLocaleLowerCase()]
  return localEncDmIds || null
}

// Stores encrypted DM IDs in localStorage in the case of failures
// to decrypt, and the page is refreshed/closed and memory state is lost
// this is going to be used to retrieve what local DM messages still need
// to be decrypted
export function updateLocalEncDmIdsByAddrByAcc(
  account: string,
  toAddr: string,
  encDms: number[]
) {
  const encDmDataObj = storage.get(STORAGE_KEYS.ENC_DM_IDS)
  const encDmDataForAccount = encDmDataObj?.[account.toLocaleLowerCase()] || {}

  storage.set(STORAGE_KEYS.ENC_DM_IDS, {
    [account.toLocaleLowerCase()]: {
      ...encDmDataForAccount,
      [toAddr.toLocaleLowerCase()]: encDms,
    },
  })
}

export async function decryptMessage(
  data: ChatMessageType[] | InboxMessageType[],
  account: string
) {
  const fetchedMessages = JSON.parse(JSON.stringify(data))
  const pendingMsgs: Promise<{ decryptedFile: any }>[] = []

  console.log('ℹ️[POST][Decrypt DMs]')

  // Get data from LIT and replace the message with the decrypted text
  for (let i = 0; i < fetchedMessages.length; i += 1) {
    if (fetchedMessages[i].encrypted_sym_lit_key) {
      // only needed for mixed DB with plain and encrypted data
      const accessControlConditions = JSON.parse(
        fetchedMessages[i].lit_access_conditions
      )

      // after change to include SC conditions, we had to change LIT accessControlConditions to UnifiedAccessControlConditions
      // this is done to support legacy messages (new databases wouldn't need this)
      if (
        String(fetchedMessages[i].lit_access_conditions).includes('evmBasic')
      ) {
        const rawmsg = lit.decryptString(
          lit.b64toBlob(fetchedMessages[i].message),
          fetchedMessages[i].encrypted_sym_lit_key,
          accessControlConditions
        )
        pendingMsgs[i] = rawmsg
      } else {
        const rawmsg = lit.decryptStringOrig(
          lit.b64toBlob(fetchedMessages[i].message),
          fetchedMessages[i].encrypted_sym_lit_key,
          accessControlConditions
        )
        pendingMsgs[i] = rawmsg
      }
    }
  }

  const failedDecryptMsgs: any[] = []
  await Promise.allSettled(pendingMsgs).then((messages) => {
    messages.forEach((result, i) => {
      const rawmsg = (
        result as unknown as {
          status: string
          value: { decryptedFile: string }
        }
      ).value

      if (rawmsg?.decryptedFile?.toString()) {
        fetchedMessages[i].message = rawmsg.decryptedFile.toString()
      } else {
        failedDecryptMsgs.push(fetchedMessages[i])
      }
    })
  })

  console.log('✅[POST][Decrypt DMs]')

  failedDecryptMsgs.forEach((msg, i) => {
    updateLocalEncDmIdsByAddrByAcc(
      account,
      msg.toaddr === account ? msg.fromaddr : msg.toaddr,
      failedDecryptMsgs[i]
    )

    failedDecryptMsgs[i] = failedDecryptMsgs[i].Id
  })

  return { fetchedMessages, failedDecryptMsgs }
}

export function getSessionDmDataForAccountToAddr(
  account: string,
  toAddr: string
) {
  const sessionDmDataByAddr = getSessionData(account, STORAGE_KEYS.DM_DATA)
  if (!sessionDmDataByAddr) return null

  const sessionDmData = sessionDmDataByAddr[toAddr.toLocaleLowerCase()]

  return sessionDmData || null
}

export function getLocalDmDataForAccountToAddr(
  account: string,
  toAddr: string
) {
  const localDmDataByAddr = getLocalData(account, STORAGE_KEYS.DM_DATA)
  if (!localDmDataByAddr) return null

  const localDmData = localDmDataByAddr[toAddr.toLocaleLowerCase()]
  if (!localDmData) return null

  return localDmData
}

export function updateSessionDmDataForAccountToAddr(
  account: string,
  toAddr: string,
  chatData: ChatMessageType[]
) {
  const sessionDmDataByAddr =
    getSessionData(account, STORAGE_KEYS.DM_DATA) || []

  sessionStorage.setItem(
    STORAGE_KEYS.DM_DATA,
    JSON.stringify({
      [account.toLocaleLowerCase()]: {
        ...sessionDmDataByAddr,
        [toAddr.toLocaleLowerCase()]: chatData,
      },
    })
  )
}

export function updateLocalDmDataForAccountToAddr(
  account: string,
  toAddr: string,
  chatData: ChatMessageType[]
) {
  const dmDataObj = storage.get(STORAGE_KEYS.DM_DATA)
  const dmDataForAccount = dmDataObj?.[account.toLocaleLowerCase()] || {}

  storage.set(STORAGE_KEYS.DM_DATA, {
    [account.toLocaleLowerCase()]: {
      ...dmDataForAccount,
      [toAddr.toLocaleLowerCase()]: chatData,
    },
  })
}

export function addSessionDmDataForAccountToAddr(
  account: string,
  toAddr: string,
  chatData: ChatMessageType[]
) {
  const sessionDmData = getSessionDmDataForAccountToAddr(account, toAddr) || []

  updateSessionDmDataForAccountToAddr(account, toAddr, [
    ...sessionDmData,
    ...chatData,
  ])
}

export function addLocalDmDataForAccountToAddr(
  account: string,
  toAddr: string,
  chatData: ChatMessageType[]
) {
  const localDmData = getLocalDmDataForAccountToAddr(account, toAddr) || []

  updateLocalDmDataForAccountToAddr(account, toAddr, [
    ...localDmData,
    ...chatData,
  ])
}

function getInboxChatPartner(account: string, inboxItem: InboxMessageType) {
  return inboxItem.fromaddr.toLocaleLowerCase() === account.toLocaleLowerCase()
    ? inboxItem.toaddr
    : inboxItem.fromaddr
}

interface InboxStore {
  [context: string]: {
    [from: string]: InboxMessageType
  }
}

export function getInboxDmDataForAccount(account: string) {
  const localInboxData = storage.get(STORAGE_KEYS.INBOX_DATA) || {}

  const accountInboxData =
    (localInboxData?.[account.toLocaleLowerCase()] as InboxStore) || {}

  const inboxDataObj: InboxStore = {
    dm: {},
    nft: {},
    community: {},
    ...accountInboxData,
  }

  return inboxDataObj
}

export function getInboxFrom(account: string, item: InboxMessageType) {
  const isCommunityOrNFT =
    item.context_type === 'community' || item.context_type === 'nft'
  const fromValue = isCommunityOrNFT
    ? item.nftaddr
    : getInboxChatPartner(account, item)
  return fromValue
}

export function updateLocalInboxDataForAccount(
  account: string,
  inboxData: InboxMessageType[]
) {
  const localInboxData = getInboxDmDataForAccount(account)

  inboxData.forEach((item) => {
    localInboxData[item.context_type][getInboxFrom(account, item)] = item
  })

  storage.set(STORAGE_KEYS.INBOX_DATA, {
    [account.toLocaleLowerCase()]: localInboxData,
  })
}

const selectState = (state: RootState) => state.dm
const selectEncryptedDmIdsByAddrByAcc = (state: RootState) =>
  selectState(state).encryptedDmIdsByAddrByAcc
const selectEncryptedDmIdsByAddr = (state: RootState, account: string) => {
  const encryptedDmIdsByAddrByAcc = selectEncryptedDmIdsByAddrByAcc(state)
  return encryptedDmIdsByAddrByAcc?.[account.toLocaleLowerCase()]
}
export const selectEncryptedDmIds = (
  state: RootState,
  account: string,
  toAddr: string
) => {
  const dmDataEncByAddrForAccount = selectEncryptedDmIdsByAddr(state, account)
  return (
    dmDataEncByAddrForAccount?.[toAddr.toLocaleLowerCase()] ||
    getLocalEncDmIdsByAddrByAcc(account, toAddr)
  )
}

type DMState = {
  account: undefined | string
  encryptedDmIdsByAddrByAcc: {
    [account: string]: { [toAddr: string]: number[] }
  }
}

const initialState: DMState = {
  account: undefined,
  encryptedDmIdsByAddrByAcc: {},
}

export const dmSlice = createSlice({
  name: 'dm',
  initialState,
  reducers: {
    setAccount: (state, action) => {
      state.account = action.payload
    },

    addEncryptedDmIds: (state, action) => {
      const { account, toAddr, data } = action.payload
      const accountData = state.encryptedDmIdsByAddrByAcc[account] || {}

      if (!accountData) {
        state.encryptedDmIdsByAddrByAcc = {
          [account]: {
            [toAddr]: data,
          },
        }
      } else if (!accountData[toAddr]) {
        state.encryptedDmIdsByAddrByAcc[account] = {
          [toAddr]: data,
        }
      } else {
        state.encryptedDmIdsByAddrByAcc[account][toAddr] = data
      }

      updateLocalEncDmIdsByAddrByAcc(account, toAddr, data)
    },
  },
})

export const { setAccount, addEncryptedDmIds } = dmSlice.actions

async function fetchAndStoreChatData(
  queryArgs: any,
  { dispatch }: any,
  extraOptions: any,
  fetchWithBQ: any
) {
  try {
    const { account, toAddr } = queryArgs

    if (!ENV.REACT_APP_REST_API) {
      throw new Error('REST API url not in .env')
    }
    if (!account) {
      throw new Error('No account connected')
    }
    if (!toAddr) {
      throw new Error('Recipient address is not available')
    }

    const localData = getLocalDmDataForAccountToAddr(account, toAddr) || []
    const hasLocalData = localData && localData.length > 0

    let lastTimeMsg
    if (hasLocalData) {
      lastTimeMsg = localData[localData.length - 1].timestamp
    }

    const data =
      ((
        await fetchWithBQ(
          `${ENV.REACT_APP_REST_API}/${
            ENV.REACT_APP_API_VERSION
          }/getall_chatitems/${account}/${toAddr}${
            lastTimeMsg ? `/${lastTimeMsg}` : ''
          }`
        )
      ).data as unknown as ChatMessageType[]) || []

    if (data.length === 0) {
      return { data: JSON.stringify(localData) }
    }

    if (!hasLocalData) {
      console.log('✅[GET][Chat items]')
    } else {
      console.log('✅[GET][New Chat items]')
    }

    const { fetchedMessages, failedDecryptMsgs } = await decryptMessage(
      data,
      account
    )

    dispatch(addEncryptedDmIds({ account, toAddr, data: failedDecryptMsgs }))

    const allChats = localData.concat(fetchedMessages)

    // store so when user switches views, data is ready
    addLocalDmDataForAccountToAddr(account, toAddr, fetchedMessages)

    return { data: JSON.stringify(allChats) }
  } catch (error) {
    console.log('🚨[GET][Chat items]:', error)
    return { data: '' }
  }
}

export const dmApi = createApi({
  reducerPath: 'dmApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/`,
    prepareHeaders: (headers: Headers, { getState }) => {
      const state = selectState(getState() as any) as DMState
      const account = state.account

      return prepareHeaderCredentials(headers, account)
    },
  }),

  endpoints: (builder) => ({
    getPfp: builder.query({
      query: (addr) => ({ url: `image/${addr}` }),
      transformResponse: async (response: any) => {
        console.log('✅[GET][Image FromAddr]:', response)

        const base64data = response[0]?.base64data

        return base64data || null
      },
      transformErrorResponse: createErrorResponse('Image'),
    }),

    getName: builder.query({
      query: (addr) => ({ url: `name/${addr}` }),
      transformResponse: async (response: any) => {
        console.log('✅[GET][Name]:', response)

        const name = response[0]?.name

        return name || null
      },
      transformErrorResponse: createErrorResponse('Name'),
    }),

    getChatData: builder.query({
      queryFn: fetchAndStoreChatData,
    }),

    // TODO -- only call if all messages not yet read.
    getReadChatItems: builder.query({
      queryFn: async (queryArgs, { dispatch }, extraOptions, fetchWithBQ) => {
        const { account, toAddr } = queryArgs

        const newLocalData = [
          ...(getLocalDmDataForAccountToAddr(account, toAddr) || []),
        ]
        const hasUnreads =
          newLocalData.length > 0 &&
          !newLocalData[newLocalData.length - 1]?.read

        if (!hasUnreads) {
          return { data: JSON.stringify(newLocalData) }
        }

        const response = (
          await fetchWithBQ(
            `${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/getread_chatitems/${account}/${toAddr}`
          )
        ).data as unknown as ChatMessageType[]

        const unreadData = new Set(response)

        newLocalData.forEach((chat, i) => {
          if (unreadData.has(chat.Id)) {
            newLocalData[i].read = true
          }
        })

        console.log('✅[GET][Updated Read Items]:')

        updateLocalDmDataForAccountToAddr(account, toAddr, newLocalData)

        return { data: JSON.stringify(newLocalData) }
      },
    }),

    // TODO: if unread count provider returns a higher value, fetch & update inbox data
    // TODO: make inbox use same chat msg as chat data to avoid
    // having to decrypt twice
    getInbox: builder.query({
      queryFn: async (queryArgs, { dispatch }, extraOptions, fetchWithBQ) => {
        try {
          const account = queryArgs

          if (!ENV.REACT_APP_REST_API) {
            throw new Error('REST API url not in .env')
          }
          if (!account) {
            throw new Error('No account connected')
          }

          const data = (
            await fetchWithBQ(
              `${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/get_inbox/${account}`
            )
          ).data as unknown as InboxMessageType[]

          if (!data) {
            updateLocalInboxDataForAccount(account, [])
            return { data: '' }
          }

          const storedInboxData = getInboxDmDataForAccount(account)

          const newInboxData = data.filter((inboxItem) => {
            if (!storedInboxData[inboxItem.context_type]) return true

            const currentInbox =
              storedInboxData[inboxItem.context_type][
                getInboxFrom(account, inboxItem)
              ]

            return !currentInbox || inboxItem.timestamp > currentInbox.timestamp
          })

          if (newInboxData.length > 0) {
            console.log('✅[GET][Inbox]:', data)

            const { fetchedMessages } = await decryptMessage(
              newInboxData,
              account
            )

            updateLocalInboxDataForAccount(account, fetchedMessages)
            return { data: JSON.stringify(getInboxDmDataForAccount(account)) }
          }

          return { data: '' }
        } catch (error) {
          console.log('🚨[GET][Inbox]:', error)
          return { data: '' }
        }
      },
    }),
  }),
})

export const {
  util: { updateQueryData, upsertQueryData, prefetch },
  endpoints,
  useGetPfpQuery,
  useGetNameQuery,
  useGetChatDataQuery,
  useGetReadChatItemsQuery,
  useGetInboxQuery,
} = dmApi

export default dmSlice.reducer
