import styled from 'styled-components'

interface BlockieWrapperProps {
	width?: string | null
	height?: string | null
}

export const BlockieWrapper = styled.div<BlockieWrapperProps>`
	position: relative;
	width: ${(props) => (props.width ? props.width : 'auto')};
	height: ${(props) => (props.height ? props.height : 'auto')};
	border-radius: var(--chakra-radii-xl);
	overflow: hidden;
`
