'use client'
import { useEffect, useState } from 'react'
import { useAccountEffect, useBlockNumber, useAccount, useBalance } from 'wagmi'
import { type UseBalanceReturnType } from 'wagmi'
export default function page() {
  const block = useBlockNumber()
  const account = useAccount()
  const [balance, setBalance] = useState<any>()

  useAccountEffect({
    onConnect(data) {
      console.log('Connected!', data)
    },
    onDisconnect() {
      console.log('Disconnected!')
    },
  })
  const balanceData: UseBalanceReturnType = useBalance({
    address: account?.address,
    unit: 'ether',
  })

  // useEffect(() => {
  //   if (balanceData) {
  //     setBalance(balanceData)
  //     console.log('balanceData', balanceData.data)
  //   }
  // }, [balanceData])
  return (
    <div>
      <div>当前区块：{`${block.data}`}</div>
      <div>当前余额：{`${balance && balance?.data?.formatted} ETH`}</div>
    </div>
  )
}
