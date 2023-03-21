import * as ENV from '@/constants/env'

export const walletChatEth =
  '0x17FA0A61bf1719D12C08c61F211A063a58267A19'.toLocaleLowerCase()

export const supportWallet = ENV.REACT_APP_SUPPORT_WALLET || walletChatEth
