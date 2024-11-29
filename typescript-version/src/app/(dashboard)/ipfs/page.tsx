/*
 * @Author: lixiaoming xiaoming.li@cy-tech.net
 * @Date: 2024-11-29 10:15:34
 * @LastEditors: lixiaoming xiaoming.li@cy-tech.net
 * @LastEditTime: 2024-11-29 16:35:27
 * @FilePath: /typescript-version/src/app/(dashboard)/ipfs/page.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
'use client'

import { useState, useEffect } from 'react'

import { useReadContract, useTransaction, useWriteContract } from 'wagmi'
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

export default function IPFSPage() {
  const [fileName, setFileName] = useState('')
  const [ipfsHash, setIpfsHash] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')

  // 使用writeContract hook
  const { writeContract, isLoading: writeLoading, data: writeData, error: writeError } = useWriteContract()

  // 读取合约数据
  const {
    data: storedHash,
    isError: readError,
    isLoading: readLoading,
    refetch
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: IPFSHashStorageABI,
    functionName: 'getIPFSHash',
    args: fileName ? [fileName] : undefined,
  })

  // 监听交易状态
  const { isLoading: txLoading, isSuccess: txSuccess } = useTransaction({
    hash: writeData,
  })

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
      refetch()
    }
  }, [txSuccess, refetch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (fileName && ipfsHash) {
      try {
        await writeContract({
          address: CONTRACT_ADDRESS,
          abi: IPFSHashStorageABI,
          functionName: 'upload',
          args: [fileName, ipfsHash]
        })
      } catch (error) {
        console.error('存储错误:', error)
        setSnackbarMessage('存储操作失败')
        setOpenSnackbar(true)
      }
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
              disabled={true}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={!fileName || !ipfsHash || writeLoading || txLoading || uploading}
            >
              {writeLoading || txLoading ? '处理中...' : '存储哈希'}
            </Button>
          </Box>

          {readLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress />
            </Box>
          ) : readError ? (
            <Alert severity="error" sx={{ my: 2 }}>
              读取合约数据失败
            </Alert>
          ) : storedHash ? (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                已存储的图片哈希值:
              </Typography>
              <Typography variant="body1">
                {storedHash as string}
              </Typography>
            </Box>
          ) : fileName && (
            <Typography color="text.secondary" sx={{ mt: 3 }}>
              该文件暂未存储哈希值
            </Typography>
          )}

          {writeError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              存储操作失败: {writeError.message}
            </Alert>
          )}
        </CardContent>
      </Card>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </Box>
  )
}
