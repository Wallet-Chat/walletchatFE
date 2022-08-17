import { FormControl, Input } from '@chakra-ui/react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

export default function InboxSearchInput() {
   const [query, setQuery] = useState('')

   const { handleSubmit, register } = useForm()

   const onSubmit = (values: any) => {
      console.log('onSubmit', values)
   }

   return (
      <form onSubmit={handleSubmit(onSubmit)}>
         <FormControl>
            <Input
               type="text"
               value={query}
               placeholder="Search or paste address (0x.. or .eth) to chat"
               {...register('toAddr')}
               onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setQuery(e.target.value)
               }
               background="lightgray.300"
            />
         </FormControl>
      </form>
   )
}
