import React from 'react'
import { Box, Button, Image } from '@chakra-ui/react'
import { SetStateAction, Dispatch } from 'react'
import { chains } from '../constants'

const ChainFilters = ({
   chainFilters,
   setChainFilters,
}: {
   chainFilters: Array<string>
   setChainFilters: Dispatch<SetStateAction<Array<string>>>
}) => {
   const toggleChain = (chain: string) => {
      if (chain === '') {
         // Clear all filters
         if (chainFilters.length > 1) setChainFilters([''])
         else if (chainFilters.length === 1 && chainFilters[0] !== '')
            setChainFilters([''])
      } else {
         const index = chainFilters.indexOf(chain)
         if (index > -1) {
            // Filter found => remove it
            let newChainsFilter = [...chainFilters]
            newChainsFilter.splice(index, 1)
            setChainFilters(newChainsFilter)
         } else {
            // Filter not found => add it
            if (chainFilters[0] === '') {
               setChainFilters([chain])
            } else {
               setChainFilters([...chainFilters, chain])
            }
         }
      }
   }

   return (
      <Box>
         <Button
            size="sm"
            height="auto"
            py={1}
            px={2}
            onClick={() => toggleChain('')}
            variant={chainFilters[0] === '' ? 'lightgray' : 'white'}
            opacity={chainFilters[0] === '' ? '1' : '0.7'}
            mr={2}
            mb={2}
         >
            All
         </Button>
         {Object.keys(chains).map((chain) => {
            const _selected =
               chainFilters.includes(chain) || chainFilters[0] === ''
            return (
               <Button
                  key={chain}
                  size="sm"
                  height="auto"
                  py={1}
                  px={2}
                  onClick={() => toggleChain(chain)}
                  variant={_selected ? 'lightgray' : 'white'}
                  opacity={_selected ? '1' : '0.9'}
                  mr={2}
                  mb={2}
               >
                  {chains[chain]?.logo && (
                     <Image
                        src={`data:image/svg+xml;base64,${chains[chain]?.logo}`}
                        alt=""
                        width="15px"
                        height="15px"
                        d="inline-block"
                        verticalAlign="middle"
                        mr={1}
                        filter={_selected ? 'none' : 'grayscale(100%)'}
                     />
                  )}
                  {chains[chain]?.name}
               </Button>
            )
         })}
      </Box>
   )
}

export default React.memo(ChainFilters)