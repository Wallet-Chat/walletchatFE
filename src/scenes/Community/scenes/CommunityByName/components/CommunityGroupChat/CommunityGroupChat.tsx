import {
  Box,
  Button,
  Divider,
  Flex,
  Spinner,
  Tag,
  Text,
  Icon, 
  Popover, 
  PopoverTrigger, 
  PopoverContent, 
  Textarea,
  Container, 
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem
} from '@chakra-ui/react'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import GifPicker, { TenorImage } from 'gif-picker-react';
import { BsEmojiSmile } from "react-icons/bs"
import { IconSend } from '@tabler/icons'
import { useEffect, useState, KeyboardEvent, useRef } from 'react'
import { Link, Link as RLink } from 'react-router-dom'
import TextareaAutosize from 'react-textarea-autosize'
import ChatMessage from '../../../../../../components/Chat/ChatMessage'
import { getFormattedDate } from '../../../../../../helpers/date'
import { truncateAddress } from '../../../../../../helpers/truncateString'
import { DottedBackground } from '../../../../../../styled/DottedBackground'
import * as ENV from '@/constants/env'
import { log } from '@/helpers/log'
import { getSupportHeader } from '@/helpers/widget'

import {
  GroupMessageType,
  MessageUIType,
} from '../../../../../../types/Message'
import generateItems from '../../../../helpers/generateGroupedByDays'
import ReactGA from "react-ga4";
import Analytics from 'analytics'
import googleAnalyticsPlugin from '@analytics/google-analytics'
import { getJwtForAccount } from '@/helpers/jwt'
import { AiOutlineFileGif } from 'react-icons/ai';
import { GrAddCircle, GrImage } from 'react-icons/gr';
import { createResizedImage } from '@/utils/resizer';

const tenorApiKey = ENV.REACT_APP_TENOR_API_KEY;

