const storage = {
	set: (key: string, data: any) => {
		try {
			if (localStorage) {
				return localStorage.setItem(key, JSON.stringify(data))
			}
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
		} catch (error) {
			return error
		}
	},
}

export default storage
