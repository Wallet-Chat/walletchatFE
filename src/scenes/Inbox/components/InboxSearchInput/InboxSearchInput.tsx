import {
   Box,
   Button,
   Flex,
   FormControl,
   Input,
   Spinner,
   Text,
} from '@chakra-ui/react'
import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Blockies from 'react-blockies'
import { useWallet } from '../../../../context/WalletProvider'
import { truncateAddress } from '../../../../helpers/truncateString'
import useOnClickOutside from '../../../../hooks/useOnClickOutside'

export default function InboxSearchInput() {
   const [toAddr, setToAddr] = useState<string>('')
   const [resolvedAddr, setResolvedAddr] = useState<string | null>()
   const [isResolvingENS, setIsResolvingENS] = useState(false)
   const [isSuggestionListOpen, setIsSuggestionListOpen] = useState(false)
   const { provider, web3 } = useWallet()

   const ref = useRef(null)
   let navigate = useNavigate()

   const checkENS = async (address: string) => {
      if (address.endsWith('.eth')) {
         setIsResolvingENS(true)
         const _addr = await provider.resolveName(address)
         if (_addr) {
            setResolvedAddr(_addr)
         }
         setIsResolvingENS(false)
      }
   }

   useEffect(() => {
      const delayDebounceFn = setTimeout(() => {
         checkENS(toAddr)
      }, 800)

      return () => clearTimeout(delayDebounceFn)
   }, [toAddr])

   const handleClickOutside = () => {
      if (isSuggestionListOpen === true) setIsSuggestionListOpen(false)
   }

   useOnClickOutside(ref, handleClickOutside)

   let suggestedAddress: string = toAddr
   if (web3.utils.isAddress(toAddr)) {
      suggestedAddress = toAddr
   } else if (toAddr.endsWith('.eth') && resolvedAddr && !isResolvingENS) {
      suggestedAddress = resolvedAddr
   }

   return (
      <Box position={'relative'}>
         <FormControl pos="relative">
            <Input
               type="text"
               value={toAddr}
               placeholder="Enter ENS or address (0x.. or .eth) to chat"
               onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setToAddr(e.target.value)
               }
               onFocus={(e: React.ChangeEvent<HTMLInputElement>) => {
                  if (resolvedAddr) setIsSuggestionListOpen(true)
               }}
               background="lightgray.300"
               ref={ref}
            />
            {isResolvingENS && (
               <Box
                  pos="absolute"
                  right="1.5rem"
                  top="50%"
                  transform="translateY(-50%)"
                  zIndex="docked"
               >
                  <Spinner size="sm" />
               </Box>
            )}
         </FormControl>

         {suggestedAddress !== '' && isSuggestionListOpen && suggestedAddress !== toAddr && (
            <Box
               position="absolute"
               top={'100%'}
               left={0}
               width="100%"
               borderRadius="md"
               p={2}
               background="white"
               borderColor="darkgray.100"
               borderWidth="1px"
            >
               <Text color="darkgray.500" fontSize="md" mb={1}>
                  Start chatting with
               </Text>
               <Box
                  onClick={() => {
                     setIsSuggestionListOpen(false)
                     navigate(`/chat/${suggestedAddress}`)
                  }}
                  style={{ textDecoration: 'none', width: '100%' }}
               >
                  <Flex
                     alignItems="center"
                     justifyContent="flex-start"
                     p={3}
                     background="lightgray.300"
                     borderRadius="md"
                     as={Button}
                     width="100%"
                  >
                     <Blockies
                        seed={suggestedAddress.toLocaleLowerCase()}
                        scale={3}
                     />
                     <Text fontWeight="bold" fontSize="md" ml={2}>
                        {toAddr.endsWith('.eth')
                           ? toAddr
                           : truncateAddress(toAddr)}{' '}
                        {toAddr.endsWith('.eth') && `(${truncateAddress(suggestedAddress)})`}
                     </Text>
                  </Flex>
               </Box>
            </Box>
         )}
      </Box>
   )
}
