import storage from 'utils/extension-storage'
import { AppAPI } from 'react-wallet-chat/dist/src/types'
import * as ENV from '@/constants/env'
import { getIsWidgetContext } from '@/utils/context'

export const walletChatEth =
  '0x17FA0A61bf1719D12C08c61F211A063a58267A19'.toLocaleLowerCase()

export function getAutoConnect() {
  const isWidget = getIsWidgetContext()
  if (!isWidget) return true

  const widgetLogins = storage.get('widget-logins')
  const currentWidgetOrigin = storage.get('current-widget-origin')
  const alreadyLoggedIn =
    widgetLogins && widgetLogins.includes(currentWidgetOrigin)

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

  if (
    currentWidgetOrigin.toLowerCase().includes('gooddollar') ||
    currentWidgetOrigin.toLowerCase().includes('good-protocol')
  ) {
    return '_GOODDOLLAR'
  }

  return null
}

export function getCommunity() {
  const suffix = getWidgetEnvSuffix()
  return suffix ? ENV[`REACT_APP_DEFAULT_COMMUNITY${suffix}`] : 'walletchat'
}
export function getSupportWallet() {
  const suffix = getWidgetEnvSuffix()
  return suffix ? ENV[`REACT_APP_SUPPORT_WALLET${suffix}`] : walletChatEth
}
export function getWidgetUrl() {
  const suffix = getWidgetEnvSuffix(true)
  return suffix && ENV[`REACT_APP_APP_URL${suffix}`]
}

export function postMessage(message: AppAPI) {
  window.parent.postMessage(message, '*')
}
