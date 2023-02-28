import * as LitJsSdk from "lit-js-sdk";

const client = new LitJsSdk.LitNodeClient()
const chain = 'ethereum'

/** 
 * Access control for a wallet with > 0.00001 ETH
 * const accessControlConditionsETHBalance = [
  {
    contractAddress: '',
    standardContractType: '',
    chain,
    method: 'eth_getBalance',
    parameters: [
      ':userAddress',
      'latest'
    ],
    returnValueTest: {
      comparator: '>=',
      value: '10000000000000'
    }
  }
]
 */

// Must hold at least one Monster Suit NFT (https://opensea.io/collection/monster-suit)
// const accessControlConditionsNFT = [
//     {
//       contractAddress: '0xabdfb84dae7923dd346d5b1a0c6fbbb0e6e5df64',
//       standardContractType: 'ERC721',
//       chain,
//       method: 'balanceOf',
//       parameters: [
//         ':userAddress'
//       ],
//       returnValueTest: {
//         comparator: '>',
//         value: '0'
//       }
//     }
//   ]

class Lit {
  litNodeClient

  async connect() {
    window.litConfig.debug = false
    await client.connect()
    this.litNodeClient = client
  }

  async connectManual() {
    if (!this.litNodeClient) {
      await this.connect()
    }
  }

  async encryptString(str, unifiedAccessControlConditions) {
    if (!this.litNodeClient) {
      await this.connect()
    }
    let authSig = localStorage.getItem("lit-auth-signature");
    if (!authSig) {
       authSig = await LitJsSdk.checkAndSignAuthMessage({ chain })
    }
    else {
      authSig = JSON.parse(authSig);
    }
    const { encryptedString, symmetricKey } = await LitJsSdk.encryptString(str)

    const encryptedSymmetricKey = await this.litNodeClient.saveEncryptionKey({
      unifiedAccessControlConditions: unifiedAccessControlConditions,
      symmetricKey,
      authSig,
      chain,
    })

    return {
      encryptedFile: encryptedString,
      encryptedSymmetricKey: LitJsSdk.uint8arrayToString(encryptedSymmetricKey, "base16")
    }
  }

  async decryptString(encryptedStr, encryptedSymmetricKey, unifiedAccessControlConditions) {
    if (!this.litNodeClient) {
      await this.connect()
    }
    let authSig = localStorage.getItem("lit-auth-signature");
    if (!authSig) {
     authSig = await LitJsSdk.checkAndSignAuthMessage({ chain })
    } else {
      authSig = JSON.parse(authSig);
    }
    const symmetricKey = await this.litNodeClient.getEncryptionKey({
      unifiedAccessControlConditions: unifiedAccessControlConditions,
      toDecrypt: encryptedSymmetricKey,
      chain,
      authSig
    })
    const decryptedFile = await LitJsSdk.decryptString(
      encryptedStr,
      symmetricKey
    );
    // eslint-disable-next-line no-console
    // console.log({
    //   decryptedFile
    // })
    return { decryptedFile }
  }

  //when delegate.cash was added, the contract call condition changed the access control condition type
  //this is here to support legacy messages
  async decryptStringOrig(encryptedStr, encryptedSymmetricKey, _accessControlConditions) {
    if (!this.litNodeClient) {
      await this.connect()
    }
    let authSig = localStorage.getItem("lit-auth-signature");
    if (!authSig) {
     authSig = await LitJsSdk.checkAndSignAuthMessage({ chain })
    } else {
      authSig = JSON.parse(authSig);
    }
    const symmetricKey = await this.litNodeClient.getEncryptionKey({
      accessControlConditions: _accessControlConditions,
      toDecrypt: encryptedSymmetricKey,
      chain,
      authSig
    })
    const decryptedFile = await LitJsSdk.decryptString(
      encryptedStr,
      symmetricKey
    );
    // eslint-disable-next-line no-console
    // console.log({
    //   decryptedFile
    // })
    return { decryptedFile }
  }

    /**
     * This function encodes into base 64.
     * it's useful for storing symkeys and files in ceramic
     * @param {Uint8Array} input a file or any data
     * @returns {string} returns a string of b64
     */
    encodeb64(uintarray) {
        var b64 = Buffer.from(uintarray).toString("base64");
        return b64;
    }

    /**
     * This function converts blobs to base 64.
     * for easier storage in ceramic
     * @param {Blob} blob what you'd like to encode
     * @returns {Promise<String>} returns a string of b64
     */
    async blobToB64(blob) {
        return await LitJsSdk.blobToBase64String(blob)
    }

    b64toBlob(b64Data) {
        return LitJsSdk.base64StringToBlob(b64Data)
    }

    /**
     * This function decodes from base 64.
     * it's useful for decrypting symkeys and files in ceramic
     * @param {blob} input a b64 string
     * @returns {string} returns the data as a string
     */
    decodeb64(b64String) {
        return new Uint8Array(Buffer.from(b64String, "base64"));
    }
}
export default new Lit()
