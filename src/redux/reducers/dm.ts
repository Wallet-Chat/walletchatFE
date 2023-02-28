import { createSlice } from '@reduxjs/toolkit'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { createErrorResponse } from '@/redux/reducers/helpers'
import { prepareHeaderCredentials } from '@/helpers/fetch'
import * as ENV from '@/constants/env'
import { MessageType } from '@/types/Message'
import storage from '@/utils/storage'
import lit from '@/utils/lit'
import { InboxItemType } from '@/types/InboxItem'

const DM_DATA_LOCAL_STORAGE_KEY = 'dmData'
const INBOX_DATA_LOCAL_STORAGE_KEY = 'inboxData'

export async function decryptMessage(data: any[]) {
  const fetchedData = JSON.parse(JSON.stringify(data))
  const pendingMsgs: Promise<{ decryptedFile: any }>[] = []

  console.log('✅[POST][Decrypt Messages initiated]')

  // Get data from LIT and replace the message with the decrypted text
  for (let i = 0; i < fetchedData.length; i += 1) {
    if (fetchedData[i].encrypted_sym_lit_key) {
      // only needed for mixed DB with plain and encrypted data
      const accessControlConditions = JSON.parse(
        fetchedData[i].lit_access_conditions
      )

      // after change to include SC conditions, we had to change LIT accessControlConditions to UnifiedAccessControlConditions
      // this is done to support legacy messages (new databases wouldn't need this)
      if (String(fetchedData[i].lit_access_conditions).includes('evmBasic')) {
        const rawmsg = lit.decryptString(
          lit.b64toBlob(fetchedData[i].message),
          fetchedData[i].encrypted_sym_lit_key,
          accessControlConditions
        )
        pendingMsgs[i] = rawmsg
      } else {
        const rawmsg = lit.decryptStringOrig(
          lit.b64toBlob(fetchedData[i].message),
          fetchedData[i].encrypted_sym_lit_key,
          accessControlConditions
        )
        pendingMsgs[i] = rawmsg
      }
    }
  }

  await Promise.allSettled(pendingMsgs).then((messages) => {
    messages.forEach((result, i) => {
      const rawmsg = (
        result as unknown as {
          status: string
          value: { decryptedFile: string }
        }
      ).value

      if (rawmsg?.decryptedFile?.toString()) {
        fetchedData[i].message = rawmsg.decryptedFile.toString()
      }
    })
  })

  return fetchedData
}

export function getLocalDmDataForAccountToAddr(
  account: string,
  toAddr: string
) {
  const dmDataObj = storage.get(DM_DATA_LOCAL_STORAGE_KEY)

  if (!dmDataObj) return null

  const dmDataForAccount = dmDataObj[account.toLocaleLowerCase()]

  if (!dmDataForAccount) return null

  const dmDataForAccountToAddr = dmDataForAccount[toAddr.toLocaleLowerCase()]

  return dmDataForAccountToAddr || null
}

function updateLocalDmDataForAccountToAddr(
  account: string,
  toAddr: string,
  chatData: MessageType[]
) {
  const dmDataObj = storage.get(DM_DATA_LOCAL_STORAGE_KEY)
  const dmDataForAccount = dmDataObj?.[account.toLocaleLowerCase()] || {}

  storage.set(DM_DATA_LOCAL_STORAGE_KEY, {
    [account.toLocaleLowerCase()]: {
      ...dmDataForAccount,
      [toAddr.toLocaleLowerCase()]: chatData,
    },
  })
}

function addLocalDmDataForAccountToAddr(
  account: string,
  toAddr: string,
  chatData: MessageType[]
) {
  const dmDataObj = storage.get(DM_DATA_LOCAL_STORAGE_KEY)
  const dmDataForAccount = dmDataObj?.[account.toLocaleLowerCase()] || {}
  const dmDataForAccountToAddr =
    dmDataForAccount?.[toAddr.toLocaleLowerCase()] || []

  updateLocalDmDataForAccountToAddr(account, toAddr, [
    ...dmDataForAccountToAddr,
    ...chatData,
  ])
}

function getInboxChatPartner(account: string, inboxItem: InboxItemType) {
  return inboxItem.fromaddr.toLocaleLowerCase() === account.toLocaleLowerCase()
    ? inboxItem.toaddr
    : inboxItem.fromaddr
}

interface InboxStore {
  [context: string]: {
    [from: string]: InboxItemType
  }
}

export function getInboxDmDataForAccount(account: string) {
  const localInboxData = storage.get(INBOX_DATA_LOCAL_STORAGE_KEY) || {}

  const accountInboxData =
    (localInboxData?.[account.toLocaleLowerCase()] as InboxStore) || {}

  const inboxDataObj: InboxStore = {
    dm: {},
    community: {},
    ...accountInboxData,
  }

  return inboxDataObj
}

