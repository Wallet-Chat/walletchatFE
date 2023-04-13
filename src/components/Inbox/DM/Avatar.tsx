import React from 'react'
import Blockies from 'react-blockies'
import { Box, Image } from '@chakra-ui/react'
import { useGetPfpQuery } from '@/redux/reducers/dm'
import { BlockieWrapper } from '@/styled/BlockieWrapper'

const AvatarWrapper = ({ children }: { children: React.ReactNode }) => (
  <BlockieWrapper height='40px' width='40px'>
    {children}
  </BlockieWrapper>
)

function Avatar({ account }: { account: string }) {
  const accountStr = account.toLocaleLowerCase()
  const { data: toAddrPfp } = useGetPfpQuery(accountStr)

  if (toAddrPfp) {
    return (
      <AvatarWrapper>
        <Box
          backgroundImage={`url(${toAddrPfp})`}
          backgroundSize='cover'
          backgroundPosition='center'
          backgroundRepeat='no-repeat'
          height='40px'
          width='40px'
        />
      </AvatarWrapper>
    )
  }

  return (
    <AvatarWrapper>
      <Blockies seed={accountStr} scale={5} />
    </AvatarWrapper>
  )
}

export default Avatar
