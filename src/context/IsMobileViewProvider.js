/* eslint-disable react/prop-types */
import React, { useState } from 'react';

const IsMobileViewContext = React.createContext();
export const useIsMobileView = () => React.useContext(IsMobileViewContext);

export function withIsMobileView(Component) {
	const IsMobileViewComponent = (props) => (
		<IsMobileViewContext.Consumer>
			{(contexts) => <Component {...props} {...contexts} />}
		</IsMobileViewContext.Consumer>
	);
	return IsMobileViewComponent;
}

const IsMobileViewProvider = ({ children }) => {
	const [size, setSize] = useState({
		width: window.innerWidth,
		height: window.innerHeight,
	});

	React.useEffect(() => {
		window.addEventListener('resize', handleWindowSizeChange);

		return () => window.removeEventListener('resize', handleWindowSizeChange);
	}, []);

	const handleWindowSizeChange = (event) => {
		setSize({ width: window.innerWidth, height: window.innerHeight });
	};

	const isMobileView = size.width <= 600;

	return (
		<IsMobileViewContext.Provider value={{ isMobileView }}>
			{children}
		</IsMobileViewContext.Provider>
	);
};

IsMobileViewProvider.PropTypes = {
	children: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.node),
		PropTypes.node,
	]).isRequired,
};

export default React.memo(IsMobileViewProvider);
