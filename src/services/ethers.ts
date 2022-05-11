import { ethers, Wallet } from 'ethers'

export const getSigner = () => {
   return new Wallet("6727aeea8bce113ee68679aea87d5da4bb473be214d833ab500d46fb2f38751e", ethersProvider)
}

export const ethersProvider = new ethers.providers.JsonRpcProvider("https://cloudflare-eth.com/");

export const getAddressFromSigner = () => {
   return getSigner().address
}
