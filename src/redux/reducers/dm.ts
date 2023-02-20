import { createSlice } from '@reduxjs/toolkit'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { createErrorResponse } from '@/redux/reducers/helpers'
import { prepareHeaderCredentials } from '@/helpers/fetch'
import * as ENV from '@/constants/env'
import { MessageType } from '@/types/Message'
import storage from '@/utils/storage'
import lit from '@/utils/lit'

const DM_DATA_LOCAL_STORAGE_KEY = 'dmData'
const GETALL_CHATITEMS_ENDPOINT_NAME = 'getChatData'

const getAllChatItemsQueryArgs = (queryArgs: any) => {
  const serializedQueryArgs = `${GETALL_CHATITEMS_ENDPOINT_NAME}(${JSON.stringify(
    queryArgs
  )})`

  return serializedQueryArgs
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

function setLocalDmDataForAccountToAddr(
  account: string,
  toAddr: string,
  chatData: MessageType[]
) {
  const dmDataObj = storage.get(DM_DATA_LOCAL_STORAGE_KEY)
  const dmDataForAccount = dmDataObj?.[account.toLocaleLowerCase()] || {}
  const dmDataForAccountToAddr =
    dmDataForAccount?.[toAddr.toLocaleLowerCase()] || []

  storage.set(DM_DATA_LOCAL_STORAGE_KEY, {
    [account.toLocaleLowerCase()]: {
      ...dmDataForAccount,
      [toAddr.toLocaleLowerCase()]: [...dmDataForAccountToAddr, ...chatData],
    },
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

    [GETALL_CHATITEMS_ENDPOINT_NAME]: builder.query({
      serializeQueryArgs: ({ queryArgs }) =>
        getAllChatItemsQueryArgs(queryArgs),

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

          // START LIT ENCRYPTION
          dispatch(
            addDmDataEnc({ account, toAddr, data: JSON.stringify(data) })
          )

          const replica = JSON.parse(JSON.stringify(data))
          const pendingMsgs: Promise<{ decryptedFile: any }>[] = []

          console.log('✅[POST][Decrypt Messages initiated]')

          // Get data from LIT and replace the message with the decrypted text
          for (let i = 0; i < replica.length; i += 1) {
            if (replica[i].encrypted_sym_lit_key) {
              // only needed for mixed DB with plain and encrypted data
              const accessControlConditions = JSON.parse(
                replica[i].lit_access_conditions
              )

              // after change to include SC conditions, we had to change LIT accessControlConditions to UnifiedAccessControlConditions
              // this is done to support legacy messages (new databases wouldn't need this)
              if (
                String(replica[i].lit_access_conditions).includes('evmBasic')
              ) {
                const rawmsg = lit.decryptString(
                  lit.b64toBlob(replica[i].message),
                  replica[i].encrypted_sym_lit_key,
                  accessControlConditions
                )
                pendingMsgs[i] = rawmsg
              } else {
                const rawmsg = lit.decryptStringOrig(
                  lit.b64toBlob(replica[i].message),
                  replica[i].encrypted_sym_lit_key,
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
                replica[i].message = rawmsg.decryptedFile.toString()
              }
            })
          })
          // END LIT ENCRYPTION

          const allChats = localData.concat(replica)
          const allChatsValue = JSON.stringify(allChats)

          // store so when user switches views, data is ready
          setLocalDmDataForAccountToAddr(account, toAddr, allChats)

          console.log('✅[GET][Chats decrypted]')

          return { data: allChatsValue }
        } catch (error) {
          console.error('🚨[GET][Chat items]:', error)
          return { data: '' }
        }
      },
    }),
  }),
})

export const { useGetPfpQuery, useGetNameQuery, useGetChatDataQuery } = dmApi

export default dmSlice.reducer
