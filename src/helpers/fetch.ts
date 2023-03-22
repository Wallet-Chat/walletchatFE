import { getJwtForAccount } from './jwt'

const credentialsBody = { credentials: 'include' }

export const getFetchBody = { method: 'GET', ...credentialsBody }
export const postFetchBody = { method: 'POST', ...credentialsBody }

export function prepareHeaderCredentials(headers: Headers, account: string) {
  headers.set('Content-Type', 'application/json')
  headers.set('authorization', `Bearer ${getJwtForAccount(account)}`)
  return headers
}

export const getFetchOptions = (account: string) =>
  ({
    ...getFetchBody,
    headers: prepareHeaderCredentials(new Headers(), account),
  } as RequestInit)

export const postFetchOptions = (data: object, account: string) =>
  ({
    ...postFetchBody,
    headers: prepareHeaderCredentials(new Headers(), account),
    body: JSON.stringify(data),
  } as RequestInit)
