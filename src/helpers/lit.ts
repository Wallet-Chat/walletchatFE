import storage from '@/utils/extension-storage'

export function getAccessControlConditions(fromaddr: string, toaddr: string) {
  const accessControlConditions = [
    {
      conditionType: 'evmBasic',
      contractAddress: '',
      standardContractType: '',
      chain: 'ethereum',
      method: '',
      parameters: [':userAddress'],
      returnValueTest: {
        comparator: '=',
        value: toaddr,
      },
    },
    { operator: 'or' },
    {
      conditionType: 'evmBasic',
      contractAddress: '',
      standardContractType: '',
      chain: 'ethereum',
      method: '',
      parameters: [':userAddress'],
      returnValueTest: {
        comparator: '=',
        value: fromaddr,
      },
    },
    { operator: 'or' }, // delegate.cash full wallet delegation
    {
      conditionType: 'evmContract',
      contractAddress: '0x00000000000076A84feF008CDAbe6409d2FE638B',
      functionName: 'checkDelegateForAll',
      functionParams: [':userAddress', toaddr],
      functionAbi: {
        inputs: [
          {
            name: 'delegate',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'vault',
            type: 'address',
            internalType: 'address',
          },
        ],
        name: 'checkDelegateForAll',
        outputs: [
          {
            name: '',
            type: 'bool',
          },
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function',
      },
      chain: 'ethereum',
      returnValueTest: {
        key: '',
        comparator: '=',
        value: 'true',
      },
    },
    { operator: 'or' }, // delegate.cash full wallet delegation
    {
      conditionType: 'evmContract',
      contractAddress: '0x00000000000076A84feF008CDAbe6409d2FE638B',
      functionName: 'checkDelegateForAll',
      functionParams: [':userAddress', fromaddr],
      functionAbi: {
        inputs: [
          {
            name: 'delegate',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'vault',
            type: 'address',
            internalType: 'address',
          },
        ],
        name: 'checkDelegateForAll',
        outputs: [
          {
            name: '',
            type: 'bool',
          },
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function',
      },
      chain: 'ethereum',
      returnValueTest: {
        key: '',
        comparator: '=',
        value: 'true',
      },
    },
  ]

  return accessControlConditions
}

export function getAuthSig(account: string) {
  const authSigByAccount = storage.get('lit-auth-signature-by-account')

  if (authSigByAccount && authSigByAccount[account.toLocaleLowerCase()]) {
    return authSigByAccount[account.toLocaleLowerCase()]
  }
}
