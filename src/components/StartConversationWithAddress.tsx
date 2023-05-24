import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
   Button,
   Flex,
   FormControl,
   FormErrorMessage,
   Heading,
   Input,
   Spinner,
   Text,
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import Blockies from 'react-blockies'
import { truncateAddress } from '../helpers/truncateString'
import { IconArrowRight } from '@tabler/icons'
import { useWallet } from '../context/WalletProvider'
import { addressIsValid, getWalletChain } from '../helpers/address'
import { TezosToolkit } from '@taquito/taquito';
import { TaquitoTezosDomainsClient } from '@tezos-domains/taquito-client';
import { Tzip16Module } from '@taquito/tzip16';

const StartConversationWithAddress = ({ web3 }: { web3: any }) => {
   const [toAddr, setToAddr] = useState<string>('')
   const [resolvedAddr, setResolvedAddr] = useState<string|null>()
   const [isResolvingENS, setIsResolvingENS] = useState(false)
   const { account, provider } = useWallet()

   const {
      handleSubmit,
      register,
      formState: { errors },
   } = useForm()
   let navigate = useNavigate()

   const onSubmit = (values: any) => {
      navigate(`/dm/${toAddr}`)
   }

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
      if (address.includes(".tez")) {
         console.log("checking Tezos address")
         const tezos = new TezosToolkit('https://mainnet.smartpy.io');
         tezos.addExtension(new Tzip16Module());
         const client = new TaquitoTezosDomainsClient({ tezos, network: 'mainnet', caching: { enabled: true } });
     
         const _addr = await client.resolver.resolveNameToAddress(address);
     
         console.log(address);
         setResolvedAddr(_addr)
      }
   }

   useEffect(() => {
      if (toAddr.endsWith(".tez")) {
         const delayDebounceFn = setTimeout(() => {
            checkTezos(toAddr)
          }, 800)
          return () => clearTimeout(delayDebounceFn)
      } else {
          const delayDebounceFn = setTimeout(() => {
            checkENS(toAddr)
          }, 800)
          return () => clearTimeout(delayDebounceFn)
      }
    }, [toAddr])

   return (
      <form onSubmit={handleSubmit(onSubmit)}>
         <FormControl mb={5}>
            <Heading size="md" mb={3}>
               Start a conversation with...
            </Heading>
            <Input
               type="text"
               value={toAddr}
               placeholder="Enter ENS/TEZ/NEAR or (0x..., tz...) here"
               {...register('toAddr', {
                  validate: (val) => addressIsValid(web3, val),
               })}
               onChange={(e: React.ChangeEvent<HTMLInputElement>) => setToAddr(e.target.value)}
            />
            {web3 != null && web3.utils.isAddress(toAddr) && (
               <Link to={`/dm/${toAddr}`} style={{ textDecoration: 'none' }}>
               <Flex
                  alignItems="center"
                  justifyContent="flex-start"
                  p={3}
                  background="lightgray.300"
                  borderRadius="md"
                  mt={2}
                  as={Button}
               >
                  <Blockies seed={toAddr.toLocaleLowerCase()} scale={3} />
                  <Text fontWeight="bold" fontSize="md" ml={2}>
                     {truncateAddress(toAddr)}
                  </Text>
               </Flex>
               </Link>
            )}
            {isResolvingENS && <Spinner size="sm" mt={2} />}
            {(toAddr.includes(".eth") || toAddr.includes(".bnb") || address.includes(".arb") || address.includes(".btc")) && resolvedAddr && !isResolvingENS && (
               <Link to={`/dm/${resolvedAddr}`} style={{ textDecoration: 'none' }}>
               <Flex
                  alignItems="center"
                  justifyContent="flex-start"
                  p={3}
                  background="lightgray.300"
                  borderRadius="md"
                  mt={2}
                  as={Button}
               >
                  <Blockies seed={resolvedAddr.toLocaleLowerCase()} scale={3} />
                  <Text fontWeight="bold" fontSize="md" ml={2}>
                     {toAddr}{" "}({truncateAddress(resolvedAddr)})
                  </Text>
               </Flex>
               </Link>
            )}
            {toAddr.includes(".tez") && resolvedAddr && !isResolvingENS && (
               <Link to={`/dm/${resolvedAddr}`} style={{ textDecoration: 'none' }}>
               <Flex
                  alignItems="center"
                  justifyContent="flex-start"
                  p={3}
                  background="lightgray.300"
                  borderRadius="md"
                  mt={2}
                  as={Button}
               >
                  <Blockies seed={resolvedAddr} scale={3} />
                  <Text fontWeight="bold" fontSize="md" ml={2}>
                     {toAddr}{" "}({truncateAddress(resolvedAddr)})
                  </Text>
               </Flex>
               </Link>
            )}
            {(getWalletChain(toAddr) == 'near') && !isResolvingENS && (
               <Link to={`/dm/${toAddr}`} style={{ textDecoration: 'none' }}>
               <Flex
                  alignItems="center"
                  justifyContent="flex-start"
                  p={3}
                  background="lightgray.300"
                  borderRadius="md"
                  mt={2}
                  as={Button}
               >
                  <Blockies seed={toAddr} scale={3} />
                  <Text fontWeight="bold" fontSize="md" ml={2}>
                     {toAddr}{" "}({truncateAddress(toAddr)})
                  </Text>
               </Flex>
               </Link>
            )}
            {errors?.toAddr && errors?.toAddr.type === 'validate' && (
               <FormErrorMessage>Address is not valid</FormErrorMessage>
            )}
         </FormControl>
         <Button variant="black" type="submit">
            Start chat <Text ml={1}><IconArrowRight size="16" /></Text>
         </Button>
      </form>
   )
}

export default StartConversationWithAddress
