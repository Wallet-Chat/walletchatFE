import React from 'react'

export const UnreadCountContext = React.createContext()
export const useUnreadCount = () => React.useContext(UnreadCountContext)

export function withUnreadCount(Component) {
   const WalletComponent = (props) => (
      <UnreadCountContext.Consumer>
         {(contexts) => <Component {...props} {...contexts} />}
      </UnreadCountContext.Consumer>
   )
   return WalletComponent
}

const UnreadCountProvider = React.memo(({ children }) => {
   const [unreadCount, setUnreadCount] = React.useState(0)

   return (
      <UnreadCountContext.Provider
         value={{
            unreadCount,
            setUnreadCount
         }}
      >
         {children}
      </UnreadCountContext.Provider>
   )
})

export default UnreadCountProvider
