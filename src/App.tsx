import { useEffect } from 'react'
import { IconX } from '@tabler/icons'
import { Route, Routes, Navigate, useLocation } from 'react-router-dom'
import {
	Button,
	Box,
	Flex,
	Image,
	Heading,
	Spinner,
	Alert,
	Tag,
} from '@chakra-ui/react'
import { isMobile } from 'react-device-detect'

import logoThumb from './images/logo-thumb.svg'
import './App.scss'
import NFT from './scenes/NFT'
import Sidebar from './components/Sidebar/Sidebar'
import { useWallet } from './context/WalletProvider'
import { useIsMobileView } from './context/IsMobileViewProvider'
import EnterName from './scenes/Me/scenes/EnterName'
import ChangeName from './scenes/Me/scenes/ChangeName'
import EnterEmail from './scenes/Me/scenes/EnterEmail'
import ChangeEmail from './scenes/Me/scenes/ChangeEmail'
import VerifyEmail from './scenes/Me/scenes/VerifyEmail'
import Community from './scenes/Community'
import { isChromeExtension } from './helpers/chrome'
import DM from './scenes/DM'

export const App = () => {
	const location = useLocation()

	const {
		appLoading,
		isAuthenticated,
		connectWallet,
		name,
		isInitializing,
		account,
		web3,
		error,
		setRedirectUrl,
		btnClicks,
		setBtnClicks,
	} = useWallet()
	useEffect(() => {
		const currentPath = location.pathname
		console.log(`currentPath: ${currentPath}`)
		setRedirectUrl(currentPath)
	}, [location])

	const { isMobileView } = useIsMobileView()

	const closeBtn = (
		<Flex textAlign='right' position='fixed' top={0} right={0}>
			<Button
				borderBottomLeftRadius='lg'
				borderBottomRightRadius='lg'
				borderTopLeftRadius={0}
				borderTopRightRadius={0}
				background='lightgray.500'
				py={0}
				px={1}
				size='lg'
				height='24px'
				onClick={() => window.close()}
			>
				<IconX size={18} color='var(--chakra-colors-darkgray-700)' />
			</Button>
		</Flex>
	)

	if (appLoading || !isAuthenticated) {
		return (
			<Flex
				p={2}
				flexFlow='column'
				position='absolute'
				top='15px'
				bottom='15px'
				left='10px'
				right='10px'
			>
				{/* <Header /> */}
				{isChromeExtension() && closeBtn}
				{appLoading ? (
					<Flex
						w='100vw'
						h='100vh'
						justifyContent='center'
						alignItems='center'
					>
						<Spinner />
					</Flex>
				) : (
					<Box
						borderRadius='lg'
						className='bg-pattern'
						padding='70px 40px'
						flexGrow={1}
					>
						<Image src={logoThumb} mb={5} width='40px' />
						<Heading size='2xl' mb={8}>
							Login to start chatting
						</Heading>
						<Button
							variant='black'
							onClick={() => {
								setBtnClicks(btnClicks + 1)
								connectWallet()
							}}
							size='lg'
						>
							Sign in using wallet
						</Button>
						{btnClicks > 0 && !error && (
							<Alert status='success' variant='solid' mt={4}>
								Check the your wallet for signature prompt to continue
							</Alert>
						)}
						{error && (
							<Alert status='error' variant='solid' mt={4}>
								{error}
							</Alert>
						)}
					</Box>
				)}
			</Flex>
		)
	} else if (isAuthenticated && name === null) {
		return (
			<Box>
				<Flex>
					{isChromeExtension() && closeBtn}
					<Sidebar />
					{isInitializing ? (
						<Flex
							justifyContent='center'
							alignItems='center'
							height='100vh'
							width='100%'
						>
							<Spinner />
						</Flex>
					) : (
						<EnterName account={account} />
					)}
				</Flex>
			</Box>
		)
	} else {
		return (
			<Box>
				<Flex
					flexDirection={
						isMobile && !isChromeExtension() ? 'column' : 'row'
					}
					minHeight={isMobile ? '100vh' : 'unset'}
				>
					{isChromeExtension() && closeBtn}
					<Sidebar />
					<Box flex='1' overflow='hidden' minWidth='1px'>
						<Routes>
							<Route
								path='/me/enter-email'
								element={<EnterEmail account={account} />}
							/>
							<Route path='/me/change-name' element={<ChangeName />} />
							<Route
								path='/me/change-email'
								element={<ChangeEmail account={account} />}
							/>
							<Route
								path='/me/verify-email'
								element={<VerifyEmail account={account} />}
							/>

							<Route path='dm/*' element={<DM />} />
							<Route path='nft/*' element={<NFT />} />
							<Route path='community/*' element={<Community />} />
							<Route path='/' element={<Navigate to='/dm' replace />} />
							<Route
								path='/index.html'
								element={<Navigate to='/dm' replace />}
							/>
						</Routes>
					</Box>
				</Flex>
			</Box>
		)
	}
}
