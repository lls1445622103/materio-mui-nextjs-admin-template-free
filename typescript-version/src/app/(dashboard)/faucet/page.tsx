'use client'

import { useState, useEffect } from 'react'
import { useAccount, useChainId, useReadContract, useWriteContract } from 'wagmi'
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Snackbar,
  Stack
} from '@mui/material'

// 导入合约 ABI
import { FaucetABI } from '@/contracts/abis/Faucet'

const CONTRACT_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
const CHAIN_ID = 31337 // Hardhat 本地网络

const FaucetPage = () => {
  // 状态管理
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  })

  // 获取钱包地址和链ID
  const { address } = useAccount()
  const chainId = useChainId()
  const { writeContract } = useWriteContract()

  // 使用 useReadContract 读取合约状态
  const { data: canDrip = true } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: FaucetABI,
    functionName: 'dripCheck',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && chainId === CHAIN_ID
    }
  })

  const { data: lastDripTime = 0 } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: FaucetABI,
    functionName: 'getLastDripTime',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && chainId === CHAIN_ID
    }
  })

  // 领取代币
  const handleDrip = async () => {
    if (!address || chainId !== CHAIN_ID) return

    setLoading(true)
    try {
      const hash = await writeContract({
        address: CONTRACT_ADDRESS,
        abi: FaucetABI,
        functionName: 'drip',
        args: [address]
      })
      console.log('领取成功！交易哈希:', hash)
      setSnackbar({
        open: true,
        message: '领取成功！交易哈希: ' + hash,
        severity: 'success'
      })
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: '领取失败: ' + error.message,
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  // 计算剩余等待时间
  const getRemainingTime = () => {
    if (!lastDripTime) return '0'
    const waitTime = 5 * 60 // 5分钟等待时间
    const now = Math.floor(Date.now() / 1000)
    const remaining = Number(lastDripTime) + waitTime - now
    if (remaining <= 0) return '0'
    return `${Math.floor(remaining / 60)}分${remaining % 60}秒`
  }

  // 组件加载完成后设置 mounted 状态
  useEffect(() => {
    setMounted(true)
  }, [])

  // 在客户端渲染之前返回加载状态
  if (!mounted) {
    return (
      <Box sx={{ p: 5 }}>
        <Typography variant='h4' sx={{ mb: 4 }}>
          代币水龙头
        </Typography>
        <Card>
          <CardContent>
            <CircularProgress />
          </CardContent>
        </Card>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 5 }}>
      <Typography variant='h4' sx={{ mb: 4 }}>
        代币水龙头
      </Typography>

      <Card>
        <CardContent>
          <Stack spacing={3}>
            {!address ? (
              <Alert severity='info'>请先连接钱包</Alert>
            ) : chainId !== CHAIN_ID ? (
              <Alert severity='warning'>请切换到正确的网络</Alert>
            ) : (
              <>
                <Typography variant='body1'>
                  当前地址: {address}
                </Typography>
                <Typography variant='body1'>
                  剩余等待时间: {getRemainingTime()}
                </Typography>
                <Button
                  variant='contained'
                  onClick={handleDrip}
                  disabled={loading || !canDrip}
                  sx={{ mt: 2 }}
                >
                  {loading ? <CircularProgress size={24} /> : '领取代币'}
                </Button>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default FaucetPage
