export const IPFSHashStorageABI = [
  {
    inputs: [
      {
        internalType: 'string',
        name: 'fileName',
        type: 'string'
      }
    ],
    name: 'getIPFSHash',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'fileName',
        type: 'string'
      }
    ],
    name: 'isFileStored',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'fileName',
        type: 'string'
      },
      {
        internalType: 'string',
        name: 'ipfsHash',
        type: 'string'
      }
    ],
    name: 'upload',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const
