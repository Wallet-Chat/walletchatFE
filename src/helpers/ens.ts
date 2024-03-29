// @ts-ignore
import namehash from '@ensdomains/eth-ens-namehash'
import Web3 from 'web3'
import { ethers } from 'ethers'
import * as ENV from '@/constants/env'
import { Network, Alchemy } from 'alchemy-sdk'
import contractABI from './ENS.json'
import { log } from '@/helpers/log'

export async function reverseENSLookup(address: string) {
	const web3 = new Alchemy({
		apiKey: ENV.REACT_APP_ALCHEMY_API_KEY_ETHEREUM,
		network: Network.ETH_MAINNET,
	}
	)

	let lookup = address.toLowerCase().substring(0, 2) + '.addr.reverse'
	let ResolverContract = await web3.eth.ens.getResolver(lookup)
	log('lookup', lookup, address, ResolverContract)
	let nh = namehash.hash(lookup)
	try {
		let name = await ResolverContract.methods.name(nh).call()
		if (name && name.length) {
			const verifiedAddress = await web3.eth.ens.getAddress(name)
			log(verifiedAddress)
			if (
				verifiedAddress &&
				verifiedAddress.toLowerCase() === address.toLowerCase()
			) {
				return name
			}
		}
	} catch (e) {}
}

export async function registrantENSLookup(domainName: string) {
	const web3 = createAlchemyWeb3(
		'https://eth-mainnet.alchemyapi.io/v2/' +
			ENV.REACT_APP_ALCHEMY_API_KEY_ETHEREUM
	)

	const BigNumber = ethers.BigNumber
	const utils = ethers.utils
	const labelHash = utils.keccak256(utils.toUtf8Bytes(domainName.split('.')[0]))
	const derivedTokenId = BigNumber.from(labelHash).toString()

	const contractAddress = '0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85'
	const ENSRegistrarContract = new web3.eth.Contract(
		contractABI,
		contractAddress
	)
	try {
		log('ens token id?: ' + derivedTokenId)
		let registrant = await ENSRegistrarContract.methods
			.ownerOf(derivedTokenId)
			.call()
		log(domainName + ' is owned by: ' + registrant)
		return registrant
	} catch (e) {
		log(e)
		return 'error'
	}
}
