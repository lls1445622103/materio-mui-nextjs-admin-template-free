/*
 * @Author: lixiaoming xiaoming.li@cy-tech.net
 * @Date: 2024-11-29 16:35:10
 * @LastEditors: lixiaoming xiaoming.li@cy-tech.net
 * @LastEditTime: 2024-11-29 16:40:27
 * @FilePath: /typescript-version/src/app/api/upload/route.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(request: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_PINATA_API_KEY || !process.env.NEXT_PUBLIC_PINATA_SECRET_KEY) {
      console.error('Pinata API密钥未配置')

      return NextResponse.json({ error: 'Pinata API密钥未配置' }, { status: 500 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: '没有文件上传' }, { status: 400 })
    }

    console.log('开始上传文件:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    })

    // 创建新的 FormData
    const pinataFormData = new FormData()
    pinataFormData.append('file', file)

    const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', pinataFormData, {
      headers: {
        'pinata_api_key': process.env.NEXT_PUBLIC_PINATA_API_KEY,
        'pinata_secret_api_key': process.env.NEXT_PUBLIC_PINATA_SECRET_KEY,
      },
      maxBodyLength: Infinity,
    })

    console.log('IPFS上传成功:', response.data)

    return NextResponse.json({ ipfsHash: response.data.IpfsHash })
  } catch (error: any) {
    console.error('Upload error details:', {
      message: error.message,
      response: error.response?.data,
      stack: error.stack,
      name: error.name
    })

    return NextResponse.json(
      {
        error: '上传失败',
        details: error.response?.data?.error || error.message
      },
      { status: 500 }
    )
  }
}
