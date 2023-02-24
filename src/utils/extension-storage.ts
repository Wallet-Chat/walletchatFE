import browser from 'webextension-polyfill'

const storage = {
	set: (key: string, data: any) => {
		try {
			if (localStorage) {
				return localStorage.setItem(key, JSON.stringify(data))
			}

			browser.storage.local.set({ [key]: JSON.stringify(data) })
		} catch (error) {
			return error
		}
	},

	get: (key: any) => {
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
}

export default storage