function getInboxFrom(account: string, item: InboxItemType) {
  const isCommunity = item.context_type === 'community'
  const fromValue = isCommunity
    ? item.nftaddr
    : getInboxChatPartner(account, item)
  return fromValue
}

function updateLocalInboxDataForAccount(
  account: string,
  inboxData: InboxItemType[]
) {
  const localInboxData = getInboxDmDataForAccount(account)

  inboxData.forEach((item) => {
    localInboxData[item.context_type][getInboxFrom(account, item)] = item
  })

  storage.set(INBOX_DATA_LOCAL_STORAGE_KEY, {
    [account.toLocaleLowerCase()]: localInboxData,
  })
}

type DMState = {
  dmDataEncByAccountByAddr: { [account: string]: { [toAddr: string]: string } }
}

const initialState: DMState = {
  dmDataEncByAccountByAddr: {},
}

export const dmSlice = createSlice({
  name: 'dm',
  initialState,
  reducers: {
    addDmDataEnc: (state, action) => {
      const { account, toAddr, data } = action.payload
      const accountData = state.dmDataEncByAccountByAddr[account] || {}

      if (!accountData) {
        state.dmDataEncByAccountByAddr = {
          [account]: {
            [toAddr]: data,
          },
        }
      } else if (!accountData[toAddr]) {
        state.dmDataEncByAccountByAddr[account] = {
          [toAddr]: data,
        }
      } else {
        state.dmDataEncByAccountByAddr[account][toAddr] = JSON.stringify(data)
      }
    },
  },
})

const { addDmDataEnc } = dmSlice.actions

export const dmApi = createApi({
  reducerPath: 'dmApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/`,
    prepareHeaders: prepareHeaderCredentials,
  }),

  endpoints: (builder) => ({
    getPfp: builder.query({
      query: (addr) => ({ url: `image/${addr}` }),
      transformResponse: async (response: any) => {
        console.log('✅[GET][Image FromAddr]:', response)

        const base64data = response[0]?.base64data

        return base64data
      },
      transformErrorResponse: createErrorResponse('Image'),
    }),

    getName: builder.query({
      query: (addr) => ({ url: `name/${addr}` }),
      transformResponse: async (response: any) => {
        console.log('✅[GET][Name]:', response)

        const name = response[0]?.name

        return name
      },
      transformErrorResponse: createErrorResponse('Name'),
    }),

    getChatData: builder.query({
      queryFn: async (queryArgs, { dispatch }, extraOptions, fetchWithBQ) => {
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

          const localData =
            getLocalDmDataForAccountToAddr(account, toAddr) || []
          const hasLocalData = localData && localData.length > 0

          let lastTimeMsg
          if (hasLocalData) {
            lastTimeMsg = localData[localData.length - 1].timestamp
          }

          const data = (
            await fetchWithBQ(
              `${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION
              }/getall_chatitems/${account}/${toAddr}${lastTimeMsg ? `/${lastTimeMsg}` : ''
              }`
            )
          ).data as unknown as MessageType[]

          if (data.length === 0) {
            return { data: JSON.stringify(localData) }
          }

          if (!hasLocalData) {
            console.log('✅[GET][Chat items]')
          } else {
            console.log('✅[GET][New Chat items]')
          }

          dispatch(
            addDmDataEnc({ account, toAddr, data: JSON.stringify(data) })
          )

          const fetchedData = await decryptMessage(data)

          const allChats = localData.concat(fetchedData)

          // store so when user switches views, data is ready
          addLocalDmDataForAccountToAddr(account, toAddr, fetchedData)

          console.log('✅[GET][Chats decrypted]')

          return { data: JSON.stringify(allChats) }
        } catch (error) {
          console.error('🚨[GET][Chat items]:', error)
          return { data: '' }
        }
      },
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
        ).data as unknown as MessageType[]

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
          ).data as unknown as InboxItemType[]

          console.log('✅[GET][Inbox]:', data)

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
            const fetchedData = await decryptMessage(newInboxData)

            updateLocalInboxDataForAccount(account, fetchedData)
            return { data: JSON.stringify(getInboxDmDataForAccount(account)) }
          }

          return { data: '' }
        } catch (error) {
          console.error('🚨[GET][Inbox]:', error)
          return { data: '' }
        }
      },
    }),
  }),
})

export const {
  util: { updateQueryData },
  useGetPfpQuery,
  useGetNameQuery,
  useGetChatDataQuery,
  useGetReadChatItemsQuery,
  useGetInboxQuery,
} = dmApi

export default dmSlice.reducer
