import { MessageUIDataType, MessageUIType } from '../../../types/Message'

function groupedDays(messages: MessageUIType[]) {
   return messages.reduce((acc: MessageUIDataType, el: MessageUIType, i) => {
      const timestampGroup = new Date(el.timestamp).toDateString()
      if (acc[timestampGroup]) {
         return { ...acc, [timestampGroup]: acc[timestampGroup].concat([el]) }
      }
      return { ...acc, [timestampGroup]: [el] }
   }, {})
}

function generateItems(messages: MessageUIType[]) {
   const days = groupedDays(messages)
   const sortedDays = Object.keys(days).sort(
      (x, y) => Date.parse(x) - Date.parse(y)
   )
   const items = sortedDays.reduce((acc: MessageUIType[], date) => {
      const sortedMessages = days[date].sort(
         (x: MessageUIType, y: MessageUIType) =>
            Date.parse(x.timestamp.toString())
            - Date.parse(y.timestamp.toString())
      )
      const daySeparator: MessageUIType = { type: 'day', timestamp: (new Date(date)).toString() }
      return acc.concat([daySeparator, ...sortedMessages])
   }, [])
   return items
}

export default generateItems
