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
import { addressIsValid } from '../helpers/address'

const StartConversationWithAddress = ({ web3 }: { web3: any }) => {
   const [toAddr, setToAddr] = useState<string>('')
   const [resolvedAddr, setResolvedAddr] = useState<string|null>()
   const [isResolvingENS, setIsResolvingENS] = useState(false)
   const { provider } = useWallet()

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
      if (address.includes(".eth")) {
         setIsResolvingENS(true)
         const _addr = await provider.resolveName(address)
         setResolvedAddr(_addr)
         setIsResolvingENS(false)
      }
   }

   const checkTezos = async (address: string) => {
      console.log("checking Tezos address")
      //TODO: validate Tezos address (public key hash)
      setResolvedAddr(address)
   }

   useEffect(() => {
      if (toAddr.startsWith("tz")) {
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
               placeholder="Enter ENS or address (0x...) here"
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
            {toAddr.includes(".eth") && resolvedAddr && !isResolvingENS && (
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
            {toAddr.startsWith("tz") && resolvedAddr && !isResolvingENS && (
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
