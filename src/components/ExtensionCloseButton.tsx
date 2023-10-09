import { IconX } from '@tabler/icons'
import { Button, Flex } from '@chakra-ui/react'
import { isChromeExtension } from '@/helpers/chrome'
import { getIsWidgetContext } from '@/utils/context'
import * as ENV from '@/constants/env'

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
          //debug Android App
          fetch(`${ENV.REACT_APP_REST_API}/debug_print`, {
            body: JSON.stringify({
              event: "onClick() occured!!!!!"
            }),
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
          })
          //end debug android app webview
          if (isExtension) { 
            //debug Android App
            fetch(`${ENV.REACT_APP_REST_API}/debug_print`, {
              body: JSON.stringify({
                event: "isExtension"
              }),
              headers: { 'Content-Type': 'application/json' },
              method: 'POST',
            })
            //end debug android app webview
            window.close();
          } else if (window.parent) {
            //debug Android App
          fetch(`${ENV.REACT_APP_REST_API}/debug_print`, {
            body: JSON.stringify({
              event: "window.parent was defined..." + window.parent
            }),
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
          })
          //end debug android app webview
            window.parent.postMessage({ target: 'close_widget' }, '*');
          } else {
            const message = {
              target: 'close_widget',
              data: 'No need to have this',
            };
             //debug Android App
             fetch(`${ENV.REACT_APP_REST_API}/debug_print`, {
              body: JSON.stringify({
                event: "close_widget case"
              }),
              headers: { 'Content-Type': 'application/json' },
              method: 'POST',
            })
            //end debug android app webview
            window.ReactNativeWebView.postMessage(JSON.stringify(message));
          }
        }}
      >
        <IconX size={14} color='var(--chakra-colors-darkgray-700)' />
      </Button>
    </Flex>
  )
}

export default ExtensionCloseButton
