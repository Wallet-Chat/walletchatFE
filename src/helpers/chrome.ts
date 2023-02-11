export const isChromeExtension = () =>
	window.chrome && chrome.runtime && chrome.runtime.id

export const getCurrentTabUrl = (
	callback: (url: string | undefined) => void
): void => {
	const queryInfo = { active: true, lastFocusedWindow: true }

	chrome.tabs &&
		chrome.tabs.query(queryInfo, (tabs) => {
			callback(tabs[0].url)
		})
}

export const getCurrentTabUID = (
	callback: (url: number | undefined) => void
): void => {
	const queryInfo = { active: true, lastFocusedWindow: true }

	chrome.tabs &&
		chrome.tabs.query(queryInfo, (tabs) => {
			callback(tabs[0].id)
		})
}
