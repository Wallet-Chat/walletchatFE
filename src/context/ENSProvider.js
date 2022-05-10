import React from 'react'
import ENS, { getEnsAddress } from '@ensdomains/ensjs'
import createMetaMaskProvider from 'metamask-extension-provider'

export const ENSContext = React.createContext()
export const useENS = () => React.useContext(ENSContext)

export function withENS(Component) {
   const ENSComponent = (props) => (
      <ENSContext.Consumer>
         {(contexts) => <Component {...props} {...contexts} />}
      </ENSContext.Consumer>
   )
   return ENSComponent
}

const getProvider = () => {
    if (window.ethereum) {
        console.log('found window.ethereum>>')
        return window.ethereum
     } else {
        const provider = createMetaMaskProvider()
        return provider
     }
}

const provider = getProvider()

const ens = new ENS({ provider, ensAddress: getEnsAddress('1') })

const ENSProvider = React.memo(({ children }) => {

    const getENSFromAddress = async (address) => {
        let name = await ens.getName(address)
        // Check to be sure the reverse record is correct.
        if(address !== await ens.name(name).getAddress()) {
            name = null;
        }
        if (name !== null) {
            return name
        } else {
            return null
        }
    }

   return (
      <ENSContext.Provider
         value={{
            getENSFromAddress
         }}
      >
         {children}
      </ENSContext.Provider>
   )
})

export default ENSProvider
