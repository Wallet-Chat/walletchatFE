export const getNormalizeAddress = (accounts: string[]) => {
   return accounts[0] ? accounts[0].toLowerCase() : null
}
