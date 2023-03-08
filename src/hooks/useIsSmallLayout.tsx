import { getIsWidgetContext } from '@/utils/context'
import React from 'react'
import { isMobile } from 'react-device-detect'

function useIsSmallLayout() {
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
  const isSmallLayout = isMobileView || isMobile || getIsWidgetContext()

	return isSmallLayout
}

export default useIsSmallLayout
