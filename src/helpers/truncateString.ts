export function truncateString(str: string, num: number) {
   if (str.length <= num) {
      return str
   }
   return str.slice(0, num) + '...'
}


export function truncateAddress(str: string | undefined) {
   if (str === undefined) return str
   if (str.length <= 12) {
      return str
   }
   return str.slice(0, 7) + '...' + str.slice(str.length-5, str.length);
}

export function truncateAddressMore(str: string | undefined) {
   if (str === undefined) return str
   if (str.length <= 5) {
      return str
   }
   return str.slice(0, 5);
}