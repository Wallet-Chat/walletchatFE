import { createSlice } from '@reduxjs/toolkit'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { createErrorResponse } from '@/redux/reducers/helpers'
import { prepareHeaderCredentials } from '@/helpers/fetch'
import * as ENV from '@/constants/env'
import { RootState } from '@/redux/store'
import storage from '@/utils/storage'
import Lit from '@/utils/lit'
import { ChatMessageType, InboxMessageType } from '@/types/Message'
import { PAGE_SIZE } from '@/scenes/DM/scenes/DMByAddress/DMByAddress'

export const STORAGE_KEYS = Object.freeze({
  DM_DATA: 'dmData',
  PENDING_DATA: 'pendingData',
  INBOX_DATA: 'inboxData',
  ENC_DM_IDS: 'encDmIds',
})

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
  messages: ChatMessageType[] | InboxMessageType[],
  account: string,
  dispatch: any,
  methodName: 'getChatData' | 'getInbox'
) {
  // Reverse it so newer messages are decrypted first
  messages.reverse()
  const decryptedMessages: ChatMessageType[] = []
  const failedDecryptMsgIds: number[] = []
  const toAddr = getMessageToAddr(account, messages[0])

  const addFailedDecryptMsg = () => (i: number) =>
    failedDecryptMsgIds.push(messages[i].Id)

  const getDecryptionResult =
    (i: number) =>
    ({ decryptedFile }: { decryptedFile?: string }) => {
      const message = decryptedFile?.toString()

      if (message) {
        decryptedMessages[i] = { ...messages[i], message }
        console.log('✅[POST][Decrypted DM]: ', message)

        if (methodName === 'getChatData') {
          dispatch(
            updateQueryData(methodName, { account, toAddr }, (chatData) => {
              const chatDataValue = JSON.parse(chatData)?.messages || []

              const index = chatDataValue.findIndex(
                (msg: ChatMessageType) => msg.Id === decryptedMessages[i].Id
              )

              if (index >= 0) {
                chatDataValue[index] = decryptedMessages[i]
              } else {
                chatDataValue.push(decryptedMessages[i])
              }

              const pendingMsgs = messages.filter(
                (msg) => !chatDataValue.some((chat: any) => chat.Id === msg.Id)
              )

              updatePendingDmDataForAccountToAddr(account, toAddr, pendingMsgs)
              updateLocalDmDataForAccountToAddr(account, toAddr, chatDataValue)
              return JSON.stringify({ messages: chatDataValue, pendingMsgs })
            })
          )
        } else if (methodName === 'getInbox') {
          dispatch(
            updateQueryData(methodName, account, () => {
              updateLocalInboxDataForAccount(account, [
                decryptedMessages[i] as InboxMessageType,
              ])

              const newInboxData = getInboxDmDataForAccount(account)
              // const pendingMsgs = messages.filter(
              //   (msg) => !newInboxData.some((chat: any) => chat.Id === msg.Id)
              // )

              return JSON.stringify({
                ...newInboxData,
                // pendingMsgs,
              })
            })
          )
        }
      } else {
        addFailedDecryptMsg()(i)
      }
    }

  const amountToDecrypt =
    messages.length > PAGE_SIZE ? PAGE_SIZE : messages.length

  // Get data from LIT and replace the message with the decrypted text
  for (let i = 0; i < amountToDecrypt; i += 1) {
    if (i === 0) console.log('ℹ️[POST][Decrypt DMs Begin]')

    if (messages[i].encrypted_sym_lit_key) {
      // only needed for mixed DB with plain and encrypted data
      const accessControlConditions = JSON.parse(
        messages[i].lit_access_conditions
      )

      // after change to include SC conditions, we had to change LIT accessControlConditions to UnifiedAccessControlConditions
      // this is done to support legacy messages (new databases wouldn't need this)
      if (String(messages[i].lit_access_conditions).includes('evmBasic')) {
        Lit.decryptString(
          account,
          Lit.b64toBlob(messages[i].message),
          messages[i].encrypted_sym_lit_key,
          accessControlConditions
        )
          .then(getDecryptionResult(i))
          .catch(addFailedDecryptMsg)
      } else {
        Lit.decryptStringOrig(
          account,
          Lit.b64toBlob(messages[i].message),
          messages[i].encrypted_sym_lit_key,
          accessControlConditions
        )
          .then(getDecryptionResult(i))
          .catch(addFailedDecryptMsg)
      }
    }
  }

  updateLocalEncDmIdsByAddrByAcc(account, toAddr, failedDecryptMsgIds)

  return {
    fetchedMessages: decryptedMessages,
    failedDecryptMsgs: failedDecryptMsgIds,
  }
}

