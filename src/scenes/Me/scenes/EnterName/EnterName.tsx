import {
   Box,
   Button,
   Flex,
   FormControl,
   FormErrorMessage,
   FormHelperText,
   FormLabel,
   Input,
   Text,
   useToast,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { IconSend } from '@tabler/icons'
import { useWallet } from '../../../../context/WalletProvider'
import OpenSeaNFT from '../../../../types/OpenSea/NFT'

const EnterName = ({ account }: { account: string }) => {
   const {
      handleSubmit,
      register,
      formState: { errors },
      setValue
   } = useForm()

   const toast = useToast()

   const { setName: globalSetName } = useWallet()
   let navigate = useNavigate()

   const [name, setName] = useState('')
   const [isFetching, setIsFetching] = useState(false)
   const [ownedENS, setOwnedENS] = useState<OpenSeaNFT[]>([])

   useEffect(() => {
      const getOwnedENS = () => {
         if (process.env.REACT_APP_OPENSEA_API_KEY === undefined) {
            console.log('Missing OpenSea API Key')
            return
         }
         if (account) {
            console.log('No account detected')
         }
         fetch(
            `https://api.opensea.io/api/v1/assets?owner=${account}&collection=ens`,
            {
               method: 'GET',
               headers: {
                  Authorization: process.env.REACT_APP_OPENSEA_API_KEY,
               },
            }
         )
            .then((response) => response.json())
            .then((result) => {
               console.log(`✅[GET][ENS Owned by ${account}]]:`, result)
               if (result?.assets?.length > 0) {
                  setOwnedENS(result.assets)
               }
            })
            .catch((error) =>
               console.log(`🚨[GET][ENS Owned by ${account}`, error)
            )
      }
      if (account) {
         getOwnedENS()
      }
   }, [account])

   useEffect(()=>{
      console.log(errors)
   },[errors])

   const onSubmit = (values: any) => {
      console.log("onSubmit")
      console.log(values)
      if (values?.name) {

         setIsFetching(true)

         fetch(` ${process.env.REACT_APP_REST_API}/${process.env.REACT_APP_API_VERSION}/name`, {
            method: 'POST',
            credentials: "include",
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${localStorage.getItem('jwt')}`,
            },
            body: JSON.stringify({
               name: values.name,
               address: account,
            }),
         })
            .then((response) => response.json())
            .then((response) => {
               console.log('✅[POST][Name]:', response)
               globalSetName(name)
               navigate('/community/walletchat')
            })
            .catch((error) => {
               console.error('🚨[POST][Name]:', error)
            })
            .then(() => {
               setIsFetching(false)
            })
      }
   }

   return (
      <Box p={6} pt={16} background="white" width="100%">
         <form onSubmit={handleSubmit(onSubmit)}>
            <Text fontSize="3xl" fontWeight="bold" maxWidth="280px" mb={4}>
               Hey there!
               <br />A warm welcome to the WalletChat Community!
            </Text>
            <FormControl>
               <FormLabel fontSize="2xl">What's your name?</FormLabel>
               <Flex>
                  <Input
                     type="text"
                     size="lg"
                     value={name}
                     placeholder="Real or anon name"
                     borderColor="black"
                     
                     {...register('name', {
                        required: true,
                        onChange:(e: React.ChangeEvent<HTMLInputElement>) =>
                           {
                              setName(e.target.value)
                              // console.log(name)
                           }
                        
                     })}
                     
                  />
                  <Button variant="black" height="auto" type="submit" isLoading={isFetching} onClick={()=>{
                     console.log("SUBMIT BTN")
                     console.log(errors)
                     console.log(name)
                  }}>
                     <IconSend size="20" />
                  </Button>
               </Flex>
               {ownedENS.length > 0 && (
               <Box mt={2}>
                  {ownedENS.map((item:OpenSeaNFT, i) =>
                     (item?.name && item?.name !== "Unknown ENS name") ? (
                        <Button
                           variant="outline"
                           key={i}
                           onClick={() => {
                              setValue('name',item.name, { shouldTouch: true })
                           }}
                           mr="2"
                           mb="2"
                           size="sm"
                        >
                           {item.name}
                        </Button>
                     ) : (
                        ''
                     )
                  )}
               </Box>
            )}
               <FormHelperText>
                  You can change it anytime in your settings
               </FormHelperText>
               {errors.name && errors.name.type === 'required' && (
                  // <FormErrorMessage>No blank name please</FormErrorMessage>
                  
                  toast({
                     title: 'FAILED',
                     description: `No blank name please ${errors.name}`,
                     status: 'error',
                     position: 'top',
                     duration: 2000,
                     isClosable: true,
                   })
               )}
            </FormControl>
         </form>
      </Box>
   )
}

export default EnterName
