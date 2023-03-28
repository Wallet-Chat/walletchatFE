import storage from 'utils/extension-storage'
import { getIsWidgetContext } from '@/utils/context'

export function getAutoConnect() {
  const isWidget = getIsWidgetContext()
  if (!isWidget) return true

  const widgetLogins = storage.get('widget-logins')
  const currentWidgetOrigin = storage.get('current-widget-origin')
  const alreadyLoggedIn = widgetLogins && widgetLogins.includes(currentWidgetOrigin)

  return Boolean(alreadyLoggedIn)
}
