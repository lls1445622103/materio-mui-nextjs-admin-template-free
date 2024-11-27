'use client'

import { useState } from 'react'

import {
  useAccount,
  useBalance,
  useBlockNumber,
  useContractRead,
  useWriteContract,
  useWaitForTransactionReceipt
} from 'wagmi'
import { Box, Button, Card, CardContent, Typography, List, ListItem } from '@mui/material'
import HowToVoteIcon from '@mui/icons-material/HowToVote'

// 合约地址类型声明
const CONTRACT_ADDRESS = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9' as `0x${string}`

// 合约 ABI
const CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "getAllVotesOfCandiates",
    "outputs": [{ "components": [{ "name": "name", "type": "string" }, { "name": "voteCount", "type": "uint256" }], "name": "", "type": "tuple[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "_candidateIndex", "type": "uint256" }],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getVotingStatus",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getRemainingTime",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const

interface Candidate {
  name: string
  voteCount: bigint
}

export default function Page() {
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null)

  const { address, isConnecting } = useAccount()
  const { data: blockNumber } = useBlockNumber()

  const { data: balance } = useBalance({
    address,
  })

  // 读取候选人列表
  const { data: candidates } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAllVotesOfCandiates',
  })

  // 读取投票状态
  const { data: votingStatus } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getVotingStatus',
  })

  // 读取剩余时间
  const { data: remainingTime } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getRemainingTime',
  })

  // 执行投票
  const {
    data: hash,
    error,
    isPending,
    writeContract
  } = useWriteContract()

  // 等待交易确认
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed
  } = useWaitForTransactionReceipt({
    hash,
  })

  // 检查是否已投票
  const { data: hasVoted } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'voters',
    args: [address as `0x${string}`],
  })

  const handleVote = async (candidateIndex: number) => {
    if (!address) {
      alert('请先连接钱包')
      return
    }

    if (!votingStatus) {
      alert('投票已结束')
      return
    }

    if (hasVoted) {
      alert('您已经投过票了')
      return
    }

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'vote',
        args: [BigInt(candidateIndex)],
      })
    } catch (error: any) {
      if (error.message.includes("You have already voted")) {
        alert('您已经投过票了')
      } else if (error.message.includes("Voting has ended")) {
        alert('投票已结束')
      } else {
        alert('投票失败: ' + error.message)
      }
      console.error('投票错误:', error)
    }
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="body1" sx={{ mb: 2 }}>
        当前区块：{blockNumber ?? '加载中...'}
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        钱包地址：{isConnecting ? '连接中...' : (address || '未连接钱包')}
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        当前余额：{balance ? `${balance.formatted} ${balance.symbol}` : '0 ETH'}
      </Typography>

      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h5" component="div" sx={{ mb: 2 }}>
            <HowToVoteIcon sx={{ mr: 1 }} />
            投票系统
          </Typography>

          <Typography variant="body1" sx={{ mb: 2 }}>
            投票状态：{votingStatus ? '进行中' : '已结束'}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            剩余时间：{remainingTime ? `${Math.floor(Number(remainingTime) / 60)} 分钟` : '0 分钟'}
          </Typography>

          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              错误: {error.message}
            </Typography>
          )}

          {hash && (
            <Typography sx={{ mb: 2 }}>
              交易哈希: {hash}
            </Typography>
          )}

          {isConfirming && (
            <Typography sx={{ mb: 2 }}>
              等待确认中...
            </Typography>
          )}

          {isConfirmed && (
            <Typography color="success.main" sx={{ mb: 2 }}>
              交易已确认
            </Typography>
          )}

          <List>
            {(candidates as Candidate[])?.map((candidate, index) => (
              <ListItem
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Typography>
                  {candidate.name} - 得票数: {candidate.voteCount.toString()}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => handleVote(index)}
                  disabled={isPending || isConfirming || hasVoted}
                  sx={{ ml: 2 }}
                >
                  {hasVoted ? '已投票' :
                    isPending ? '确认中...' :
                      isConfirming ? '交易确认中...' :
                        '投票'}
                </Button>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  )
}

