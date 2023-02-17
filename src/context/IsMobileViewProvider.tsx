import React from 'react'

function useIsMobileView() {
	const [size, setSize] = React.useState({
		width: window.innerWidth,
		height: window.innerHeight,
	})

	React.useEffect(() => {
		const handleWindowSizeChange = () =>
			setSize({ width: window.innerWidth, height: window.innerHeight })

		window.addEventListener('resize', handleWindowSizeChange)
		return () => window.removeEventListener('resize', handleWindowSizeChange)
	}, [])

	const isMobileView = size.width <= 600

	return isMobileView
}

export default useIsMobileView
