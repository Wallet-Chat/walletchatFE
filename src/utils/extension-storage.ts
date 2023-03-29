import browser from 'webextension-polyfill'

export type StoreKeys = 'widget-logins' | 'current-widget-origin'

const storage = {
  set: (key: StoreKeys, data: any) => {
    try {
      if (localStorage) {
        return localStorage.setItem(key, JSON.stringify(data))
      }

      browser.storage.local.set({ [key]: JSON.stringify(data) })
    } catch (error) {
      return error
    }
  },

  get: (key: StoreKeys) => {
    try {
      if (localStorage) {
        const data = localStorage.getItem(key)
        if (data) {
          return JSON.parse(data)
        }

        return null
      }

      browser.storage.local.get([key])
    } catch (error) {
      return error
    }
  },

  push: (key: StoreKeys, data: any) => {
    try {
      const currentData = localStorage.getItem(key)

      const parsedData = new Set(currentData ? JSON.parse(currentData) : [])
      parsedData.add(data)

      const strResult = JSON.stringify(Array.from(parsedData))

      if (localStorage) {
        return localStorage.setItem(key, strResult)
      }

      browser.storage.local.set({ [key]: strResult })
    } catch (error) {
      return error
    }
  },
}

export default storage
