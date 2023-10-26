const storage = {
	set: (key: string, data: any) => {
		try {
			console.log("localStorage:  5")
			if (localStorage) {
				return localStorage.setItem(key, JSON.stringify(data))
			}
		} catch (error) {
			return error
		}
	},

	get: (key: any) => {
		try {
			console.log("localStorage:  6")
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
