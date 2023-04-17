import { Alert, Box, Text } from '@chakra-ui/react'

const VerifySuccess = () => {
  return (
    <Box p={6} pt={16} background='white' width='100%'>
      <form>
        <Text fontSize='3xl' fontWeight='bold' maxWidth='280px' mb={4}>
          Verify Email Success
          <br />
        </Text>
      </form>
      <Alert status='success' variant='solid' mt={4}>
        Email verification succeeded! You are now eligible to recieve
        notifications.
      </Alert>
      <Alert status='success' variant='solid' mt={4}>
        You may close this page.
      </Alert>
    </Box>
  )
}

export default VerifySuccess
