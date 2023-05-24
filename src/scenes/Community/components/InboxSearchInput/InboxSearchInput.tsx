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
import { Link } from 'react-router-dom'
import Blockies from 'react-blockies'
import { useWallet } from '../../../../context/WalletProvider'
import { truncateAddress } from '../../../../helpers/truncateString'
import useOnClickOutside from '../../../../hooks/useOnClickOutside'
import { TezosToolkit } from '@taquito/taquito';
import { TaquitoTezosDomainsClient } from '@tezos-domains/taquito-client';
import { Tzip16Module } from '@taquito/tzip16';
import { getWalletChain } from '../../../../helpers/address'

export default function InboxSearchInput() {
   const [toAddr, setToAddr] = useState<string>('')
   const [resolvedAddr, setResolvedAddr] = useState<string | null>()
   const [isResolvingENS, setIsResolvingENS] = useState(false)
   const [isSuggestionListOpen, setIsSuggestionListOpen] = useState(false)
   const { provider, web3 } = useWallet()

   const ref = useRef(null)

   const checkENS = async (address: string) => {
      if (address.includes(".eth") || address.includes(".bnb") || address.includes(".arb") || address.includes(".btc")) {
         setIsResolvingENS(true)

         fetch(` ${process.env.REACT_APP_REST_API}/resolve_name/${address}`, {
            method: 'GET',
            credentials: "include",
            headers: {
               'Content-Type': 'application/json',
            },
         })
            .then((response) => response.json())
            .then((result) => {
               console.log(`✅[GET][Name Owned by ${address}]]:`, result)
               if (result?.address?.length > 0) {
                  setResolvedAddr(result.address)
                  setIsSuggestionListOpen(true)
               }
            })
            .catch((error) =>
               console.log(`🚨[GET][Owned by ${address}`, error)
            )
            .finally(() => {
               setIsResolvingENS(false)
            })
      }
   }

   const checkTezos = async (address: string) => {
      if (address.endsWith('.tez')) {
         setIsResolvingENS(true)
         
         console.log("checking Tezos address")
         const tezos = new TezosToolkit('https://mainnet.smartpy.io');
         tezos.addExtension(new Tzip16Module());
         const client = new TaquitoTezosDomainsClient({ tezos, network: 'mainnet', caching: { enabled: true } });
     
         const _addr = await client.resolver.resolveNameToAddress(address);

         if (_addr) {
            setResolvedAddr(_addr)
            setIsSuggestionListOpen(true)
         }
         setIsResolvingENS(false)
      }
   }

   useEffect(() => {
      const delayDebounceFn = setTimeout(() => {
         checkENS(toAddr)
         checkTezos(toAddr)
      }, 800)

      return () => clearTimeout(delayDebounceFn)
   }, [toAddr])

   const handleClickOutside = () => {
      if (isSuggestionListOpen === true) setIsSuggestionListOpen(false)
   }

   useOnClickOutside(ref, handleClickOutside)

   let suggestedAddress: string = toAddr
   if (web3 != null){
      console.log("checking address 1")
      if (web3.utils.isAddress(toAddr)) {
         suggestedAddress = toAddr
      } else if ((toAddr.endsWith('.eth') || toAddr.endsWith('.bnb') || toAddr.endsWith('.arb') || toAddr.endsWith('.btc')) && resolvedAddr && !isResolvingENS) {
         suggestedAddress = resolvedAddr
      }
   }
   if ((getWalletChain(toAddr) == 'tezos') && resolvedAddr && !isResolvingENS) {
      suggestedAddress = resolvedAddr
   } else if ((getWalletChain(toAddr) == 'near') && !isResolvingENS) {
      suggestedAddress = toAddr  //for NEAR i'm not sure if we need the pubKey here...
   }

   return (
      <Box position={'relative'} ref={ref}>
         <FormControl pos="relative">
            <Input
               type="text"
               value={toAddr}
               placeholder="Enter ENS/TEZ/NEAR or (0x..., tz...) here"
               onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setToAddr(e.target.value)
               }
               onFocus={(e: React.ChangeEvent<HTMLInputElement>) => {
                  if (resolvedAddr) setIsSuggestionListOpen(true)
               }}
               background="lightgray.300"
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

         {suggestedAddress !== '' &&
            isSuggestionListOpen &&
            suggestedAddress !== toAddr &&
            !isResolvingENS && (
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
                  <Link
                     to={`/dm/${suggestedAddress}`}
                     onClick={() => {
                        setIsSuggestionListOpen(false)
                        setToAddr('')
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
                           {(toAddr.endsWith('.eth') || toAddr.endsWith('.bnb') || toAddr.endsWith('.arb') || toAddr.endsWith('.btc'))
                              ? toAddr
                              : truncateAddress(toAddr)}{' '}
                           {(toAddr.endsWith('.eth') || toAddr.endsWith('.bnb') || toAddr.endsWith('.arb') || toAddr.endsWith('.btc')) &&
                              `(${truncateAddress(suggestedAddress)})`}
                           {toAddr.endsWith('.tez') &&
                              `(${truncateAddress(suggestedAddress)})`}
                           {((getWalletChain(toAddr) == 'near')) &&
                              `(${truncateAddress(toAddr)})`}
                        </Text>
                     </Flex>
                  </Link>
               </Box>
            )}
      </Box>
   )
}
