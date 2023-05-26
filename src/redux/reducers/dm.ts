import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { createErrorResponse } from '@/redux/reducers/helpers'
import { prepareHeaderCredentials } from '@/helpers/fetch'
import * as ENV from '@/constants/env'
import { selectAccount } from '@/redux/reducers/account'
import storage from '@/utils/storage'
import Lit from '@/utils/lit'
import { ChatMessageType, InboxMessageType } from '@/types/Message'
import { PAGE_SIZE } from '@/scenes/DM/scenes/DMByAddress/DMByAddress'
import { log } from '@/helpers/log'

export const STORAGE_KEYS = Object.freeze({
  DM_DATA: 'dmData',
  PENDING_DATA: 'pendingData',
  INBOX_DATA: 'inboxData',
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

function litDecryptionForMessages(
  account: string,
  messages: ChatMessageType[] | InboxMessageType[],
  count: number,
  onDecryptionSuccess: (
    i: number
  ) => (litResponse?: { decryptedFile?: string }) => void,
  onBeforeBegin?: (messages: ChatMessageType[] | InboxMessageType[]) => void
) {
  // Reverse it so newer messages are decrypted first
  messages.reverse()

  if (onBeforeBegin) onBeforeBegin(messages)

  // Get data from LIT and replace the message with the decrypted text
  for (let i = 0; i < count; i += 1) {
    let shouldBreak

    const currentMessage = messages[i]

    if (
      currentMessage.encrypted_sym_lit_key &&
      !currentMessage.toaddr.includes('.eth') &&
      !currentMessage.fromaddr.includes('.eth')
    ) {
      // only needed for mixed DB with plain and encrypted data
      const accessControlConditions = JSON.parse(
        currentMessage.lit_access_conditions
      )

      Lit.decryptString(
        account,
        Lit.b64toBlob(currentMessage.message),
        currentMessage.encrypted_sym_lit_key,
        // after change to include SC conditions, we had to change LIT accessControlConditions to UnifiedAccessControlConditions
        // this is done to support legacy messages (new databases wouldn't need this)
        !String(currentMessage.lit_access_conditions).includes('evmBasic')
          ? { accessControlConditions }
          : { unifiedAccessControlConditions: accessControlConditions }
      )
        .then(onDecryptionSuccess(i))
        .catch(() => {
          // const messagesLeft = messages.slice(i)
          // setTimeout(
          //   () =>
          //     litDecryptionForMessages(
          //       account,
          //       messagesLeft,
          //       messagesLeft.length,
          //       cb
          //     ),
          //   1000 * 5
          // )
          // shouldBreak = true
        })

      if (shouldBreak) break
    } else {
      onDecryptionSuccess(i)({ decryptedFile: currentMessage.message })
    }
  }
}

export async function decryptInboxMessages(
  messages: InboxMessageType[],
  account: string,
  dispatch: any
) {
  const decryptedMessages: InboxMessageType[] = []

  const getDecryptionResult =
    (i: number) => (litResponse?: { decryptedFile?: string }) => {
      const message = litResponse?.decryptedFile?.toString()

      if (message) {
        decryptedMessages[i] = { ...messages[i], message }
        const newInboxValue = decryptedMessages[i]

        log('✅[POST][Decrypted Inbox Message]: ', newInboxValue)

        dispatch(
          updateQueryData('getInbox', account, () => {
            addLocalInboxDataForAccount(account, newInboxValue)
            const newInboxData = getInboxDmDataForAccount(account)
            const inboxDms = getAllInboxDmMessagesForAccount(account)

            const pendingMsgs = messages.filter(
              (msg) => !inboxDms.some((chat) => chat.Id === msg.Id)
            )

            return JSON.stringify({ ...newInboxData, pendingMsgs })
          })
        )
      }
    }

  log('ℹ️[POST][Decrypt Inbox Messages Begin]: ', messages)

  litDecryptionForMessages(
    account,
    messages,
    messages.length,
    getDecryptionResult
  )
}

export function updateQueryChatData(
  { account, toAddr }: { account: string; toAddr: string },
  fn: (chatData: string) => string
) {
  return updateQueryData(
    'getChatData',
    {
      account: account.toLocaleLowerCase(),
      toAddr: toAddr.toLocaleLowerCase(),
    },
    fn
  )
}

export async function decryptDMMessages(
  messages: ChatMessageType[],
  account: string,
  dispatch: any
) {
  const decryptedMessages: ChatMessageType[] = []
  const toAddr = getMessageToAddr(account, messages[0])

  const getDecryptionResult =
    (i: number) => (litResponse?: { decryptedFile?: string }) => {
      const message = litResponse?.decryptedFile?.toString()

      if (message) {
        decryptedMessages[i] = { ...messages[i], message }
        const newMessage = decryptedMessages[i]

        log('✅[POST][Decrypted DM Message]: ', newMessage)

        dispatch(
          updateQueryChatData({ account, toAddr }, () => {
            const pendingMsgs =
              getPendingDmDataForAccountToAddr(account, toAddr) || []
            const newPendingMsgs = pendingMsgs.filter(
              (msg: ChatMessageType) => msg.Id !== newMessage.Id
            )

            updatePendingDmDataForAccountToAddr(account, toAddr, newPendingMsgs)
            addLocalDmDataForAccountToAddr(account, toAddr, newMessage)

            const newChatData = getLocalDmDataForAccountToAddr(account, toAddr)

            return JSON.stringify({ messages: newChatData })
          })
        )
      }
    }

  log('ℹ️[POST][Decrypt DMs Begin]: ', messages)

  const onBeforeBegin = (messages: ChatMessageType[]) => {
    const currentChatData =
      getLocalDmDataForAccountToAddr(account, toAddr) || []

    const pendingMessages = messages.filter(
      (msg: ChatMessageType) =>
        msg.encrypted_sym_lit_key &&
        !currentChatData.some((chat: ChatMessageType) => chat.Id === msg.Id)
    )
    updatePendingDmDataForAccountToAddr(account, toAddr, pendingMessages)
  }

  const amountToDecrypt =
    messages.length > PAGE_SIZE ? PAGE_SIZE : messages.length

  litDecryptionForMessages(
    account,
    messages,
    amountToDecrypt,
    getDecryptionResult,
    onBeforeBegin
  )
}

export function getPendingDmDataForAccountToAddr(
  account: string,
  toAddr: string
) {
  const localDmDataByAddr =
    getLocalData(account, STORAGE_KEYS.PENDING_DATA) || {}
  if (!localDmDataByAddr) return null

  const localDmData = localDmDataByAddr[toAddr.toLocaleLowerCase()]
  if (!localDmData) return null

  return localDmData
}
export function getLocalDmDataForAccountToAddr(
  account: string,
  toAddr: string
): ChatMessageType[] | null {
  const localDmDataByAddr = getLocalData(account, STORAGE_KEYS.DM_DATA)
  if (!localDmDataByAddr) return null

  const localDmData = localDmDataByAddr[toAddr.toLocaleLowerCase()]
  if (!localDmData) return null

  return [...localDmData]
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
  newPendingMessage: ChatMessageType
) {
  const localDmData = getPendingDmDataForAccountToAddr(account, toAddr) || []
  const newDmData = [...localDmData, newPendingMessage]

  updatePendingDmDataForAccountToAddr(account, toAddr, newDmData)
}
export function updateLocalDmDataForAccountToAddr(
  account: string,
  toAddr: string,
  chatData: ChatMessageType[]
) {
  const dmDataObj = storage.get(STORAGE_KEYS.DM_DATA)
  const dmDataForAccount = dmDataObj?.[account.toLocaleLowerCase()] || {}

  const chatDataWithoutDuplicates: ChatMessageType[] = []
  const submittingMsgs: ChatMessageType[] = []

  chatData.forEach((msg) => {
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

  storage.set(STORAGE_KEYS.DM_DATA, {
    [account.toLocaleLowerCase()]: {
      ...dmDataForAccount,
      [toAddr.toLocaleLowerCase()]: [
        ...chatDataWithoutDuplicates.sort((a, b) => a.Id - b.Id),
        ...submittingMsgs,
      ],
    },
  })
}

export function addLocalDmDataForAccountToAddr(
  account: string,
  toAddr: string,
  newMessage: ChatMessageType
) {
  const localDmData = getLocalDmDataForAccountToAddr(account, toAddr) || []
  const newDmData = [...localDmData, newMessage]

  updateLocalDmDataForAccountToAddr(account, toAddr, newDmData)
}

export function getMessageToAddr(
  account: string,
  msg: ChatMessageType | InboxMessageType
) {
  return (
    msg &&
    (msg.fromaddr.toLocaleLowerCase() === account.toLocaleLowerCase()
      ? msg.toaddr
      : msg.fromaddr)
  )
}

interface InboxStore {
  [context: string]: {
    [from: string]: InboxMessageType
  }
}

export function getAllInboxDmMessagesForAccount(account: string) {
  const localInboxData = getInboxDmDataForAccount(account)
  const dms = localInboxData.dm
  return Object.values(dms)
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

export function addLocalInboxDataForAccount(
  account: string,
  newInboxMessage: InboxMessageType
) {
  const localInboxData = getInboxDmDataForAccount(account)
  const inboxDataForContext = localInboxData[newInboxMessage.context_type]

  const inboxMessages = Object.values(inboxDataForContext)

  let didUpdate = false
  const values = inboxMessages.map((item) => {
    if (
      getInboxFrom(account, item) === getInboxFrom(account, newInboxMessage)
    ) {
      didUpdate = true
      return newInboxMessage
    }

    return item
  })

  if (!didUpdate) {
    values.push(newInboxMessage)
  }

  values.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  const sortedNewInboxForContext: { [from: string]: InboxMessageType } = {}
  values.forEach((item) => {
    sortedNewInboxForContext[getInboxFrom(account, item)] = item
  })

  storage.set(STORAGE_KEYS.INBOX_DATA, {
    [account.toLocaleLowerCase()]: {
      ...localInboxData,
      [newInboxMessage.context_type]: sortedNewInboxForContext,
    },
  })
}

export function updateLocalInboxDataForAccount(
  account: string,
  inboxData: InboxMessageType[]
) {
  const localInboxData = getInboxDmDataForAccount(account)

  inboxData.forEach((item) => {
    const currentInbox = localInboxData[item.context_type]
    const currentMessages = Object.values(currentInbox)
    const newMessages = [...currentMessages, item].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    localInboxData[item.context_type] = newMessages.reduce(
      (acc, msg) => ({
        ...acc,
        [getInboxFrom(account, msg)]: msg,
      }),
      {}
    )
  })

  storage.set(STORAGE_KEYS.INBOX_DATA, {
    [account.toLocaleLowerCase()]: localInboxData,
  })
}

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
      for (let i = localData.length - 1; i >= 0; i--) {
        if (localData[i].timestamp && localData[i].Id !== -1) {
          lastTimeMsg = localData[i].timestamp
          break
        }
      }
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

    log('✅[GET][Chat items]: ', data)

    if (data.length === 0) {
      return { data: JSON.stringify({ messages: localData }) }
    }

    let dataToDecrypt: ChatMessageType[] = data

    let hasDecryptedMsgs
    const newLocalData = localData.map((msg) => {
      if (msg.encryptedMessage) {
        hasDecryptedMsgs = true
        let newDataMsg = msg

        data.forEach((dataMsg) => {
          if (dataMsg.message === msg.encryptedMessage) {
            newDataMsg = { ...newDataMsg, ...dataMsg }
            newDataMsg.message = msg.message
            delete newDataMsg.encryptedMessage

            dataToDecrypt = dataToDecrypt.filter(
              (item) => item.message !== dataMsg.message
            )
          }
        })

        return newDataMsg
      }

      return msg
    })

    if (hasDecryptedMsgs) {
      updateLocalDmDataForAccountToAddr(account, toAddr, newLocalData)
    }

    await decryptDMMessages(dataToDecrypt, account, dispatch)
  } catch (error) {
    log('🚨[GET][Chat items]:', error, queryArgs)
  }

  return { data: null }
}

export const dmApi = createApi({
  reducerPath: 'dmApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/`,
    prepareHeaders: (headers: Headers, { getState }) => {
      const account = selectAccount(getState())
      return prepareHeaderCredentials(headers, account)
    },
  }),

  endpoints: (builder) => ({
    getPfp: builder.query({
      query: (addr) => ({ url: `image/${addr}` }),
      transformResponse: async (response: any) => {
        log('✅[GET][Image FromAddr]:', response)

        const base64data = response[0]?.base64data

        return base64data || null
      },
      transformErrorResponse: createErrorResponse('Image'),
    }),

    getName: builder.query({
      query: (addr) => ({ url: `name/${addr}` }),
      transformResponse: async (response: any) => {
        log('✅[GET][Name]:', response)

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
      queryFn: async (queryArgs, api, extraOptions, fetchWithBQ) => {
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

        const pendingMsgs = getPendingDmDataForAccountToAddr(account, toAddr)

        if (!pendingMsgs || pendingMsgs.length === 0) {
          log('✅[GET][Updated Read Items]:')

          updateLocalDmDataForAccountToAddr(account, toAddr, newLocalData)
        }

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

          const newDecryptedMessages = data.filter((inboxItem) => {
            const currentInbox =
              storedInboxData[inboxItem.context_type][
                getInboxFrom(account, inboxItem)
              ]

            if (
              !currentInbox ||
              new Date(inboxItem.timestamp).getTime() >
                new Date(currentInbox.timestamp).getTime()
            ) {
              if (
                inboxItem.context_type === 'dm' &&
                inboxItem.encrypted_sym_lit_key !== ''
              ) {
                newDms.push(inboxItem)
                return false
              }

              return true
            }

            return false
          })

          // DM inbox messages -> go to the decryption queue
          if (newDms.length > 0) {
            log('✅[GET][New Inbox Encrypted DMs]:', newDms)

            await decryptInboxMessages(newDms, account, dispatch)
          }

          // Other inbox messages -> update local inbox data
          if (newDecryptedMessages.length > 0) {
            log(
              '✅[GET][New Plain Text Inbox Messages]:',
              newDecryptedMessages
            )

            updateLocalInboxDataForAccount(account, newDecryptedMessages)
            return { data: JSON.stringify(getInboxDmDataForAccount(account)) }
          }
        } catch (error) {
          log('🚨[GET][Inbox]:', error)
        }

        return { data: '' }
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
