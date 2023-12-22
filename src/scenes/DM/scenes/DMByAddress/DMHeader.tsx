import React, { useEffect } from 'react'
import { Box, Button, Flex, Text, Link as CLink, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useDisclosure, Spinner } from '@chakra-ui/react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  IconArrowLeft,
  IconExternalLink,
} from '@tabler/icons'
import { FaRegTrashCan } from "react-icons/fa6";
import { MdVerified } from "react-icons/md";
import { ImBlocked } from "react-icons/im";
import useIsSmallLayout from '@/hooks/useIsSmallLayout'
import { truncateAddress } from '../../../../helpers/truncateString'
import { deleteToAddrFromInboxData, useGetNameQuery } from '@/redux/reducers/dm'
import Avatar from '@/components/Inbox/DM/Avatar'
import * as ENV from '@/constants/env'
import { log } from '@/helpers/log'
import { getJwtForAccount } from '@/helpers/jwt';

interface Props {
  account: string | undefined
}

const DMHeader = ({ account }: Props) => {
  const isSmallLayout = useIsSmallLayout()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const navigate = useNavigate()
  const { address: toAddr = '' } = useParams()

  const timerRef: { current: NodeJS.Timeout | null } = React.useRef(null)

  const [copiedAddr, setCopiedAddr] = React.useState(false)
  const [deleteModal, setDeleteModal] = React.useState(false)
  const [blockModal, setBlockModal] = React.useState(false)
  const [loading, setLoading] = React.useState(false);
  const [isVerifiedUser, setIsVerifiedUser] = React.useState<boolean>()

  const { data: name } = useGetNameQuery(toAddr)

  useEffect(() => {
    isVerified();
  }, [account])

  const onShowDeleteModal = () => {
    setBlockModal(false);
    setDeleteModal(true);
    onOpen();
  }

  const onShowBlockModal = () => {
    setDeleteModal(false);
    setBlockModal(true);
    onOpen();
  }
  
  async function copyToClipboard() {
    if (toAddr) {
      let didCopy = false

      try {
        await navigator.clipboard.writeText(toAddr)
        setCopiedAddr(true)
        didCopy = true
      } finally {
        if (timerRef?.current) window.clearTimeout(timerRef.current)

        if (didCopy) {
          timerRef.current = setTimeout(() => {
            setCopiedAddr(false)
          }, 3000)
        }
      }
    }
  }

  const isVerified = async () => {
    if (!account) {
      log('No account connected')
      return
    }
    
    try {
      await fetch(
        `${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/is_moderator/gooddollar/${toAddr}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getJwtForAccount(account)}`,
          }
      })
      .then((response) => response.json())
      .then((data) => {
        setIsVerifiedUser(data);
      })
    } catch (error) {
      console.error('🚨[GET][isVerified User]::', error)
    }
  }

  const deleteConvo = async () => {
    if (!account) {
      log('No account connected')
      return
    }

    setLoading(true);
    
    try {
      await fetch(
        `${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/deleteall_chatitems/${toAddr}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getJwtForAccount(account)}`,
          }
      })
      .then(() => {
        deleteToAddrFromInboxData(account, toAddr)
        setLoading(false)
        navigate("/dm")
        onClose()
      })
    } catch (error) {
      console.error('🚨[GET][Delete Convo]::', error)
    }
  }

  const blockUser = async () => {
    if (!account) {
      log('No account connected')
      return
    }

    setLoading(true);

    try {
      await fetch(
        `${ENV.REACT_APP_REST_API}/${ENV.REACT_APP_API_VERSION}/block_user/${toAddr}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getJwtForAccount(account)}`,
          }
        }
      )
      .then((data) => {
        setLoading(false);
        navigate("/dm")
        log('✅[GET][Block user]::', data)
        onClose()
      })
    } catch (error) {
      console.error('🚨[GET][Block user]::', error)
    }
  }

  return (
    <Box
      p={2}
      pb={3}
      borderBottom='1px solid var(--chakra-colors-lightgray-400)'
    >
      {isSmallLayout && (
        <Box mb={4} pl={20}>
          <Link to='/dm' style={{ textDecoration: 'none' }}>
            <Button colorScheme='gray' background='lightgray.300' size='sm'>
              <Flex alignItems='center'>
                <IconArrowLeft size={18} />
                <Text ml='1'>Back to Inbox</Text>
              </Flex>
            </Button>
          </Link>
        </Box>
      )}

      {toAddr && (
        <Flex pl={[20, 20, 0, 0]} alignItems='center' justifyContent='space-between'>
          <Flex alignItems='center'>
            <Avatar account={toAddr} />
            <Box ml={2}>
              {name ? (
                <Box>
                  <Flex alignItems='center'>
                    <Text fontWeight='bold' color='darkgray.800' mr={1} fontSize='md'>
                      {name}
                    </Text>
                    {isVerifiedUser && <MdVerified size={15} color='#63b3ed' stroke='1.5' /> }
                  </Flex>
                  <Flex alignItems='center'>
                    <Text onClick={() => copyToClipboard()} cursor='pointer' as='u' fontSize='sm' color='darkgray.500'>
                      {truncateAddress(toAddr)}
                    </Text>
                    <Box>
                      <Button
                        href={`https://etherscan.io/address/${toAddr}`}
                        target='_blank'
                        as={CLink}
                        size='xs'
                        ml={2}
                      >
                        <IconExternalLink
                          size={15}
                          color='var(--chakra-colors-lightgray-900)'
                          stroke='1.5'
                        />
                      </Button>
                    </Box>
                  </Flex>
                </Box>
              ) : (
                <Box mt={5}>
                  <Flex alignItems='center'>
                    <Text onClick={() => copyToClipboard()} cursor='pointer' as='u' fontWeight='bold' color='darkgray.800' fontSize='md'>
                      {truncateAddress(toAddr)}
                    </Text>
                    <Box>
                      <Button
                        href={`https://etherscan.io/address/${toAddr}`}
                        target='_blank'
                        as={CLink}
                        size='xs'
                        ml={2}
                      >
                        <IconExternalLink
                          size={15}
                          color='var(--chakra-colors-lightgray-900)'
                          stroke='1.5'
                        />
                      </Button>
                    </Box>
                  </Flex>
                </Box>  
              )}
            </Box>
          </Flex>
          <Box mt={5}>
            <Button
              onClick={() => onShowDeleteModal()}
              size='xs'
            >
              <FaRegTrashCan size={15} color='var(--chakra-colors-lightgray-900)' stroke='1.5' />
            </Button>
            <Button
              onClick={() => onShowBlockModal()}
              size='xs'
              ml={2}
            >
              <ImBlocked size={15} color='var(--chakra-colors-lightgray-900)' stroke='1.5' />
            </Button>
          </Box>
        </Flex>
      )}
        {deleteModal && 
          <Modal isOpen={isOpen} onClose={onClose} size="xs">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Delete Conversation</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <span>Are you sure you want to delete this conversation?</span>
              </ModalBody>

              <ModalFooter>
                <Button colorScheme='blackAlpha' mr={3} onClick={onClose}>
                  Close
                </Button>
                <Button colorScheme='red' onClick={deleteConvo}>
                  {loading ? (
                    <Spinner />
                  ) : (
                    <span>Delete</span>
                  )}
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        }
        {blockModal && 
          <Modal isOpen={isOpen} onClose={onClose} size="xs">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Block User</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <span>Are you sure you want to block this user?</span>
              </ModalBody>

              <ModalFooter>
                <Button colorScheme='blackAlpha' mr={3} onClick={onClose}>
                  Close
                </Button>
                <Button colorScheme='red' onClick={blockUser}>
                  {loading ? (
                    <Spinner />
                  ) : (
                    <span>Block</span>
                  )}
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        }
    </Box>
  )
}

export default DMHeader