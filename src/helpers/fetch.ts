const createFetchCredentials = () => ({
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('jwt')}`,
  },
})

export const getFetchOptions: any = () => ({
  method: 'GET',
  ...createFetchCredentials(),
})

export const postFetchOptions: any = () => ({
  method: 'POST',
  ...createFetchCredentials(),
})
