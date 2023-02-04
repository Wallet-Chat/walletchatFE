import {
	Box,
	FormControl,
	Button,
	Flex,
	Text,
	Image,
	Spinner,
	Link as CLink,
} from '@chakra-ui/react';
import {
	KeyboardEvent,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { useParams, Link } from 'react-router-dom';
import Web3 from 'web3';
import {
	IconArrowLeft,
	IconCheck,
	IconCopy,
	IconExternalLink,
	IconSend,
} from '@tabler/icons';
import Blockies from 'react-blockies';
import TextareaAutosize from 'react-textarea-autosize';

import { MessageType, MessageUIType } from '../../../../types/Message';
import { truncateAddress } from '../../../../helpers/truncateString';
import { isMobile } from 'react-device-detect';
import equal from 'fast-deep-equal/es6';
import { DottedBackground } from '../../../../styled/DottedBackground';
import { BlockieWrapper } from '../../../../styled/BlockieWrapper';
import ChatMessage from '../../../../components/Chat/ChatMessage';
// import { getIpfsData, postIpfsData } from '../../services/ipfs'
// import EthCrypto, { Encrypted } from 'eth-crypto'
//import sigUtil from 'eth-sig-util'
import lit from '../../../../utils/lit';
import ScrollToBottom from 'react-scroll-to-bottom';
import { useWallet } from '../../../../context/WalletProvider';

const DMByAddress = () => {
	let { address: toAddr = '' } = useParams();
	let { account, web3, isAuthenticated } = useWallet();

	// const [ens, setEns] = useState<string>('')
	const [name, setName] = useState<string>('');
	const [pfpDataToAddr, setPfpDataToAddr] = useState<string>();
	const [pfpDataFromAddr, setPfpDataFromAddr] = useState<string>();
	const [prevAddr, setPrevAddr] = useState<string>('');
	const [sentMsg, setSentMsg] = useState(false);
	const [loadedMsgs, setLoadedMsgs] = useState<MessageUIType[]>([]);
	const [msgInput, setMsgInput] = useState<string>('');
	const [isSendingMessage, setIsSendingMessage] = useState(false);
	const [copiedAddr, setCopiedAddr] = useState(false);
	const [chatData, setChatData] = useState<MessageType[]>(
		new Array<MessageType>()
	);
	const [encryptedChatData, setEncChatData] = useState<MessageType[]>(
		new Array<MessageType>()
	);
	const [isFetchingChatData, setIsFetchingChatData] = useState(false);

	const timerRef: { current: NodeJS.Timeout | null } = useRef(null);

	const scrollToBottomRef = useRef<HTMLDivElement>(null);

	let semaphore = false;
	//let isFetchingDataFirstTime = true;

	useEffect(() => {
		console.log('useEffect scroll');
		// Scroll to bottom of chat if user sends a message
		if (scrollToBottomRef?.current) {
			const { scrollTop, scrollHeight, clientHeight } =
				scrollToBottomRef.current;
			if (scrollTop + clientHeight === scrollHeight) {
				console.log(
					'reached bottom: st, ch, SH',
					scrollTop,
					clientHeight,
					scrollHeight
				);
				scrollToBottomRef.current.scrollIntoView();
			}

			// if(scrollToBottomRef.current.scrollHeight - scrollToBottomRef.current.scrollTop === scrollToBottomRef.current.clientHeight) {
			//    console.log('At bottom, scrolling...')
			//    scrollToBottomRef.current.scrollIntoView()
			// }
			//setSentMsg(false)
		}
	}, [loadedMsgs]);

	useEffect(() => {
		if (!pfpDataFromAddr) {
			fetch(
				` ${process.env.REACT_APP_REST_API}/${process.env.REACT_APP_API_VERSION}/image/${account}`,
				{
					method: 'GET',
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${localStorage.getItem('jwt')}`,
					},
				}
			)
				.then((response) => response.json())
				.then((response) => {
					console.log('✅[GET][Image FromAddr]:', account, response);
					if (response[0]?.base64data) {
						setPfpDataFromAddr(response[0].base64data);
						localStorage['pfpData_' + account] = response[0].base64data;
					} else {
						setPfpDataFromAddr('');
						console.log('cleared from PFP');
					}
				})
				.catch((error) => {
					console.error('🚨[GET][Image FromAddr]:', error);
				});
		}

		if (toAddr) {
			if (localStorage.getItem("'pfpData_' + account") === null) {
				fetch(
					` ${process.env.REACT_APP_REST_API}/${process.env.REACT_APP_API_VERSION}/image/${toAddr}`,
					{
						method: 'GET',
						credentials: 'include',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${localStorage.getItem('jwt')}`,
						},
					}
				)
					.then((response) => response.json())
					.then((response) => {
						console.log('✅[GET][Image ToAddr]:', toAddr, response);
						if (response[0]?.base64data) {
							setPfpDataToAddr(response[0].base64data);
							localStorage['pfpData_' + toAddr] = response[0].base64data;
						} else {
							setPfpDataToAddr('');
							console.log('cleared to PFP');
						}
					})
					.catch((error) => {
						console.error('🚨[GET][Image]:', error);
					});
			}

			//load chat data from localStorage to chatData
			setChatData(
				localStorage['dmData_' + account + '_' + toAddr.toLowerCase()]
					? JSON.parse(
							localStorage['dmData_' + account + '_' + toAddr.toLowerCase()]
					  )
					: []
			);
			setEncChatData(
				localStorage['dmDataEnc_' + account + '_' + toAddr.toLowerCase()]
					? JSON.parse(
							localStorage['dmDataEnc_' + account + '_' + toAddr.toLowerCase()]
					  )
					: []
			);

			fetch(
				` ${process.env.REACT_APP_REST_API}/${process.env.REACT_APP_API_VERSION}/name/${toAddr}`,
				{
					method: 'GET',
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${localStorage.getItem('jwt')}`,
					},
				}
			)
				.then((response) => response.json())
				.then((response) => {
					console.log('✅[GET][Name]:', response);
					if (response[0]?.name) setName(response[0].name);
					else setName('User Not Yet Joined');
				})
				.catch((error) => {
					console.error('🚨[GET][Name]:', error);
				});
		}
	}, [toAddr]);

	const getChatData = useCallback(() => {
		// GET request to get off-chain data for RX user
		if (!process.env.REACT_APP_REST_API) {
			console.log('REST API url not in .env', process.env);
			return;
		}
		if (!account) {
			console.log('No account connected');
			return;
		}
		if (!isAuthenticated) {
			console.log('Not authenticated');
			return;
		}
		if (!toAddr) {
			console.log('Recipient address is not available');
			return;
		}
		if (semaphore) {
			console.log(
				'preventing re-entrant calls if fetching is slow (happens at statup with decryption sometimes)'
			);
			return;
		}
		setIsFetchingChatData(true);

		//console.log(`getall_chatitems/${account}/${toAddr} *prev addr: `, prevAddr)
		if (toAddr != prevAddr) {
			setPrevAddr(toAddr);
			setIsFetchingChatData(false);
			const temp = [] as MessageUIType[];
			setLoadedMsgs(temp);
			setPfpDataToAddr('');
			return; //skip the account transition glitch
		}
		setPrevAddr(toAddr);
		semaphore = true;

		let lastTimeMsg = '2006-01-02T15:04:05.000Z';
		if (chatData.length > 0) {
			lastTimeMsg = chatData[chatData.length - 1].timestamp;
		}
		lastTimeMsg = encodeURIComponent(lastTimeMsg);

		fetch(
			` ${process.env.REACT_APP_REST_API}/${process.env.REACT_APP_API_VERSION}/getall_chatitems/${account}/${toAddr}/${lastTimeMsg}`,
			{
				method: 'GET',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${localStorage.getItem('jwt')}`,
				},
			}
		)
			.then((response) => response.json())
			.then(async (data: MessageType[]) => {
				if (chatData.length > 0) {
					if (data.length > 0) {
						//START LIT ENCRYPTION
						localStorage['dmDataEnc_' + account + '_' + toAddr.toLowerCase()] =
							JSON.stringify(encryptedChatData.concat(data));
						setEncChatData(encryptedChatData.concat(data));

						const replica = JSON.parse(JSON.stringify(data));
						// Get data from LIT and replace the message with the decrypted text
						for (let i = 0; i < replica.length; i++) {
							if (replica[i].encrypted_sym_lit_key) {
								//only needed for mixed DB with plain and encrypted data
								const _accessControlConditions = JSON.parse(
									replica[i].lit_access_conditions
								);

								//console.log('✅[POST][Decrypt Message]:', replica[i], replica[i].encrypted_sym_lit_key, _accessControlConditions)
								const rawmsg = await lit.decryptString(
									lit.b64toBlob(replica[i].message),
									replica[i].encrypted_sym_lit_key,
									_accessControlConditions
								);
								replica[i].message = rawmsg.decryptedFile.toString();
							}
						}
						//END LIT ENCRYPTION
						let allChats = chatData.concat(replica);
						setChatData(allChats);
						localStorage['dmData_' + account + '_' + toAddr.toLowerCase()] =
							JSON.stringify(allChats); //store so when user switches views, data is ready
						console.log('✅[GET][New Chat items]:', data);
					}
				} else {
					if (equal(data, encryptedChatData) === false) {
						console.log('✅[GET][Chat items]:', data);
						//START LIT ENCRYPTION
						localStorage['dmDataEnc_' + account + '_' + toAddr.toLowerCase()] =
							JSON.stringify(data);
						setEncChatData(data);

						const replica = JSON.parse(JSON.stringify(data));
						// Get data from LIT and replace the message with the decrypted text
						for (let i = 0; i < replica.length; i++) {
							if (replica[i].encrypted_sym_lit_key) {
								//only needed for mixed DB with plain and encrypted data
								const _accessControlConditions = JSON.parse(
									replica[i].lit_access_conditions
								);

								//console.log('✅[POST][Decrypt Message]:', replica[i], replica[i].encrypted_sym_lit_key, _accessControlConditions)
								const rawmsg = await lit.decryptString(
									lit.b64toBlob(replica[i].message),
									replica[i].encrypted_sym_lit_key,
									_accessControlConditions
								);
								replica[i].message = rawmsg.decryptedFile.toString();
							}
						}
						setChatData(replica);
						localStorage['dmData_' + account + '_' + toAddr.toLowerCase()] =
							JSON.stringify(replica);
						//END LIT ENCRYPTION
						//setChatData(data)  //use when not using encryption
					}
				}
				setIsFetchingChatData(false);
				semaphore = false;
			})
			.catch((error) => {
				console.error('🚨[GET][Chat items]:', error);
				setIsFetchingChatData(false);
				semaphore = false;
			});
		//since we are only loading new messages, we need to update read status async and even after we aren't get new messages
		//in the case its a while before a user reads the message
		fetch(
			` ${process.env.REACT_APP_REST_API}/${process.env.REACT_APP_API_VERSION}/getread_chatitems/${account}/${toAddr}`,
			{
				method: 'GET',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${localStorage.getItem('jwt')}`,
				},
			}
		)
			.then((response) => response.json())
			.then(async (data: Int32Array[]) => {
				let localRead =
					localStorage['dmReadIDs_' + account + '_' + toAddr.toLowerCase()];
				if (localRead != data) {
					if (data.length > 0) {
						let localData =
							localStorage['dmData_' + account + '_' + toAddr.toLowerCase()];
						if (localData) {
							localData = JSON.parse(localData);
							for (let j = 0; j < localData.length; j++) {
								for (let i = 0; i < data.length; i++) {
									if (localData[j].Id == data[i]) {
										localData[j].read = true;
										break;
									}
								}
							}
							setChatData(localData);
							localStorage[
								'dmReadIDs_' + account + '_' + toAddr.toLowerCase()
							] = data;
							localStorage['dmData_' + account + '_' + toAddr.toLowerCase()] =
								JSON.stringify(localData); //store so when user switches views, data is ready
							console.log('✅[GET][Updated Read Items]:', data);
						}
					}
				}
			})
			.catch((error) => {
				console.error('🚨[GET][Update Read items]:', error);
				setIsFetchingChatData(false);
			});
	}, [account, chatData, isAuthenticated, toAddr]);

	useEffect(() => {
		getChatData();
	}, [isAuthenticated, account, toAddr, getChatData]);

	useEffect(() => {
		// Interval needs to reset else getChatData will use old state
		const interval = setInterval(() => {
			getChatData();
		}, 5000); // every 5s

		return () => clearInterval(interval);
	}, [isAuthenticated, account, toAddr, chatData, getChatData]);

	useEffect(() => {
		const toAddToUI = [] as MessageUIType[];

		for (let i = 0; i < chatData.length; i++) {
			if (
				chatData[i] &&
				chatData[i].toaddr &&
				chatData[i].toaddr.toLowerCase() === account.toLowerCase()
			) {
				toAddToUI.push({
					sender_name: chatData[i].sender_name,
					message: chatData[i].message,
					fromAddr: chatData[i].fromaddr,
					toAddr: chatData[i].toaddr,
					timestamp: chatData[i].timestamp,
					read: chatData[i].read,
					id: chatData[i].id,
					position: 'left',
					isFetching: false,
					nftAddr: chatData[i].nftaddr,
					nftId: chatData[i].nftid,
				});
			} else if (
				chatData[i] &&
				chatData[i].toaddr &&
				chatData[i].fromaddr.toLowerCase() === account.toLowerCase()
			) {
				toAddToUI.push({
					sender_name: chatData[i].sender_name,
					message: chatData[i].message,
					fromAddr: chatData[i].fromaddr,
					toAddr: chatData[i].toaddr,
					timestamp: chatData[i].timestamp,
					read: chatData[i].read,
					id: chatData[i].id,
					position: 'right',
					isFetching: false,
					nftAddr: chatData[i].nftaddr,
					nftId: chatData[i].nftid,
				});
			}
		}
		if (!equal(toAddToUI, chatData)) {
			setLoadedMsgs(toAddToUI);
		}
	}, [chatData, account]);

	const handleKeyPress = (event: KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === 'Enter') {
			event.preventDefault();
			sendMessage();
		}
	};

	const copyToClipboard = useCallback(() => {
		if (toAddr) {
			console.log('Copy to clipboard', toAddr);
			let textField = document.createElement('textarea');
			textField.innerText = toAddr;
			document.body.appendChild(textField);
			textField.select();
			document.execCommand('copy');
			textField.focus();
			textField.remove();
			setCopiedAddr(true);

			timerRef?.current && window.clearTimeout(timerRef.current);
			timerRef.current = setTimeout(() => {
				setCopiedAddr(false);
			}, 3000);
		}
	}, [toAddr]);

	const addMessageToUI = useCallback(
		(
			message: string,
			fromAddr: string,
			toAddr: string,
			timestamp: string,
			read: boolean,
			position: string,
			isFetching: boolean,
			nftAddr: string | null,
			nftId: string | null
		) => {
			console.log(`Add message to UI: ${message}`);

			const newMsg: MessageUIType = {
				message,
				fromAddr,
				toAddr,
				timestamp,
				read,
				position,
				isFetching,
				nftAddr,
				nftId,
			};
			let newLoadedMsgs: MessageUIType[] = [...loadedMsgs]; // copy the old array
			newLoadedMsgs.push(newMsg);
			setLoadedMsgs(newLoadedMsgs);
		},
		[loadedMsgs]
	);

	const sendMessage = async () => {
		setSentMsg(true);
		console.log('sendMessage');
		if (msgInput.length <= 0) return;

		// Make a copy and clear input field
		const msgInputCopy = (' ' + msgInput).slice(1);
		setMsgInput('');

		const timestamp = new Date();

		const latestLoadedMsgs = JSON.parse(JSON.stringify(loadedMsgs));

		let data = {
			message: msgInputCopy,
			fromAddr: account.toLocaleLowerCase(),
			toAddr: toAddr.toLocaleLowerCase(),
			timestamp,
			nftid: '0',
			encrypted_sym_lit_key: '',
			lit_access_conditions: '',
			read: false,
		};

		addMessageToUI(
			msgInputCopy,
			account,
			toAddr,
			timestamp.toString(),
			false,
			'right',
			true,
			null,
			null
		);

		//data.message = msgInputCopy
		const _accessControlConditions = [
			{
				contractAddress: '',
				standardContractType: '',
				chain: 'ethereum',
				method: '',
				parameters: [':userAddress'],
				returnValueTest: {
					comparator: '=',
					value: data.toAddr,
				},
			},
			{ operator: 'or' },
			{
				contractAddress: '',
				standardContractType: '',
				chain: 'ethereum',
				method: '',
				parameters: [':userAddress'],
				returnValueTest: {
					comparator: '=',
					value: data.fromAddr,
				},
			},
		];

		console.log(
			'✅[POST][Encrypting Message]:',
			msgInputCopy,
			_accessControlConditions
		);
		const encrypted = await lit.encryptString(
			msgInputCopy,
			_accessControlConditions
		);
		data.message = await lit.blobToB64(encrypted.encryptedFile);
		data.encrypted_sym_lit_key = encrypted.encryptedSymmetricKey;
		data.lit_access_conditions = JSON.stringify(_accessControlConditions);
		console.log('✅[POST][Encrypted Message]:', data);

		setIsSendingMessage(true);
		fetch(
			` ${process.env.REACT_APP_REST_API}/${process.env.REACT_APP_API_VERSION}/create_chatitem`,
			{
				method: 'POST',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${localStorage.getItem('jwt')}`,
				},
				body: JSON.stringify(data),
			}
		)
			.then((response) => response.json())
			.then((data) => {
				console.log('✅[POST][Send Message]:', data, latestLoadedMsgs);
				//getChatData()
			})
			.catch((error) => {
				console.error('🚨[POST][Send message]:', error, JSON.stringify(data));
			})
			.finally(() => {
				setIsSendingMessage(false);
			});

		if (
			toAddr.toLocaleLowerCase() ===
			'0x17FA0A61bf1719D12C08c61F211A063a58267A19'.toLocaleLowerCase()
		) {
			if (!process.env.REACT_APP_SLEEKPLAN_API_KEY) {
				console.log('Missing REACT_APP_SLEEKPLAN_API_KEY');
			} else {
				fetch(`https://api.sleekplan.com/v1/post`, {
					method: 'POST',
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${process.env.REACT_APP_SLEEKPLAN_API_KEY}`,
					},
					body: JSON.stringify({
						title: account,
						type: 'feedback',
						description: msgInputCopy,
						user: 347112,
					}),
				})
					.then((response) => response.json())
					.then((data) => {
						console.log('✅[POST][Feedback]:', data);
					})
					.catch((error) => {
						console.error('🚨[POST][Feedback]:', error, JSON.stringify(data));
					});
			}
		}
	};

	const updateRead = useCallback(
		(data: MessageUIType) => {
			console.log('updateRead');
			let indexOfMsg = -1;
			let newLoadedMsgs = [...loadedMsgs];
			for (let i = newLoadedMsgs.length - 1; i > 0; i--) {
				if (newLoadedMsgs[i].timestamp === data.timestamp) {
					indexOfMsg = i;
					break;
				}
			}
			if (indexOfMsg !== -1) {
				newLoadedMsgs[indexOfMsg] = {
					...newLoadedMsgs[indexOfMsg],
					read: true,
				};
				setLoadedMsgs(newLoadedMsgs);
			}
		},
		[loadedMsgs]
	);

	const header = useMemo(() => {
		return (
			<Box
				p={5}
				pb={3}
				borderBottom='1px solid var(--chakra-colors-lightgray-400)'
			>
				{isMobile && (
					<Box mb={4}>
						<Link to='/dm' style={{ textDecoration: 'none' }}>
							<Button colorScheme='gray' background='lightgray.300' size='sm'>
								<Flex alignItems='center'>
									<IconArrowLeft size={18} />
									<Text ml='1'>Back to Inbox</Text>
								</Flex>
							</Button>
						</Link>
					</Box>
				)}

				{toAddr && (
					<Flex alignItems='center' justifyContent='space-between'>
						<Flex alignItems='center'>
							{localStorage.getItem('pfpData_' + toAddr) != null ? (
								<Image
									src={localStorage['pfpData_' + toAddr]}
									height='40px'
									width='40px'
									borderRadius='var(--chakra-radii-xl)'
								/>
							) : (
								<BlockieWrapper>
									<Blockies seed={toAddr.toLocaleLowerCase()} scale={4} />
								</BlockieWrapper>
							)}
							<Box ml={2}>
								{name ? (
									<Box>
										<Text fontWeight='bold' color='darkgray.800' fontSize='md'>
											{name}
										</Text>
										<Text fontSize='sm' color='darkgray.500'>
											{truncateAddress(toAddr)}
										</Text>
									</Box>
								) : (
									<Text fontWeight='bold' color='darkgray.800' fontSize='md'>
										{truncateAddress(toAddr)}
									</Text>
								)}
							</Box>
						</Flex>
						<Box>
							{document.queryCommandSupported('copy') && (
								<Button
									onClick={() => copyToClipboard()}
									size='xs'
									disabled={copiedAddr}
									ml={3}
								>
									{copiedAddr ? (
										<IconCheck
											size={20}
											color='var(--chakra-colors-darkgray-500)'
											stroke='1.5'
										/>
									) : (
										<IconCopy
											size={20}
											color='var(--chakra-colors-lightgray-900)'
											stroke='1.5'
										/>
									)}
								</Button>
							)}
							<Button
								href={`https://etherscan.io/address/${toAddr}`}
								target='_blank'
								as={CLink}
								size='xs'
								ml={2}
							>
								<IconExternalLink
									size={20}
									color='var(--chakra-colors-lightgray-900)'
									stroke='1.5'
								/>
							</Button>
						</Box>
					</Flex>
				)}
			</Box>
		);
	}, [copiedAddr, copyToClipboard, name, toAddr]);

	const renderedMessages = useMemo(() => {
		return loadedMsgs.map((msg: MessageUIType, i) => {
			if (msg && msg.message) {
				if (msg.toAddr?.toLocaleLowerCase() === account.toLocaleLowerCase()) {
					return (
						<ChatMessage
							key={i}
							context='dms'
							account={account}
							msg={msg}
							pfpImage={localStorage['pfpData_' + msg.fromAddr]}
							updateRead={updateRead}
						/>
					);
				} else {
					return (
						<ChatMessage
							key={i}
							context='dms'
							account={account}
							msg={msg}
							pfpImage={pfpDataFromAddr}
							updateRead={updateRead}
						/>
					);
				}
			}
			return null;
		});
	}, [account, loadedMsgs, updateRead]);

	return (
		<Flex background='white' height='100vh' flexDirection='column' flex='1'>
			{header}
			<DottedBackground className='custom-scrollbar'>
				{isFetchingChatData && loadedMsgs.length === 0 && (
					<Flex
						justifyContent='center'
						alignItems='center'
						borderRadius='lg'
						background='green.200'
						p={4}
					>
						<Box fontSize='md'>
							Decrypting Your Messages, Please Wait and Do Not Refresh 😊
						</Box>
					</Flex>
				)}
				{isFetchingChatData && loadedMsgs.length === 0 && (
					<Flex justifyContent='center' alignItems='center' height='100%'>
						<Spinner />
					</Flex>
				)}
				{toAddr === '0x17FA0A61bf1719D12C08c61F211A063a58267A19' && (
					<Flex
						justifyContent='center'
						alignItems='center'
						borderRadius='lg'
						background='green.200'
						p={4}
					>
						<Box fontSize='md'>
							We welcome all feedback and bug reports. Thank you! 😊
						</Box>
					</Flex>
				)}
				{renderedMessages}
				<Box
					float='left'
					style={{ clear: 'both' }}
					ref={scrollToBottomRef}
				></Box>
			</DottedBackground>

			<Flex>
				<FormControl style={{ flexGrow: 1 }}>
					<TextareaAutosize
						placeholder='Write a message...'
						value={msgInput}
						onChange={(e) => setMsgInput(e.target.value)}
						onKeyPress={(e) => handleKeyPress(e)}
						className='custom-scrollbar'
						style={{
							resize: 'none',
							padding: '.5rem 1rem',
							width: '100%',
							fontSize: 'var(--chakra-fontSizes-md)',
							background: 'var(--chakra-colors-lightgray-400)',
							borderRadius: '0.3rem',
							marginBottom: '-6px',
						}}
						maxRows={8}
					/>
				</FormControl>
				<Flex alignItems='flex-end'>
					<Button
						variant='black'
						height='100%'
						onClick={() => sendMessage()}
						isLoading={isSendingMessage}
					>
						<IconSend size='20' />
					</Button>
				</Flex>
			</Flex>
		</Flex>
	);
};

export default DMByAddress;
