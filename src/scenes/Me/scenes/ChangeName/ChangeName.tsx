import {
    Box,
    Button,
    Flex,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Input,
    Text,
    useToast,
 } from '@chakra-ui/react'
 import { useEffect, useState } from 'react'
 import { useForm } from 'react-hook-form'
 import { IconSend } from '@tabler/icons'
 import { useWallet } from '../../../../context/WalletProvider'
 import { NFTMetadataOpenSeaType } from '../../../../types/NFTMetadata'
 
 const ChangeName = () => {
    const {
       handleSubmit,
       register,
       formState: { errors },
    } = useForm()
 
    const { name: _name, setName: globalSetName, account } = useWallet()
    const toast = useToast()
 
    const [name, setName] = useState('')
    const [isFetching, setIsFetching] = useState(false)
    const [ownedENS, setOwnedENS] = useState<NFTMetadataOpenSeaType[]>([])
 
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

          fetch(` ${process.env.REACT_APP_REST_API}/name`, {
             method: 'PUT',
             headers: {
                'Content-Type': 'application/json',
             },
             body: JSON.stringify({
                name: values.name,
                address: account,
             }),
          })
             .then((response) => response.json())
             .then((response) => {
                console.log('✅[PUT][Name]:', response)
                globalSetName(name)
                toast({
                  title: 'Success',
                  description: `Name's updated to ${name}`,
                  status: 'success',
                  position: 'top',
                  duration: 2000,
                  isClosable: true,
                })
                setName("")
             })
             .catch((error) => {
                console.error('🚨[PUT][Name]:', error)
             }).then(() => {
               setIsFetching(false)
             })
       }
    }
 
    return (
       <Box p={6} pt={16} background="white" width="100%" height="100vh">
          <form onSubmit={handleSubmit(onSubmit)}>
             <FormControl>
                <FormLabel fontSize="xl">Change your name</FormLabel>
                <Text color="darkgray.300" fontSize="md" mb={1}>Current name: <b>{_name}</b></Text>
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
                   <Button variant="black" height="auto" type="submit" isLoading={isFetching}>
                      <IconSend size="20" />
                   </Button>
                </Flex>
                {ownedENS.length > 0 && (
                <Box mt={2}>
                   {ownedENS.map((item, i) =>
                      (item?.name && item.name !== "Unknown ENS name") ? (
                         <Button
                            variant="outline"
                            key={i}
                            onClick={() => setName(item.name)}
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
 