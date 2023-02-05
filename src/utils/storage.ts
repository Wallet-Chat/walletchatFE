const storage = {
	set: async (key: string, data: any) => {
		if (localStorage) {
			return localStorage.setItem(key, JSON.stringify(data))
		} else {
			chrome.storage.local.set({ [key]: JSON.stringify(data) }, () => {
				return data
			})
		}
	},
	get: async (key: any) => {
		if (localStorage) {
			const data = localStorage.getItem(key)
			if (data) {
				return JSON.parse(data)
			}
			return null
		} else {
			chrome.storage.local.get([key], function (result) {
				return result
			})
		}
	},
}

export default storage
