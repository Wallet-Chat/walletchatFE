import {
    Box,
    Button,
    Divider,
    Flex,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Image,
    Input,
    Text,
    Tooltip,
    useToast,
 } from '@chakra-ui/react'
 import { ChangeEvent, useEffect, useState } from 'react'
 import { useForm } from 'react-hook-form'
 import { IconSend } from '@tabler/icons'
 import { useWallet } from '../../../../context/WalletProvider'
 import OpenSeaNFT from '../../../../types/OpenSea/NFT'
 import Resizer from "react-image-file-resizer";

 const ChangeName = () => {
    const {
       handleSubmit,
       register,
       formState: { errors },
       setValue
    } = useForm()
 
    const { name: _name, setName: globalSetName, account } = useWallet()
    const toast = useToast()
 
    const [name, setName] = useState('')
    const [isFetching, setIsFetching] = useState(false)
    const [ownedENS, setOwnedENS] = useState<OpenSeaNFT[]>([])

    const [file, setFile] = useState<Blob | MediaSource>()
    const [filePreview, setFilePreview] = useState("")

    const resizeFile = (file: Blob) =>
      new Promise((resolve) => {
         Resizer.imageFileResizer(
            file,
            64,
            64,
            "JPEG",
            100,
            0,
            (uri) => {
            resolve(uri);
            },
            "base64"
         );
    });

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
         setFile(files[0])
         const image = await resizeFile(files[0])
         
         fetch(` ${process.env.REACT_APP_REST_API}/${process.env.REACT_APP_API_VERSION}/image`, {
            method: 'PUT',
            credentials: "include",
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${localStorage.getItem('jwt')}`,
            },
            body: JSON.stringify({
               base64data: image,
               addr: account,
            }),
         })
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
              setName("")
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
            }).then(() => {
              setIsFetching(false)
            })
      }
   }
 
    useEffect(() => {
       const getOwnedENS = () => {
          if (process.env.REACT_APP_OPENSEA_API_KEY === undefined) {
             console.log('Missing OpenSea API Key')
             return
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
 
    const onSubmit = (values: any) => {
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
                signupsite: document.referrer,
                domain: document.domain
             }),
          })
             .then((response) => response.json())
             .then((response) => {
               console.log('✅[PUT][Name]:', response)
               globalSetName(values.name)
               toast({
                  title: 'Success',
                  description: `Name's updated to ${values.name}`,
                  status: 'success',
                  position: 'top',
                  duration: 2000,
                  isClosable: true,
               })
               setName("")
             })
             .catch((error) => {
                console.error('🚨[PUT][Name]:', error)
                toast({
                  title: 'Error',
                  description: `Name Not Updated - Ensure you own this ENS address!`,
                  status: 'error',
                  position: 'top',
                  duration: 2000,
                  isClosable: true,
               })
             }).then(() => {
               setIsFetching(false)
             })
       }
    }

    const onSubmitPFP = (values: any) => {
     
   }
 
    return (
       <Box p={6} pt={16} background="white" width="100%" height="100vh">
          <form onSubmit={onSubmitPFP}>
            <FormControl>
            <FormLabel fontSize="xl">Upload your PFP</FormLabel>
                {console.log(filePreview)}
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
                   <input
                      type="file"
                      onChange={(e) => upload(e)}
                      name="img"
                      style={{
                         position: file ? 'absolute' : 'relative',
                         opacity: file ? '0' : '1',
                      }}
                   />
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
                <FormLabel fontSize="xl">Change your name</FormLabel>
                <Text color="darkgray.300" fontSize="md" mb={1}>
                   Current name: <b>{_name}</b>
                </Text>
                <Flex>
                   <Input
                      type="text"
                      size="lg"
                      value={name}
                      placeholder="Enter new name..."
                      borderColor="black"
                      {...register('name', {
                         required: true,
                      })}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                         setName(e.target.value)
                      }
                   />
                   <Button
                      variant="black"
                      height="auto"
                      type="submit"
                      isLoading={isFetching}
                   >
                      <IconSend size="20" />
                   </Button>
                </Flex>
                {ownedENS.length > 0 && (
                <Box mt={2}>
                   {ownedENS.map((item, i) =>
                         item?.name && item.name !== 'Unknown ENS name' ? (
                         <Button
                            variant="outline"
                            key={i}
                               onClick={() =>
                                  item?.name &&
                                  setValue('name', item.name, {
                                     shouldTouch: true,
                                  })
                               }
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
                {errors.name && errors.name.type === 'required' && (
                   <FormErrorMessage>No blank name please</FormErrorMessage>
                )}
             </FormControl>
          </form>
       </Box>
    )
 }
 
 export default ChangeName
 