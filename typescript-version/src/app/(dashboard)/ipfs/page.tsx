/*
 * @Author: lixiaoming xiaoming.li@cy-tech.net
 * @Date: 2024-11-29 10:15:34
 * @LastEditors: lixiaoming xiaoming.li@cy-tech.net
 * @LastEditTime: 2024-11-29 16:54:51
 * @FilePath: /typescript-version/src/app/(dashboard)/ipfs/page.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
'use client'

import { useState, useEffect } from 'react'

import { useReadContract, useTransaction, useWriteContract, useAccount, useChainId } from 'wagmi'
import { readContract, writeContract as wagmiWriteContract } from '@wagmi/core'
import { getPublicClient } from 'wagmi/actions'
import { wagmiConfig } from '@/components/wallet/wagmi'
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  Avatar,
  LinearProgress,
  Stack
} from '@mui/material'
import { styled } from '@mui/material/styles'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DeleteIcon from '@mui/icons-material/Delete'

import { IPFSHashStorageABI } from '@/contracts/abis/IPFSHashStorage'

const CONTRACT_ADDRESS = '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9'
// const CONTRACT_ADDRESS = '0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0'

// 添加 GoChain Testnet chainId
const GOCHAIN_TESTNET_CHAIN_ID = 31337

// 自定义上传区域样式
const UploadBox = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  textAlign: 'center',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}))

const IPFSPage = () => {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const [file, setFile] = useState<File | null>(null)
  const [ipfsHash, setIpfsHash] = useState('')
  const [fileName, setFileName] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const chainId = useChainId()

  // 添加钱包连接状态检查
  const { address, isConnected } = useAccount()

  // 使用writeContract hook
  const { writeContract, writeContractAsync, isPending: writeLoading, data: writeData, error: writeError } = useWriteContract()

  // 监听交易状态
  const { isLoading: txLoading, isSuccess: txSuccess } = useTransaction({
    hash: writeData,
  })

  // 监控钱包连接状态
  useEffect(() => {
    console.log('Wallet status:', { address, isConnected, chainId })

    if (!isConnected) {
      setSnackbarMessage('请先连接钱包')
      setOpenSnackbar(true)
    }
  }, [isConnected, address, chainId])

  // 监控合约写入错误
  useEffect(() => {
    if (writeError) {
      console.error('Contract write error:', writeError)
      setSnackbarMessage('写入合约数据失败')
      setOpenSnackbar(true)
    }
  }, [writeError])

  // 处理文件选择
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]

    if (selectedFile) {
      // 验证文件类型
      if (!selectedFile.type.startsWith('image/')) {
        setSnackbarMessage('请选择图片文件')
        setOpenSnackbar(true)
        return
      }

      setFile(selectedFile)
      setFileName(selectedFile.name)

      // 创建预览URL
      const url = URL.createObjectURL(selectedFile)
      setPreviewUrl(url)

      // 上传到IPFS
      await uploadToIPFS(selectedFile)
    }
  }

  // 上传到IPFS
  const uploadToIPFS = async (file: File) => {
    try {
      setUploading(true)
      setUploadProgress(0)

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('上传失败')
      }

      const data = await response.json()
      setIpfsHash(data.ipfsHash)
      setSnackbarMessage('图片上传成功！')
      setOpenSnackbar(true)
      setUploadProgress(100)

    } catch (error) {
      console.error('IPFS上传错误:', error)
      setSnackbarMessage('图片上传失败')
      setOpenSnackbar(true)
    } finally {
      setUploading(false)
    }
  }

  // 处理文件删除
  const handleFileDelete = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    setFile(null)
    setFileName('')
    setIpfsHash('')
    setPreviewUrl(null)
    setUploadProgress(0)
  }

  // 处理交易成功
  useEffect(() => {
    if (txSuccess) {
      setSnackbarMessage('文件哈希存储成功！')
      setOpenSnackbar(true)
      handleFileDelete()
    }
  }, [txSuccess])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected) {
      setSnackbarMessage('请先连接钱包')
      setOpenSnackbar(true)
      return
    }

    if (!fileName || !ipfsHash) {
      setSnackbarMessage('请先上传文件')
      setOpenSnackbar(true)
      return
    }

    if (chainId !== GOCHAIN_TESTNET_CHAIN_ID) {
      setSnackbarMessage('请切换到 GoChain Testnet 网络')
      setOpenSnackbar(true)
      return
    }

    try {
      console.log('开始存储文件:', fileName, ipfsHash)

      // 如果文件不存在，则进行存储
      const res = await writeContractAsync({
        address: CONTRACT_ADDRESS as `0x${string}`,  // 确保地址格式正确
        abi: IPFSHashStorageABI,
        functionName: 'upload',
        args: [fileName, ipfsHash]
      })

      console.log('交易hash:', res)
      setSnackbarMessage('文件存储交易已发送！')
      setOpenSnackbar(true)
    } catch (error: any) {
      console.error('存储错误:', error)

      let errorMessage = '存储操作失败'
      if (error.message.includes('user rejected')) {
        errorMessage = '用户取消了交易'
      }

      setSnackbarMessage(errorMessage)
      setOpenSnackbar(true)
    }
  }

  const [queryFileName, setQueryFileName] = useState('')

  const { data: storedHash, isError, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: IPFSHashStorageABI,
    functionName: 'getIPFSHash',
    args: ['']  // 初始为空字符串
  })

  const handleQueryHash = async (fileName: string) => {
    if (!fileName) {
      setSnackbarMessage('请先输入文件名')
      setOpenSnackbar(true)
      return
    }

    if (chainId !== GOCHAIN_TESTNET_CHAIN_ID) {
      setSnackbarMessage('请切换到 GoChain Testnet 网络')
      setOpenSnackbar(true)
      return
    }

    try {
      const result = await readContract(wagmiConfig, {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: IPFSHashStorageABI,
        functionName: 'getIPFSHash',
        args: [fileName]
      })

      console.log('查询结果:', result)

      if (!result || result === '0x' || result === '') {
        setSnackbarMessage(`未找到文件 "${fileName}" 的哈希值记录，请确认：\n1. 文件名是否正确\n2. 是否已经上传过该文件`)
        setOpenSnackbar(true)
        return
      }

      setSnackbarMessage(`文件 "${fileName}" 的IPFS哈希值：${result}`)
      setOpenSnackbar(true)
    } catch (error: any) {
      console.error('查询错误:', error)
      setSnackbarMessage('查询失败，请确认合约地址和网络连接是否正确')
      setOpenSnackbar(true)
    }
  }

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false)
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            IPFS图片存储
          </Typography>

          {/* 添加钱包连接状态显示 */}
          <Box sx={{ mb: 2 }}>
            <Typography color={isConnected ? 'success.main' : 'error.main'}>
              {isConnected ? '钱包已连接' : '请先连接钱包'}
            </Typography>
            {isConnected && (
              <Typography variant="body2" color="textSecondary">
                Chain ID: {chainId}
              </Typography>
            )}
          </Box>

          {/* 图片上传区域 */}
          <Box sx={{ mb: 4 }}>
            {!file ? (
              <UploadBox component="label">
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFileSelect}
                  disabled={uploading}
                />
                <Stack spacing={2} alignItems="center">
                  <CloudUploadIcon color="primary" sx={{ fontSize: 48 }} />
                  <Typography>
                    {uploading ? '上传中...' : '点击或拖拽图片到此处'}
                  </Typography>
                </Stack>
              </UploadBox>
            ) : (
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={previewUrl || ''}
                  variant="rounded"
                  sx={{ width: '100%', height: 200, objectFit: 'cover' }}
                />
                <IconButton
                  onClick={handleFileDelete}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'background.paper'
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            )}

            {uploading && (
              <LinearProgress
                variant="determinate"
                value={uploadProgress}
                sx={{ mt: 2 }}
              />
            )}
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ '& > :not(style)': { my: 2 } }}>
            <TextField
              fullWidth
              placeholder="文件名"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              variant="outlined"
              sx={{ mb: 2 }}
              disabled={writeLoading || txLoading}
            />
            <TextField
              fullWidth
              placeholder="IPFS哈希值"
              value={ipfsHash}
              onChange={(e) => setIpfsHash(e.target.value)}
              variant="outlined"
            />
            <Button
              onClick={handleSubmit}
              type="submit"
              variant="contained"
              color="primary"
              fullWidth

            >
              存储
            </Button>
          </Box>

          {/* 新增查询区域 */}
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                查询IPFS哈希值
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  fullWidth
                  label="输入要查询的文件名"
                  value={queryFileName}
                  onChange={(e) => setQueryFileName(e.target.value)}
                  variant="outlined"
                  size="small"
                />
                <Button
                  onClick={() => handleQueryHash(queryFileName)}
                  variant="contained"
                  color="primary"
                  disabled={!isConnected || !queryFileName}
                >
                  查询
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Snackbar
            open={openSnackbar}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            message={snackbarMessage}
          />
        </CardContent>
      </Card>
    </Box>
  )
}

export default IPFSPage
