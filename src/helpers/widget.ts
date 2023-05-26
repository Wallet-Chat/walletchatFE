import storage from 'utils/extension-storage'
import { AppAPI } from 'react-wallet-chat/dist/src/types'
import * as ENV from '@/constants/env'
import { getIsWidgetContext } from '@/utils/context'
import { log } from '@/helpers/log'

export const walletChatEth =
  '0x17FA0A61bf1719D12C08c61F211A063a58267A19'.toLocaleLowerCase()

export function getAutoConnect() {
  const isWidget = getIsWidgetContext()
  if (!isWidget) return true

  const widgetLogins: { [origin: string]: string } =
    storage.get('widget-logins')
  const currentWidgetOrigin = storage.get('current-widget-origin')
  const currentWidgetProvider = storage.get('current-widget-provider')
  const alreadyLoggedIn =
    widgetLogins &&
    widgetLogins[currentWidgetOrigin] &&
    widgetLogins[currentWidgetOrigin] === currentWidgetProvider

  return Boolean(alreadyLoggedIn)
}

function getWidgetEnvSuffix(addDev?: boolean) {
  const isWidget = getIsWidgetContext()
  if (!isWidget) return null

  const currentWidgetOrigin = storage.get('current-widget-origin')
  if (!currentWidgetOrigin) return null

  if (addDev && currentWidgetOrigin.toLowerCase().includes('localhost')) {
    return '_LOCALHOST'
  }

  if (addDev && currentWidgetOrigin.toLowerCase().includes('testhost')) {
    return '_TESTHOST'
  }

  if (
    currentWidgetOrigin.toLowerCase().includes('gooddollar') ||
    currentWidgetOrigin.toLowerCase().includes('good-protocol')
  ) {
    return '_GOODDOLLAR'
  }

  if (currentWidgetOrigin.toLowerCase().includes('nft.walletchat.fun')) {
    return '_NFT_DEMO'
  }

  if (currentWidgetOrigin.toLowerCase().includes('mysticswap.io')) {
    return '_MYSTICSWAP'
  }

  if (currentWidgetOrigin.toLowerCase().includes('openpeer.xyz')) {
    return '_OPENPEER'
  }

  if (currentWidgetOrigin.toLowerCase().includes('sso.walletchat.fun')) {
    return '_SSO'
  }

  return null
}

export function getCommunity() {
  const suffix = getWidgetEnvSuffix()
  const defaultCommunity = suffix ? ENV[`REACT_APP_DEFAULT_COMMUNITY${suffix}`] : 'walletchat'
  log("Default community: ", defaultCommunity)
  return defaultCommunity
}
export function getSupportWallet() {
  const suffix = getWidgetEnvSuffix()
  return suffix ? ENV[`REACT_APP_SUPPORT_WALLET${suffix}`] : walletChatEth
}
export function getWidgetUrl() {
  const suffix = getWidgetEnvSuffix(true)
  return suffix && ENV[`REACT_APP_APP_URL${suffix}`]  //TODO can we have local .env overrride the vercel setting for debug/localhost
}
export function getWidgetOriginName() {
  const suffix = getWidgetEnvSuffix(true)
  return suffix && ENV[`REACT_APP_ORIGIN_NAME${suffix}`]
}

export function postMessage(message: AppAPI) {
  window.parent.postMessage(message, '*')
}
