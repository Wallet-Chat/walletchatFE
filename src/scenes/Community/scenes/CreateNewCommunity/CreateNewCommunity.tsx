import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
	Box,
	Button,
	Flex,
	FormControl,
	FormErrorMessage,
	FormLabel,
	Heading,
	HStack,
	Input,
	Spinner,
	Switch,
	Image,
	Text,
	Tooltip
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { isMobile } from 'react-device-detect'
import {
	IconArrowRight,
	IconBrandTwitter,
	IconChevronLeft,
} from '@tabler/icons'
import { useWallet } from '../../../../context/WalletProvider'
import * as ENV from '@/constants/env'
import { getJwtForAccount } from '@/helpers/jwt'
import { useAppSelector } from '@/hooks/useSelector'
import { selectAccount, selectIsAuthenticated } from '@/redux/reducers/account'
import { createResizedImage } from '@/utils/resizer'

const CreateNewCommunity = () => {
	const [name, setName] = useState<string>('')
	const [twitter, setTwitter] = useState<string>('')
	const [twitterActive, setTwitterActive] = useState(false)
	const [discord, setDiscord] = useState<string>('')
	const [discordActive, setDiscordActive] = useState(false)
	const account = useAppSelector((state) => selectAccount(state))
	const [isFetching, setIsFetching] = useState(false)
	const [file, setFile] = useState<Blob | MediaSource>()
	const [filePreview, setFilePreview] = useState('')
	const [resizedFile, setResizedFile] = useState<string>('');

	const resizeAndSetFile = (file: File) => {
		resizeFile(file) // Call the resize function
		.then((resizedData: any) => setResizedFile(resizedData));
	};

	let navigate = useNavigate()

	useEffect(() => {
		// create the preview
		if (file) {
		  const objectUrl = URL.createObjectURL(file)
		  setFilePreview(objectUrl)
		  // free memory whenever this component is unmounted
		  return () => URL.revokeObjectURL(objectUrl)
		}
	}, [file])

	const resizeFile = (file: File) =>
    new Promise((resolve) => {
      createResizedImage(
        file,
        64,
        64,
        'JPEG',
        100,
        0,
        (uri) => {
          resolve(uri)
        },
        'base64'
      )
    })

	const {
		handleSubmit,
		register,
		formState: { errors },
	} = useForm()

	const onSubmit = (values: any) => {
		let social = []
		if (values.twitter && twitterActive) {
			social.push({
				type: 'twitter',
				name: values.twitter,
			})
		}
		if (values.discord && discordActive) {
			social.push({
				type: 'discord',
				name: values.discord,
			})
		}

		setIsFetching(true)

		if (!ENV.REACT_APP_REST_API) {
			throw new Error('REST API url not in .env')
		}

		fetch(
			`${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/create_community`,
			{
				method: 'POST',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${getJwtForAccount(account)}`,
				},
				body: JSON.stringify({
					name: name,
					logo: resizedFile,
					social,
				}),
			}
		)
			.then((response) => response.json())
			.then((slug) => {
				console.log('✅[POST][Create Community]', slug)
				navigate(`/community/${slug}`)
			})
			.catch((error) => {
				console.error('🚨[POST][Create Community]:', error)
			})
			.finally(() => {
				setIsFetching(false)
			})
	}

	// const fetchTwitterUser = () => {
	//    if (twitter) {
	//       fetch(`https://api.twitter.com/1.1/users/show.json?screen_name=${twitter}`, {
	//          method: 'GET',
	//          headers: {
	//             Authorization: `Bearer ${process.env.TWITTER_BEARER}`,
	//          },
	//       })
	//          .then((response) => response.json())
	//          .then((result) => {
	//             console.log(`✅[GET][Twitter User]`, result)
	//          })
	//          .catch((error) => {
	//             console.log(`🚨[GET][NFT Contract][OpenSea]:`, error)
	//          })
	//    }
	// }

	return (
		<Box
			background='white'
			height={isMobile ? 'unset' : '100vh'}
			borderRight='1px solid var(--chakra-colors-lightgray-400)'
			width='360px'
			maxW='100%'
			overflowY='scroll'
			className='custom-scrollbar'
		>
			<Box px={5} pt={5} pb={3} pos='sticky' top='0'>
				<HStack mb={2}>
					<Button
						as={Link}
						to='/community'
						size='sm'
						p={1}
						variant='outline'
						_hover={{
							textDecoration: 'none',
							backgroundColor: 'var(--chakra-colors-lightgray-300)',
						}}
					>
						<IconChevronLeft />
					</Button>
					<Heading size='lg'>Create community</Heading>
				</HStack>
			</Box>
			<Box px={5} pt={5} pb={3} pos='sticky' top='0'>
				<form
					onSubmit={handleSubmit(onSubmit)}
					style={{ minHeight: '100vh' }}
				>
					<FormControl mb={5} isRequired>
						<FormLabel fontWeight='bold'>Name of community</FormLabel>
						<Input
							type='text'
							value={name}
							placeholder='WalletChat DAO'
							{...register('name', {
								required: true,
							})}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setName(e.target.value)
							}
						/>
						{errors?.name && errors?.name.type === 'validate' && (
							<FormErrorMessage>Name is not valid</FormErrorMessage>
						)}

						<FormLabel fontWeight='bold' mt={5}>Upload Image</FormLabel>
						<label>
							{file && (
							<Tooltip label='Change PFP'>
								<Image
									src={filePreview}
									alt=''
									maxW='80px'
									maxH='80px'
									border='2px solid #000'
									borderRadius='lg'
									cursor='pointer'
									_hover={{ borderColor: 'gray.400' }}
								/>
							</Tooltip>
							)}
							<input
								type='file'
								onChange={(e: any) => {
									const selectedFile = e.target.files[0];
									setFile(selectedFile);
									resizeAndSetFile(selectedFile);
								}}
								name='img'
								style={{
									position: file ? 'absolute' : 'relative',
									opacity: file ? '0' : '1',
								}}
							/>
						</label>
					</FormControl>
					<FormControl mb={5}>
						<FormLabel>
							<Flex justifyContent='space-between'>
								<HStack>
									<IconBrandTwitter fill='#1DA1F2' stroke={0} />
									<Text>Twitter</Text>
									<Text color='gray.400' d='inline' ml={1}>
										(optional.)
									</Text>
								</HStack>
								<Switch
									id='twitter-active'
									isChecked={twitterActive}
									onChange={(e) => setTwitterActive(!twitterActive)}
									colorScheme='twitter'
								/>
							</Flex>
						</FormLabel>
						<Flex alignItems='center'>
							<Box color='gray.600' fontSize='md' mr='1'>
								https://twitter.com/
							</Box>
							<Input
								type='text'
								value={twitter}
								placeholder='walletchat'
								flex='1'
								{...register('twitter', {
									required: false,
								})}
								color={twitterActive ? 'inherit' : 'gray.400'}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
									setTwitter(e.target.value)
									if (e.target.value === '') {
										setTwitterActive(false)
									} else if (!twitterActive) {
										setTwitterActive(true)
									}
								}}
								// onBlur={() => fetchTwitterUser()}
								className={!twitterActive ? 'disabled' : ''}
							/>
						</Flex>
					</FormControl>
					<FormControl mb={5}>
						<FormLabel>
							<Flex justifyContent='space-between'>
								<HStack>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										width='20'
										height='20'
										fill='#5865F2'
										viewBox='0 0 16 16'
									>
										<path d='M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.658 0 8.258 8.258 0 0 0-.412-.833.051.051 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059.051.051 0 0 0-.018-.011 8.875 8.875 0 0 1-1.248-.595.05.05 0 0 1-.02-.066.051.051 0 0 1 .015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 0 1 .053.007c.08.066.164.132.248.195a.051.051 0 0 1-.004.085 8.254 8.254 0 0 1-1.249.594.05.05 0 0 0-.03.03.052.052 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.235 13.235 0 0 0 4.001-2.02.049.049 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 0 0-.02-.019Zm-8.198 7.307c-.789 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612Zm5.316 0c-.788 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612Z' />
									</svg>
									<Text>Discord</Text>
									<Text color='gray.400' d='inline' ml={1}>
										(optional.)
									</Text>
								</HStack>
								<Switch
									id='discord-active'
									isChecked={discordActive}
									onChange={(e) => setDiscordActive(!discordActive)}
									colorScheme='twitter'
								/>
							</Flex>
						</FormLabel>
						<Flex alignItems='center'>
							<Box color='gray.600' fontSize='md' mr='1'>
								https://discord.gg/
							</Box>
							<Input
								type='text'
								value={discord}
								placeholder='walletchat'
								color={discordActive ? 'inherit' : 'gray.400'}
								flex='1'
								{...register('discord', {
									required: false,
								})}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
									setDiscord(e.target.value)
									if (e.target.value === '') {
										setDiscordActive(false)
									} else if (!discordActive) {
										setDiscordActive(true)
									}
								}}
							/>
						</Flex>
					</FormControl>
					<Box textAlign='right'>
						<Button variant='black' type='submit'>
							{isFetching ? (
								<Spinner />
							) : (
								<Flex>
									<Box>Create</Box>
									<Box ml={1}>
										<IconArrowRight size='16' />
									</Box>
								</Flex>
							)}
						</Button>
					</Box>
				</form>
			</Box>
		</Box>
	)
}

export default CreateNewCommunity
