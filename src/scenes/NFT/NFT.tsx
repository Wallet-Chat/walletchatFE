import { Flex, Tag } from '@chakra-ui/react'
import { Route, Routes } from 'react-router'
import { useIsMobileView } from '../../context/IsMobileViewProvider'
import NFTByContract from './scenes/NFTByContract'
import NFTByContractAndId from './scenes/NFTByContractAndId'
import NFTInboxList from './scenes/NFTInboxList'
import POAPById from './scenes/POAPById'

const NFT = () => {
	const { isMobileView } = useIsMobileView()

	return (
		<Routes>
			<Route
				index
				element={
					<Flex>
						<NFTInboxList />
						{!isMobileView && (
							<Flex
								background='lightgray.200'
								flex='1'
								alignItems='center'
								justifyContent='center'
							>
								<Tag background='white'>Explore NFT groups</Tag>
							</Flex>
						)}
					</Flex>
				}
			/>
			<Route
				path='error'
				element={
					<Flex>
						<NFTInboxList />
						{!isMobileView && (
							<Flex
								background='lightgray.200'
								flex='1'
								alignItems='center'
								justifyContent='center'
							>
								<Tag background='white'>
									You must own at least one NFT from the Searched
									Collection
								</Tag>
							</Flex>
						)}
					</Flex>
				}
			/>
			<Route
				path='poap/:poapId'
				element={
					<Flex>
						{!isMobileView && <NFTInboxList />}
						<POAPById />
					</Flex>
				}
			/>
			<Route path=':chain/:nftContractAddr'>
				<Route
					index
					element={
						<Flex>
							{!isMobileView && <NFTInboxList />}
							<NFTByContract />
						</Flex>
					}
				/>
				<Route
					path=':nftId'
					element={
						<Flex>
							{!isMobileView && <NFTInboxList />}
							<NFTByContractAndId />
						</Flex>
					}
				/>
			</Route>
		</Routes>
	)
}

export default NFT