export function getPendingDmDataForAccountToAddr(
  account: string,
  toAddr: string
) {
  const localDmDataByAddr = getLocalData(account, STORAGE_KEYS.PENDING_DATA)
  if (!localDmDataByAddr) return null

  const localDmData = localDmDataByAddr[toAddr.toLocaleLowerCase()]
  if (!localDmData) return null

  return localDmData
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

export function updatePendingDmDataForAccountToAddr(
  account: string,
  toAddr: string,
  chatData: ChatMessageType[]
) {
  const dmDataObj = storage.get(STORAGE_KEYS.PENDING_DATA)
  const dmDataForAccount = dmDataObj?.[account.toLocaleLowerCase()] || {}

  storage.set(STORAGE_KEYS.PENDING_DATA, {
    [account.toLocaleLowerCase()]: {
      ...dmDataForAccount,
      [toAddr.toLocaleLowerCase()]: chatData.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      ),
    },
  })
}

export function addPendingDmDataForAccountToAddr(
  account: string,
  toAddr: string,
  chatData: ChatMessageType[]
) {
  const localDmData = getLocalDmDataForAccountToAddr(account, toAddr) || []
  const newDmData = [...localDmData, ...chatData].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )

  updateLocalDmDataForAccountToAddr(account, toAddr, newDmData)
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
      [toAddr.toLocaleLowerCase()]: chatData.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      ),
    },
  })
}

export function addLocalDmDataForAccountToAddr(
  account: string,
  toAddr: string,
  chatData: ChatMessageType[]
) {
  const localDmData = getLocalDmDataForAccountToAddr(account, toAddr) || []
  const newDmData = [...localDmData, ...chatData].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )

  updateLocalDmDataForAccountToAddr(account, toAddr, newDmData)
}

function getMessageToAddr(
  account: string,
  msg: ChatMessageType | InboxMessageType
) {
  return msg.fromaddr.toLocaleLowerCase() === account.toLocaleLowerCase()
    ? msg.toaddr
    : msg.fromaddr
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
    : getMessageToAddr(account, item)
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
    const pendingData = getPendingDmDataForAccountToAddr(account, toAddr) || []
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
      return {
        data: JSON.stringify({ messages: localData, pendingMsgs: pendingData }),
      }
    }

    if (!hasLocalData) {
      console.log('✅[GET][Chat items]')
    } else {
      console.log('✅[GET][New Chat items]')
    }

    const { fetchedMessages, failedDecryptMsgs } = await decryptMessage(
      data,
      account,
      dispatch,
      'getChatData'
    )

    dispatch(addEncryptedDmIds({ account, toAddr, data: failedDecryptMsgs }))

    const allChats = localData.concat(fetchedMessages)

    // store so when user switches views, data is ready
    addLocalDmDataForAccountToAddr(account, toAddr, fetchedMessages)

    return { data: JSON.stringify({ messages: allChats }) }
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
          const newDms: InboxMessageType[] = []

          const newInboxData = data.filter((inboxItem) => {
            if (!storedInboxData[inboxItem.context_type]) return true

            const currentInbox =
              storedInboxData[inboxItem.context_type][
                getInboxFrom(account, inboxItem)
              ]

            if (!currentInbox || inboxItem.timestamp > currentInbox.timestamp) {
              if (inboxItem.context_type === 'dm') {
                newDms.push(inboxItem)
              }

              return true
            }
          })

          if (newInboxData.length > 0) {
            console.log('✅[GET][Inbox]:', data)

            if (newDms.length > 0) {
              const { fetchedMessages } = await decryptMessage(
                newInboxData,
                account,
                dispatch,
                'getInbox'
              )

              updateLocalInboxDataForAccount(account, fetchedMessages)
            }

            return {
              data: JSON.stringify(getInboxDmDataForAccount(account)),
            }
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
