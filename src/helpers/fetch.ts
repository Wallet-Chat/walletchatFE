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
  ...getFetchBody,
  headers: prepareHeaderCredentials(new Headers()),
} as RequestInit)

export const postFetchOptions = (data: object) =>
({
  ...postFetchBody,
  headers: prepareHeaderCredentials(new Headers()),
  body: JSON.stringify(data),
} as RequestInit)
