import * as LitJsSdk from '@lit-protocol/lit-node-client'
import * as Types from '@lit-protocol/types'
import storage from './extension-storage'
import { getAuthSig } from '@/helpers/lit'

const chain = 'ethereum'

export type AuthSig = Types.AuthSig

class Lit {
  litNodeClient: LitJsSdk.LitNodeClient | null = null

  authSig: AuthSig | undefined = undefined

  setAuthSig(account: string) {
    const authSig = getAuthSig(account)
    storage.set('lit-auth-signature', authSig)
    storage.set('lit-web3-provider', 'metamask')
    this.authSig = authSig
  }

  async connect() {
    this.litNodeClient = new LitJsSdk.LitNodeClient({ debug: false })
    await this.litNodeClient.connect()
  }

  async connectManual() {
    if (!this.litNodeClient) {
      await this.connect()
    }
  }

  async disconnect() {
    LitJsSdk.ethConnect.disconnectWeb3()
    this.litNodeClient = null
    this.authSig = undefined
  }

  async encryptString(
    account: string,
    str: string,
    unifiedAccessControlConditions: any
  ) {
    if (!this.litNodeClient) {
      await this.connectManual()
    }

    if (!this.authSig) {
      this.setAuthSig(account)
    }

    const { encryptedString, symmetricKey } = await LitJsSdk.encryptString(str)

    const encryptedSymmetricKey = await this.litNodeClient?.saveEncryptionKey({
      unifiedAccessControlConditions,
      symmetricKey,
      authSig: this.authSig,
      chain,
    })

    return {
      encryptedFile: encryptedString,
      encryptedSymmetricKey: LitJsSdk.uint8arrayToString(
        encryptedSymmetricKey,
        'base16'
      ),
    }
  }

  async decryptString(
    account: string,
    encryptedStr: any,
    encryptedSymmetricKey: any,
    unifiedAccessControlConditions: any
  ) {
    if (!this.litNodeClient) {
      await this.connectManual()
    }

    if (!this.authSig) {
      this.setAuthSig(account)
    }

    const symmetricKey: any = await this.litNodeClient?.getEncryptionKey({
      unifiedAccessControlConditions,
      toDecrypt: encryptedSymmetricKey,
      chain,
      authSig: this.authSig,
    })
    const decryptedFile = await LitJsSdk.decryptString(
      encryptedStr,
      symmetricKey
    )

    return { decryptedFile }
  }

  // when delegate.cash was added, the contract call condition changed the access control condition type
  // this is here to support legacy messages
  async decryptStringOrig(
    account: string,
    encryptedStr: any,
    encryptedSymmetricKey: any,
    _accessControlConditions: any
  ) {
    if (!this.litNodeClient) {
      await this.connectManual()
    }

    if (!this.authSig) {
      this.setAuthSig(account)
    }

    const symmetricKey: any = await this.litNodeClient?.getEncryptionKey({
      accessControlConditions: _accessControlConditions,
      toDecrypt: encryptedSymmetricKey,
      chain,
      authSig: this.authSig,
    })
    const decryptedFile = await LitJsSdk.decryptString(
      encryptedStr,
      symmetricKey
    )

    return { decryptedFile }
  }

  /**
   * This function encodes into base 64.
   * it's useful for storing symkeys and files in ceramic
   */
  encodeb64(uintarray: Uint8Array) {
    const b64 = Buffer.from(uintarray).toString('base64')
    return b64
  }

  /**
   * This function converts blobs to base 64.
   * for easier storage in ceramic
   */
  blobToB64(blob: Blob) {
    return LitJsSdk.blobToBase64String(blob)
  }

  b64toBlob(b64Data: string) {
    return LitJsSdk.base64StringToBlob(b64Data)
  }

  /**
   * This function decodes from base 64.
   * it's useful for decrypting symkeys and files in ceramic
   */
  decodeb64(b64String: string) {
    return new Uint8Array(Buffer.from(b64String, 'base64'))
  }
}

export default new Lit()
