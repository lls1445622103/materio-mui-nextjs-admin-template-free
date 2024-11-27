'use client'

import { useState, useEffect } from 'react'

import {
  useAccount,
  useBalance,
  useBlockNumber,
  useContractRead,
  useWriteContract,
  useWaitForTransactionReceipt
} from 'wagmi'
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material'
import HowToVoteIcon from '@mui/icons-material/HowToVote'

// 合约地址类型声明
const CONTRACT_ADDRESS = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9' as `0x${string}`

// 合约 ABI
const CONTRACT_ABI = [
  {
    inputs: [],
    name: 'getAllVotesOfCandiates',
    outputs: [
      {
        components: [
          { name: 'name', type: 'string' },
          { name: 'voteCount', type: 'uint256' }
        ],
        name: '',
        type: 'tuple[]'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: '_candidateIndex', type: 'uint256' }],
    name: 'vote',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getVotingStatus',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getRemainingTime',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: '', type: 'address' }],
    name: 'voters',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const

interface Candidate {
  name: string
  voteCount: bigint
}

export default function Page() {
  // const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const { address, isConnecting } = useAccount()

  const { data: blockNumber, isError: blockNumberError } = useBlockNumber({
    watch: true,
    onError: error => {
      console.error('获取区块号错误:', error)
    }
  })

  const { data: balance } = useBalance({
    address
  })

  // 读取候选人列表
  const { data: candidates } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAllVotesOfCandiates'
  })

  // 读取投票状态
  const { data: votingStatus } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getVotingStatus'
  })

  // 读取剩余时间
  const { data: remainingTime } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getRemainingTime'
  })

  // 执行投票
  const { data: hash, error, isPending, writeContract } = useWriteContract()

  // 等待交易确认
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash
  })

  // 检查是否已投票
  const { data: hasVoted } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'voters',
    args: [address as `0x${string}`],
    enabled: !!address
  })

  // 添加状态来跟踪当前正在投票的候选人索引
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null)

  // 添加错误提示关闭处理
  const handleCloseError = () => {
    setErrorMessage('')
  }

  // 添加交易成功后的处理
  useEffect(() => {
    if (isConfirmed) {
      setIsLoading(false)

      // 重新加载页面
      window.location.reload()
    }
  }, [isConfirmed])

  // 修改 handleVote 函数
  const handleVote = (candidateIndex: number) => {
    if (!address) {
      setErrorMessage('请先连接钱包')
      return
    }

    if (!votingStatus) {
      setErrorMessage('投票已结束')
      return
    }

    if (hasVoted) {
      setErrorMessage('您已经投过票了')
      return
    }

    // 设置当前正在投票的候选人索引
    setLoadingIndex(candidateIndex)

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'vote',
        args: [BigInt(candidateIndex)]
      })
    } catch (err) {
      setLoadingIndex(null)
      // setIsLoading(false)
      // setErrorMessage(`投票失败: ${err?.message || '未知错误'}`)
    }
  }

  useEffect(() => {
    console.log('votingStatus', votingStatus)
  }, [votingStatus])

  // 修改 useEffect
  useEffect(() => {
    if (isConfirmed || error) {
      setLoadingIndex(null)
    }

    if (isConfirmed) {
      window.location.reload()
    }

    if (error) {
      setErrorMessage(`交易失败: ${error?.message || '未知错误'}`)
    }
  }, [isConfirmed, error])

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant='body1' sx={{ mb: 2 }}>
        当前区块：
        {blockNumberError ? '获取失败' : blockNumber ? blockNumber.toString() : '加载中...'}
      </Typography>
      <Typography variant='body1' sx={{ mb: 2 }}>
        钱包地址：{isConnecting ? '连接中...' : address || '未连接钱包'}
      </Typography>
      <Typography variant='body1' sx={{ mb: 2 }}>
        当前余额：{balance ? `${balance.formatted} ${balance.symbol}` : '0 ETH'}
      </Typography>

      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant='h5' component='div' sx={{ mb: 2 }}>
            <HowToVoteIcon sx={{ mr: 1 }} />
            投票系统
          </Typography>

          <Typography variant='body1' sx={{ mb: 2 }}>
            投票状态：{votingStatus ? '进行中' : '已结束'}
          </Typography>
          <Typography variant='body1' sx={{ mb: 2 }}>
            剩余时间：{remainingTime ? `${Math.floor(Number(remainingTime) / 60)} 分钟` : '0 分钟'}
          </Typography>

          {hash && (
            <Alert severity='info' sx={{ mb: 2 }}>
              交易哈希: {hash}
            </Alert>
          )}

          {isConfirming && (
            <Alert severity='info' sx={{ mb: 2 }}>
              等待确认中...
            </Alert>
          )}

          {isConfirmed && (
            <Alert severity='success' sx={{ mb: 2 }}>
              交易已确认
            </Alert>
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
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {loadingIndex === index && (
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                  )}
                  <Button
                    variant='contained'
                    onClick={() => handleVote(index)}
                    disabled={!!(isPending || isConfirming || hasVoted || loadingIndex !== null)}
                    sx={{ ml: 2 }}
                  >
                    {hasVoted ? '已投票' :
                     loadingIndex === index ? '投票中...' :
                     isPending ? '确认中...' :
                     isConfirming ? '交易确认中...' :
                     '投票'}
                  </Button>
                </Box>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* 添加错误提示组件 */}
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity='error' sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}
