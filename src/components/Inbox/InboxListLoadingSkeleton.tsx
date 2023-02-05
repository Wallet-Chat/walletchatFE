import {
	Box,
	Flex,
	SkeletonCircle,
	SkeletonText,
	Stack,
} from '@chakra-ui/react'

export default function InboxListLoadingSkeleton() {
	return (
		<Box background='white' height='100vh' width='100%'>
			<Box py={8} px={3} height='100vh'>
				{[...Array(5)].map((e, i) => (
					<Stack key={i}>
						<Flex
							py={6}
							px={3}
							bg='white'
							borderBottom='1px solid var(--chakra-colors-lightgray-300)'
						>
							<SkeletonCircle
								size='10'
								startColor='lightgray.200'
								endColor='lightgray.400'
								flexShrink={0}
								mr={4}
							/>
							<SkeletonText
								noOfLines={2}
								spacing='4'
								startColor='lightgray.200'
								endColor='lightgray.400'
								width='100%'
							/>
						</Flex>
					</Stack>
				))}
			</Box>
		</Box>
	)
}
