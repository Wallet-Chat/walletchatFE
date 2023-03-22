import {
   Alert,
   Box,
   Button,
   Divider,
   Flex,
   FormControl,
   FormErrorMessage,
   FormHelperText,
   FormLabel,
   Image,
   Input,
   Text,
   Tooltip,
   useToast,
} from '@chakra-ui/react'
import { ChangeEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { IconSend } from '@tabler/icons'
import { useWallet } from '../../../../context/WalletProvider'
import OpenSeaNFT from '../../../../types/OpenSea/NFT'
import * as ENV from '@/constants/env'
import Resizer from 'react-image-file-resizer'
import { getJwtForAccount } from '@/helpers/jwt'

const EnterName = ({ account }: { account: string }) => {
   const {
      handleSubmit,
      register,
      formState: { errors },
      setValue,
   } = useForm()

   const toast = useToast()

   const { setName: globalSetName } = useWallet()
   let navigate = useNavigate()

   const [name, setName] = useState('')
   const [isFetching, setIsFetching] = useState(false)
   const [ownedENS, setOwnedENS] = useState<OpenSeaNFT[]>([])

   const [file, setFile] = useState<Blob | MediaSource>()
   const [filePreview, setFilePreview] = useState('')
    const resizeFile = (file: Blob) =>
      new Promise((resolve) => {
         Resizer.imageFileResizer(
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
   useEffect(() => {
      // create the preview
      if (file) {
         const objectUrl = URL.createObjectURL(file)
         setFilePreview(objectUrl)
         // free memory whenever this component is unmounted
         return () => URL.revokeObjectURL(objectUrl)
      }
   }, [file])
   const upload = async (e: ChangeEvent<HTMLInputElement>) => {
      console.warn(e.target.files)
      const files = e.target.files
      if (files && files.length !== 0) {
         const image = await resizeFile(files[0])
         fetch(
            `${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/image`,
            {
            method: 'PUT',
               credentials: 'include',
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${getJwtForAccount(account)}`,
            },
            body: JSON.stringify({
               base64data: image,
               addr: account,
            }),
            }
         )
            .then((response) => response.json())
            .then((response) => {
              console.log('✅[POST][Image]:', response)
              toast({
                 title: 'Success',
                 description: `PFP updated!`,
                 status: 'success',
                 position: 'top',
                 duration: 2000,
                 isClosable: true,
              })
               setName('')
            })
            .catch((error) => {
               console.error('🚨[POST][Image]:', error)
               toast({
                 title: 'Error',
                 description: `Image Not Updated - Unknown error`,
                 status: 'error',
                 position: 'top',
                 duration: 2000,
                 isClosable: true,
              })
            })
            .then(() => {
              setIsFetching(false)
            })
      }
   }
   useEffect(() => {
      const getOwnedENS = () => {
         if (ENV.REACT_APP_OPENSEA_API_KEY === undefined) {
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
                  Authorization: ENV.REACT_APP_OPENSEA_API_KEY,
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
      console.log('onSubmit')
      console.log('Values are: ', values)
      if(!getJwtForAccount(account)) {
         toast({
            title: 'Error',
            description: `You must sign the message pending in your wallet before setting name!`,
            status: 'error',
            position: 'top',
            duration: 2000,
            isClosable: true,
         })
         return
      }

      if (values?.name) {

         setIsFetching(true)

         fetch(
            ` ${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/name`,
            {
            method: 'POST',
               credentials: 'include',
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${getJwtForAccount(account)}`,
            },
            body: JSON.stringify({
               name: values.name,
               address: account,
               signupsite: document.referrer,
               domain: document.domain
            }),
            }
         )
            .then((response) => response.json())
            .then((response) => {
               console.log('✅[POST][Name]:', response)
               globalSetName(name)
               navigate('/me/enter-email')
            })
            .catch((error) => {
               toast({
                  title: 'Error',
                  description: `Name Not Updated - Ensure you own this ENS address and have signed in with your wallet`,
                  status: 'error',
                  position: 'top',
                  duration: 2000,
                  isClosable: true,
               })
               console.error('🚨[POST][Name]:', error)
            })
            .then(() => {
               setIsFetching(false)
            })
      }
   }

   const onSubmitPFP = (values: any) => {}
   return (
         <Box p={6} pt={16} background="white" width="100%">
            <Text fontSize="3xl" fontWeight="bold" maxWidth="280px" mb={4}>
               Welcome to the WalletChat Community!
            </Text>
            <Divider
            orientation="horizontal"
            height="15px"
            d="inline-block"
            verticalAlign="middle"
            />
            <form onSubmit={onSubmitPFP}>
               <FormControl>
               <FormLabel fontSize="xl">Upload your PFP (optional)</FormLabel>
               <label>
                  {file && (
                     <Tooltip label="Change PFP">
                        <Image
                           src={filePreview}
                           alt=""
                           maxW="80px"
                           maxH="80px"
                           border="2px solid #000"
                           borderRadius="lg"
                           cursor="pointer"
                           _hover={{ borderColor: 'gray.400' }}
                        />
                     </Tooltip>
                  )}
                  <input type="file" onChange={(e) => upload(e)} name="img" />
               </label>
            </FormControl>
         </form>
         <Divider
            orientation="horizontal"
            height="15px"
            d="inline-block"
            verticalAlign="middle"
         />
         <form onSubmit={handleSubmit(onSubmit)}>
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
                        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                              setName(e.target.value)
                              // console.log(name)
                        },
                        
                     })}
                     
                  />
                  <Button
                     variant="black"
                     height="auto"
                     type="submit"
                     isLoading={isFetching}
                     onClick={() => {
                        console.log('SUBMIT BTN')
                     console.log(errors)
                     console.log(name)
                     }}
                  >
                     <IconSend size="20" />
                  </Button>
               </Flex>
               {ownedENS.length > 0 && (
               <Box mt={2}>
                  {ownedENS.map((item:OpenSeaNFT, i) =>
                        item?.name && item?.name !== 'Unknown ENS name' ? (
                        <Button
                           variant="outline"
                           key={i}
                           onClick={() => {
                                 setValue('name', item.name, {
                                    shouldTouch: true,
                                 })
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
               {errors.name &&
                  errors.name.type === 'required' &&
                  // <FormErrorMessage>No blank name please</FormErrorMessage>                
                  toast({
                     title: 'FAILED',
                     description: `No blank name please ${errors.name}`,
                     status: 'error',
                     position: 'top',
                     duration: 2000,
                     isClosable: true,
                  })}
            </FormControl>
            <Alert status="success" variant="solid" mt={4}>
               You must sign the pending message in your connected wallet prior
               to setting name
            </Alert>
 	    </form> 
      </Box>
   )
}

export default EnterName
