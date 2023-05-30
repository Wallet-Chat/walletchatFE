import storage from '@/utils/extension-storage'

export function storeJwtForAccount(account: string, jwt: string) {
  const currentJwtByAccount = storage.get('jwt') || {}
  const newJwtByAccount = {
    ...currentJwtByAccount,
    [account.toLocaleLowerCase()]: jwt,
  }

  storage.set('jwt', newJwtByAccount)
}

export function getJwtForAccount(account: string) {
  if (account === undefined) {
    return null
  }
  const currentJwtByAccount = storage.get('jwt') || {}
  const currentJwt = currentJwtByAccount[account.toLocaleLowerCase()]

  return currentJwt || null
}

export function getHasJwtForAccount(account: string) {
  return Boolean(getJwtForAccount(account))
}

export function parseJwt(token: string) {
  const base64Url = token.split('.')[1]
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split('')
      .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join('')
  )
  return JSON.parse(jsonPayload)
}
