import styled from 'styled-components'

export const InboxItemWrapper = styled.button`
	display: block;
	width: 100%;
	padding: var(--chakra-space-3) var(--chakra-space-5);
	background: #fff;
	text-align: left;
	color: var(--chakra-colors-darkgray-900);

	&:not(:last-child) {
		border-bottom: 1px solid var(--chakra-colors-lightgray-300);
	}

	&:hover {
		background: var(--chakra-colors-lightgray-300);
	}

	.timestamp {
		display: block;
		color: var(--chakra-colors-darkgray-300);
		font-size: var(--chakra-fontSizes-md);
		user-select: none;
		line-height: 1.7;
	}
`

export const InboxItemNotificationCount = styled.div`
	display: inline-block;
	background: var(--chakra-colors-information-400);
	border-radius: var(--chakra-radii-md);
	height: 18px;
	color: #fff;
	font-weight: 700;
	font-size: 90%;
	text-align: center;
	margin-left: auto;
	padding: 0 var(--chakra-space-2);
`

export const InboxItemRecipientAddress = styled.div`
	font-size: var(--chakra-fontSizes-lg);
	font-weight: bold;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
`

export const InboxItemChainImage = styled.div`
	position: absolute;
	bottom: 0;
	right: 0;
	width: 1rem;
	height: 1rem;
	background: rgba(255, 255, 255, 0.8);
	padding: var(--chakra-space-0-5);
	border-radius: var(--chakra-radii-sm);
`
