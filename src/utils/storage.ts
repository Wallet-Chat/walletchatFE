const storage = {
	set: (key: string, data: any) => {
		try {
			if (localStorage) {
				return localStorage.setItem(key, JSON.stringify(data))
			}

			chrome.storage.local.set({ [key]: JSON.stringify(data) }, () => data)
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

			chrome.storage.local.get([key], (result: any) => result)
		} catch (error) {
			return error
		}
	},
}

export default storage
