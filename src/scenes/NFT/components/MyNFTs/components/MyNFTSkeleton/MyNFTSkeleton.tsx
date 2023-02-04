import { Box, Flex, Skeleton, Stack } from '@chakra-ui/react';

export default function InboxSkeleton() {
	return (
		<Box background='white' width='100%'>
			<Flex flexDirection={['column', 'column', 'row']} flexWrap='wrap'>
				{[...Array(12)].map((e, i) => (
					<Stack key={i}>
						<Flex
							bg='white'
							border='1px solid var(--chakra-colors-lightgray-300)'
							borderRadius='md'
							mr={4}
							mb={4}
						>
							<Skeleton
								width='100px'
								height='100%'
								startColor='lightgray.200'
								endColor='lightgray.400'
								flexShrink={0}
								mr={4}
							/>
							<Stack width={['100%', '100%', '200px']} py={4} px={2}>
								<Skeleton
									height='16px'
									startColor='lightgray.200'
									endColor='lightgray.400'
								/>
								<Skeleton
									height='16px'
									startColor='lightgray.200'
									endColor='lightgray.400'
								/>
								<Skeleton
									height='24px'
									width='75%'
									startColor='lightgray.200'
									endColor='lightgray.400'
								/>
							</Stack>
						</Flex>
					</Stack>
				))}
			</Flex>
		</Box>
	);
}
