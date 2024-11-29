/*
 * @Author: lixiaoming xiaoming.li@cy-tech.net
 * @Date: 2024-11-29 16:35:10
 * @LastEditors: lixiaoming xiaoming.li@cy-tech.net
 * @LastEditTime: 2024-11-29 16:40:27
 * @FilePath: /typescript-version/src/app/api/upload/route.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { NextResponse } from 'next/server'

import PinataClient from '@pinata/sdk'

export async function POST(request: Request) {
  try {
    if (!process.env.PINATA_API_KEY || !process.env.PINATA_SECRET_KEY) {
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

    const pinata = new PinataClient(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_KEY)

    try {
      await pinata.testAuthentication()
      console.log('Pinata认证成功')
    } catch (authError) {
      console.error('Pinata认证失败:', authError)

      return NextResponse.json({ error: 'Pinata认证失败' }, { status: 500 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    console.log('开始上传到IPFS...')

    const result = await pinata.pinFileToIPFS(buffer, {
      pinataMetadata: {
        name: file.name
      },
      pinataOptions: {
        cidVersion: 0
      }
    })

    console.log('IPFS上传成功:', result)

    return NextResponse.json({ ipfsHash: result.IpfsHash })
  } catch (error) {
    console.error('Upload error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })

    return NextResponse.json(
      {
        error: '上传失败',
        details: error.message
      },
      { status: 500 }
    )
  }
}
