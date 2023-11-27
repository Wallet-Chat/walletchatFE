import { 
   Button, 
   Flex, 
   Icon, 
   Input,
   Box,
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
import { GiphyFetch } from "@giphy/js-fetch-api";
import { IGif } from '@giphy/js-types';
import { Grid } from "@giphy/react-components";
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { BsEmojiSmile } from "react-icons/bs"
import { GrAddCircle, GrImage } from "react-icons/gr"
import { AiOutlineFileGif } from "react-icons/ai"
import { IconSend } from '@tabler/icons'
import React, { KeyboardEvent, useEffect, useState } from 'react'
import * as ENV from '@/constants/env'

const giphyFetch = new GiphyFetch(ENV.REACT_APP_GIPHY_API_KEY);

const ChatTextAreaInput = ({
   isSendingMessage,
   sendMessage,
}: {
   isSendingMessage: boolean
   sendMessage: (msg: string) => void
}) => {
   const [msgInput, setMsgInput] = useState<string>('')
   const [searchInput, setSearchInput] = useState<string>("")
   const [selectedMenuItem, setSelectedMenuItem] = useState<string>("");
   const { onClose, onToggle, isOpen } = useDisclosure();

   const fetchGifs = (offset: number) => giphyFetch.trending({ offset, limit: 10 });

    function FetchSearchedGIfs() {
      const fetchGifs = (offset: number) => giphyFetch.search(searchInput, { offset, limit: 10 });
      return <Grid fetchGifs={fetchGifs} width={400} columns={4} gutter={6} />;
    }

   useEffect(() => {
      setMsgInput('');
   }, [isSendingMessage === false])

   const handleKeyPress = (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter') {
         event.preventDefault()
         handleSendMessage()
      }
   }

   const handleSendMessage = () => {
      sendMessage && sendMessage(msgInput)
      setMsgInput('')
   }

   const addEmoji = (e: any) => {
      const sym = e.unified.split("_");
      const codeArray: any[] = [];
      sym.forEach((el: string) => codeArray.push("0x" + el));
      let emoji = String.fromCodePoint(...codeArray)
      setMsgInput(msgInput + emoji);
    }

    const onGifClick = async (gif: IGif, e: React.SyntheticEvent<HTMLElement, Event>) => {
      e.preventDefault();
  
      const gifUrl = gif.images.original.url;
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
          <PopoverContent w="420px" h="500px" alignItems="center" paddingLeft={2} backgroundColor="lightgray.500">  
            <Box 
              maxH="100%" 
              overflowY="scroll" 
              alignItems="center"
              css={{
                "&::-webkit-scrollbar": {
                  width: "0.4em",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "rgba(0, 0, 0, 0)",
                },
              }}
            >
              <Input 
                my={5}
                placeholder='Search GiFs' 
                size='md' 
                bgColor="black"
                border="none"
                focusBorderColor="black"
                color="white"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {searchInput ? (
                <FetchSearchedGIfs />
              ) : (
                <Grid
                  onGifClick={onGifClick}
                  fetchGifs={fetchGifs}
                  width={400}
                  columns={4}
                  gutter={6}
                />
              )}
            </Box>
          </PopoverContent>
        );
      } else if (selectedMenuItem === 'photo') {
        return (
          <PopoverContent w="283px">
            {/* Photo content here */}
          </PopoverContent>
        );
      }
      return null;
    };

   return (
    <Flex p='4' alignItems='center' justifyContent='center' gap='4'> 
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
                <MenuItem icon={<GrImage />} onClick={() => onToggleMenu("photo")}>Add a Photo</MenuItem>
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
   )
}

export default React.memo(ChatTextAreaInput)