const CommunityGroupChat = ({
  account,
  community,
  chatData,
  isFetchingCommunityDataFirstTime,
}: {
  account: string | undefined
  community: string
  chatData: GroupMessageType[]
  isFetchingCommunityDataFirstTime: boolean
}) => {
  const [firstLoad, setFirstLoad] = useState(true)
  const [msgInput, setMsgInput] = useState<string>('')
  const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false)
  const [loadedMsgs, setLoadedMsgs] = useState<MessageUIType[]>([])
  const [selectedMenuItem, setSelectedMenuItem] = useState<string>("");
  const { onClose, onToggle, isOpen } = useDisclosure();
  const prevMessage = useRef<null | string>()
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<Blob | MediaSource>()
	const [resizedFile, setResizedFile] = useState<string>('');

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

  const resizeAndSetFile = (file: File) => {
		resizeFile(file) // Call the resize function
		.then((resizedData: any) => setResizedFile(resizedData));
	};

  const scrollToBottomRef = useRef<HTMLDivElement>(null)
  ReactGA.initialize(ENV.REACT_APP_GOOGLE_GA4_KEY);
    /* Initialize analytics instance */
    const analyticsGA4 = Analytics({
      app: 'WalletChatApp',
      plugins: [
        /* Load Google Analytics v4 */
        googleAnalyticsPlugin({
          measurementIds: [ENV.REACT_APP_GOOGLE_GA4_KEY],
        }),
      ],
    })

  useEffect(() => {
    const toAddToUI = [] as MessageUIType[]

    for (let i = 0; i < chatData.length; i++) {
      if (
        account &&
        chatData[i] &&
        chatData[i].fromaddr &&
        chatData[i].fromaddr.toLowerCase() === account.toLowerCase()
      ) {
        toAddToUI.push({
          sender_name: chatData[i].sender_name,
          type: chatData[i].type,
          message: chatData[i].message,
          fromAddr: chatData[i].fromaddr,
          timestamp: chatData[i].timestamp,
          position: 'right',
          isFetching: false,
        })
      } else {
        toAddToUI.push({
          sender_name: chatData[i].sender_name,
          type: chatData[i].type,
          message: chatData[i].message,
          fromAddr: chatData[i].fromaddr,
          timestamp: chatData[i].timestamp,
          position: 'left',
          isFetching: false,
        })
      }
    }
    const items = generateItems(toAddToUI)
    setLoadedMsgs(items)
  }, [chatData, account])

  useEffect(() => {
    // Scroll to bottom of chat once all messages are loaded
    if (scrollToBottomRef?.current && firstLoad) {
      scrollToBottomRef.current.scrollIntoView()

      setTimeout(() => {
        setFirstLoad(false)
      }, 5000)
    }
  }, [loadedMsgs])

  const handleKeyPress = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      sendMessage(msgInput)
    }
  }

  const sendMessage = async (msgInput: string) => {
    if (msgInput.length <= 0) return
    if (!account) {
      log('No account connected')
      return
    }

    if(prevMessage.current == msgInput) return;

    // ReactGA.event({
    //   category: "SendCommunityMessageCategory",
    //   action: "SendCommunityMessage",
    //   label: "SendCommunityLabel", // optional
    // });
    analyticsGA4.track('SendCommunityMessage', {
      site: document.referrer,
      community,
      account
    });

    try {
      window.dataLayer = window.dataLayer || []; //initialising data layer
      window.dataLayer.push({
          event: "sendCommunityMessage", // event name
          walletaddr: account.toLocaleLowerCase(), 
      });
    } catch(e) {}

    // Make a copy and clear input field
    const msgInputCopy = (' ' + msgInput).slice(1)
    prevMessage.current = msgInput
    setMsgInput('')

    const timestamp = new Date()

    const latestLoadedMsgs = JSON.parse(JSON.stringify(loadedMsgs))

    let data = {
      type: 'message',
      message: msgInputCopy,
      nftaddr: community,
      fromaddr: account.toLocaleLowerCase(),
      timestamp,
    }

    addMessageToUI(
      'message',
      msgInputCopy,
      account,
      timestamp.toString(),
      'right',
      false
    )

    data.message = msgInputCopy

    setIsSendingMessage(true)

    fetch(`${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/community`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getJwtForAccount(account)}`,
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        log('✅[POST][Community][Message]:', data, latestLoadedMsgs)
      })
      .catch((error) => {
        console.error(
          '🚨[POST][Community][Message]:',
          error,
          JSON.stringify(data)
        )
      })
      .finally(() => {
        setIsSendingMessage(false)
      })
  }

  const addMessageToUI = (
    type: string,
    message: string,
    fromaddr: string,
    timestamp: string,
    position: string,
    isFetching: boolean
  ) => {
    log(`Add message to UI: ${message}`)

    const newMsg: MessageUIType = {
      type,
      message,
      fromAddr: fromaddr,
      timestamp,
      position,
      isFetching,
    }
    let newLoadedMsgs: MessageUIType[] = [...loadedMsgs] // copy the old array
    newLoadedMsgs.push(newMsg)
    setLoadedMsgs(newLoadedMsgs)
  }

  //TODO upload image in community
  const imageUpload = () => {
    if (!account) {
      log('No account connected')
      return
    }
    
    setIsSendingMessage(true);

    fetch(
			`${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/imageraw`,
			{
				method: 'POST',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${getJwtForAccount(account)}`,
				},
				body: JSON.stringify({
					addr: "",
          imageid: "",
					image: resizedFile,
				}),
			}
		)
      .then((response) => response.json())
      .then((data) => {
        log('✅[POST][Community][Message]:', data, latestLoadedMsgs)
      })
      .catch((error) => {
        console.error(
          '🚨[POST][Community][Message]:',
          error,
          JSON.stringify(data)
        )
      })
      .finally(() => {
        setIsSendingMessage(false)
      })
  }

  const onAddPhotoClick = () => {
    if(fileInputRef?.current){
      fileInputRef?.current.click();
    } 
  };

  const addEmoji = (e: any) => {
    const sym = e.unified.split("_");
    const codeArray: any[] = [];
    sym.forEach((el: string) => codeArray.push("0x" + el));
    let emoji = String.fromCodePoint(...codeArray)
    setMsgInput(msgInput + emoji);
  }

  const onGifClick = async (gif: TenorImage) => {    
    const gifUrl = gif.url;
    const updatedMsgInput = msgInput + gifUrl;
    
    sendMessage(updatedMsgInput);
    onClose();
  }

  const onToggleMenu = (item: string) => {
    setSelectedMenuItem(item);
    onToggle();
  }

  const renderPopoverContent = () => {
    if (selectedMenuItem === 'emoji') {
      return (
        <PopoverContent w="283px">
          <Picker 
            data={data}
            emojiSize={20}
            emojiButtonSize={28}
            onEmojiSelect={addEmoji}
            maxFrequentRows={4}
          />
        </PopoverContent>
      );
    } else if (selectedMenuItem === 'gif') {
      return (
        <PopoverContent>
          <GifPicker tenorApiKey={tenorApiKey} onGifClick={(gif) => onGifClick(gif)} />
        </PopoverContent>
      );
    } else {
      return (
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={(e: any) => {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            resizeAndSetFile(selectedFile);
          }}
        />
      );
    }
  };

    const AlertBubble = ({
      children,
      color,
      to, // Add a prop to specify the target route
    }: {
      children: string;
      color: 'green' | 'red';
      to: string; // Specify the target route
    }) => (
      <Link to={to}>
        <Flex
          justifyContent='center'
          alignItems='center'
          borderRadius='lg'
          background={color === 'green' ? 'green.200' : 'red.200'}
          p={4}
          position='sticky'
          top={0}
          right={0}
          zIndex={1}
        >
          <Box fontSize='md'>{children}</Box>
        </Flex>
      </Link>
    );

  return (
    <Flex flexDirection='column' height='100%'>
      <AlertBubble to={`https://leaderboard.walletchat.fun`}color="green">{getSupportHeader()}</AlertBubble>
      <DottedBackground className='custom-scrollbar'>
        {loadedMsgs.length === 0 && (
          <Flex
            justifyContent='center'
            alignItems='center'
            borderRadius='lg'
            background='white'
            p={4}
          >
            <Box fontSize='md'>
              {isFetchingCommunityDataFirstTime ? (
                <Spinner />
              ) : (
                'Be the first to post something here 😉'
              )}
            </Box>
          </Flex>
        )}
        {loadedMsgs.map((msg, i) => {
          if (msg.type && msg.type === 'day') {
            return (
              <Box position='relative' my={6} key={msg.timestamp}>
                <Tag
                  color='lightgray.800'
                  background='lightgray.200'
                  fontSize='xs'
                  fontWeight='bold'
                  mb={1}
                  position='absolute'
                  right='var(--chakra-space-4)'
                  top='50%'
                  transform='translateY(-50%)'
                >
                  {getFormattedDate(msg.timestamp.toString())}
                </Tag>
                <Divider />
              </Box>
            )
          } else if (msg.type && msg.type === 'welcome') {
            return (
              <Box textAlign='center' key={msg.timestamp}>
                <Text fontSize='sm' color='darkgray.200'>
                  A warm welcome to{' '}
                  <RLink to={`/dm/${msg.fromAddr}`}>
                    {msg.sender_name
                      ? msg.sender_name
                      : truncateAddress(msg.fromAddr)}
                  </RLink>
                </Text>
              </Box>
            )
          } else if (msg.message) {
            return (
              <ChatMessage
                key={msg.timestamp}
                context='community'
                account={account}
                msg={msg}
              />
            )
          }
          return null
        })}
        <Box
          float='left'
          style={{ clear: 'both' }}
          ref={scrollToBottomRef}
        ></Box>
      </DottedBackground>

      <Flex p='4' background='white' alignItems='center' justifyContent='center' gap='4'>
        <Popover isOpen={isOpen} onClose={onClose} placement='top-start' isLazy>
          <PopoverTrigger>
            <Container 
              w={0}
              centerContent
              cursor="pointer"
            >
              <Menu>
                <MenuButton>
                  <Icon as={GrAddCircle} color="black.500" h={6} w={6} marginTop={2} />
                </MenuButton>
                <MenuList>
                  <MenuItem icon={<BsEmojiSmile />} onClick={() => onToggleMenu("emoji")} >Add an Emoji</MenuItem>
                  <MenuItem icon={<AiOutlineFileGif />} onClick={() => onToggleMenu("gif")} >Add a GIF</MenuItem>
                  <MenuItem icon={<GrImage />} onClick={onAddPhotoClick}>Add a Photo</MenuItem>
                </MenuList>
              </Menu>
            </Container>
          </PopoverTrigger>
          {renderPopoverContent()}
        </Popover>
        <Textarea 
          placeholder='Write a message...'
          onChange={(e) => setMsgInput(e.target.value)}
          value={msgInput}
          onKeyPress={handleKeyPress}
          backgroundColor='lightgray.400'
          minH='full'
          pt={3.5}
          resize='none'
        />
        
        <Flex alignItems='flex-end'>
          <Button
            variant='black'
            onClick={() => sendMessage(msgInput)}
            borderRadius='full'
            minH='full'
            px='0'
            py='0'
            w='12'
            h='12'
          >
            <IconSend size='22' />
          </Button>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default CommunityGroupChat
