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
import { IconArrowRight } from '@tabler/icons'
import { useWallet } from '../context/WalletProvider'

const CreateNewCommunity = ({ web3 }: { web3: any }) => {
   const [newCommunityName, setNewCommunityName] = useState<string>('')
   const { provider } = useWallet()

   const {
      handleSubmit,
      register,
      formState: { errors },
   } = useForm()
   let navigate = useNavigate()

   const onSubmit = (values: any) => {


      navigate(`/community/${newCommunityName}`)
   }

   return (
      <form onSubmit={handleSubmit(onSubmit)}>
         <FormControl mb={5}>
            <Heading size="md" mb={3}>
               Create a new community:
            </Heading>
            <Input
               type="text"
               value={newCommunityName}
               placeholder="Enter desired community name"
               // {...register('newCommunityName', {
               //    validate: (val) => addressIsValid(community, val),
               // })}
               onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCommunityName(e.target.value)}
            /> 
            {errors?.toAddr && errors?.toAddr.type === 'validate' && (
               <FormErrorMessage>Community already exists!</FormErrorMessage>
            )}
         </FormControl>
         <Button variant="black" type="submit">
            Create Community <Text ml={1}><IconArrowRight size="16" /></Text>
         </Button>
      </form>
   )
}

export default CreateNewCommunity
