import { useState } from 'react';

export function useHover() {
	const [hovering, setHovering] = useState(false);
	const onHoverProps = {
		onMouseEnter: () => setHovering(true),
		onMouseLeave: () => setHovering(false),
	};
	return [hovering, onHoverProps];
}
