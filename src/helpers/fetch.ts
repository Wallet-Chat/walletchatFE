const credentialsBody = { credentials: 'include' }

export const getFetchBody = { method: 'GET', ...credentialsBody }
export const postFetchBody = { method: 'POST', ...credentialsBody }

export function prepareHeaderCredentials(headers: Headers) {
  headers.set('Content-Type', 'application/json')
  headers.set('authorization', `Bearer ${localStorage.getItem('jwt')}`)
  return headers
}

export const getFetchOptions = () =>
({
  ...prepareHeaderCredentials(new Headers()),
  ...getFetchBody,
} as RequestInit)

export const postFetchOptions = () =>
({
  ...prepareHeaderCredentials(new Headers()),
  ...postFetchBody,
} as RequestInit)
