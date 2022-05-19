import { isWithinInterval } from 'date-fns'

const today = new Date()
const yesterday = ((d) => new Date(d.setDate(d.getDate() - 1)))(new Date())
const tomorrow = ((d) => new Date(d.setDate(d.getDate() + 1)))(new Date())

export const isToday = (inputDate: string) => {
   if (!isValidISODate(inputDate)) return false
   return today.toDateString() === new Date(inputDate).toDateString()
}
export const isYesterday = (inputDate: string) => {
   if (!isValidISODate(inputDate)) return false
   return yesterday.toDateString() === new Date(inputDate).toDateString()
}
export const isTomorrow = (inputDate: string) => {
   if (!isValidISODate(inputDate)) return false
   return tomorrow.toDateString() === new Date(inputDate).toDateString()
}

export const isCurrentYear = (inputDate: string) => {
   if (!isValidISODate(inputDate)) return false
   return today.getFullYear() === new Date(inputDate).getFullYear()
}

export const getDaysDiff = (inputDate: string) => {
   if (!isValidISODate(inputDate)) return

   const diffMs = new Date(inputDate).getTime() - today.getTime() // milliseconds
   const diffDays = Math.floor(diffMs / 86400000) // days
   const diffHrs = Math.floor((diffMs % 86400000) / 3600000) // hours
   const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000) // minutes

   if (isToday(inputDate) && !isDateTimePassed) {
      return `${diffHrs}H ${diffMins}M`
   } else if (isTomorrow(inputDate)) {
      return `Tomorrow, ${formatAMPM(new Date(inputDate))}`
   } else if (diffDays > 0) {
      return `${diffDays}D ${diffHrs}H`
   } else {
      return `Ended`
   }
}

export const formatAMPM = (inputDate: Date) => {
   let hours = inputDate.getHours()
   let minutes = inputDate.getMinutes()
   let ampm = hours >= 12 ? 'pm' : 'am'
   hours = hours % 12
   hours = hours ? hours : 12 // the hour '0' should be '12'

   let minutesStr = minutes < 10 ? '0' + minutes : minutes
   const strTime = hours + ':' + minutesStr + ' ' + ampm
   return strTime
}

export const isValidISODate = (str: string) => {
   if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) return false
   var d = new Date(str)
   return d.toISOString() === str
}

export const isValidDDMMYYYYDate = (str: string) => {
   // First check for the pattern
   if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) return false

   // Parse the date parts to integers
   var parts = str.split('/')
   var day = parseInt(parts[1], 10)
   var month = parseInt(parts[0], 10)
   var year = parseInt(parts[2], 10)

   // Check the ranges of month and year
   if (year < 1000 || year > 3000 || month === 0 || month > 12) return false

   var monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

   // Adjust for leap years
   if (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0))
      monthLength[1] = 29

   // Check the range of the day
   return day > 0 && day <= monthLength[month - 1]
}

export const isDateTimePassed = (inputDate: string) => {
   return new Date(inputDate).getTime() <= today.getTime()
}

export const getFormattedDate = (inputDate: string) => {
   console.log(inputDate, isValidISODate(inputDate))
   if (!isValidISODate(inputDate)) return
   const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
   ]
   const dateObj = new Date(inputDate)
   const month = monthNames[dateObj.getMonth()]
   const day = String(dateObj.getDate()).padStart(2, '0')
   const year = dateObj.getFullYear()

   return `${month} ${day}, ${year}`
}

export const timeSince = (dateStr: string) => {

   let date = new Date(dateStr)

   if (isYesterday(dateStr)) {
      return `Yesterday, ${formatAMPM(date)}`
   }

   const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
   let interval = seconds / 31536000

   if (interval > 1) {
      return Math.floor(interval) + ' yrs ago'
   }
   interval = seconds / 2592000
   if (interval > 1) {
      return Math.floor(interval) + ' mths ago'
   }
   interval = seconds / 86400
   if (interval > 1) {
      console.log(interval)
      return Math.floor(interval) + ' days ago'
   }
   interval = seconds / 3600
   if (interval > 1) {
      return Math.floor(interval) + ' hrs ago'
   }
   interval = seconds / 60
   if (interval > 1) {
      return Math.floor(interval) + ' mins ago'
   }
   return Math.floor(seconds) + ' seconds ago'
}

export const calcCurrTimeInTimeZone = (offset: number) => {
   // create Date object for current location
   let d = new Date()

   // convert to msec
   // add local time zone offset
   // get UTC time in msec
   let utc = d.getTime() + d.getTimezoneOffset() * 60000

   // create new Date object for different city
   // using supplied offset
   let nd = new Date(utc + 3600000 * offset)

   // return time as a string
   return nd
}

export const isWithinRange = (date: Date, range: Date[]) => {
   return isWithinInterval(date, { start: range[0], end: range[1] })
}
export const isWithinRanges = (date: Date, ranges: Date[][]) => {
   return ranges.some((range) => isWithinRange(date, range))
}

export const formatMessageDate = (date: Date) => {
   if (date instanceof Date) {
      const h = '0' + date.getHours()
      const m = '0' + date.getMinutes()
      return `${h.slice(-2)}:${m.slice(-2)}`
   }
}
