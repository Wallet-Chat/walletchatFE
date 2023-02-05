export const isChromeExtension = () =>
	window.chrome && chrome.runtime && chrome.runtime.id
