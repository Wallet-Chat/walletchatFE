

export const fetchOwnedENS = async(account: string) => {
    if (process.env.REACT_APP_OPENSEA_API_KEY === undefined) {
       console.log('Missing OpenSea API Key')
       return
    }
    if (account) {
       console.log('No account detected')
    }
    let result = (await fetch(
       `https://api.opensea.io/api/v1/assets?owner=${account}&collection=ens`,
       {
          method: 'GET',
          headers: {
             Authorization: process.env.REACT_APP_OPENSEA_API_KEY,
          },
       }
    )).json()
    return result
 }