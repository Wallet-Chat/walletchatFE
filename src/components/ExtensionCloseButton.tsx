import { IconX } from '@tabler/icons'
import { Button, Flex } from '@chakra-ui/react'
import { isChromeExtension } from '@/helpers/chrome'
import { getIsWidgetContext } from '@/utils/context'

const isWidget = getIsWidgetContext()
const isExtension = isChromeExtension()

function ExtensionCloseButton() {
  // if (!isExtension && !isWidget) {
  //   return null
  // }

  return (
    <Flex textAlign='right' position='fixed' top={0} right={0} zIndex={10000}>
      <Button
        borderBottomLeftRadius='lg'
        borderBottomRightRadius='lg'
        borderTopLeftRadius={0}
        borderTopRightRadius={0}
        background='lightgray.500'
        py={0}
        px={1}
        h='4'
        w='12'
        onClick={() => {
          if (isExtension) { 
            window.close();
          } else if (window.parent) {
            window.parent.postMessage({ target: 'close_widget' }, '*');
          } else {
            window.ReactNativeWebView.postMessage(JSON.stringify({ target: 'close_widget' }));
          }
        }}
      >
        <IconX size={14} color='var(--chakra-colors-darkgray-700)' />
      </Button>
    </Flex>
  )
}

export default ExtensionCloseButton
