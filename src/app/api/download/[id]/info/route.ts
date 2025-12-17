// src/app/api/download/[id]/info/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'next-sanity'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      )
    }
    
    // Fetch the secure file document from Sanity
    const query = `*[_type == "secureFile" && _id == $id][0]{
      _id,
      transferName,
      senderEmail,
      receiverEmail,
      fileCount,
      totalSize,
      transferDate,
      expiresAt,
      isDownloaded,
      status,
      downloadCount,
      files[]{
        asset->{
          _id,
          url,
          originalFilename,
          mimeType,
          size
        },
        title,
        size
      }
    }`
    
    const fileData = await client.fetch(query, { id })
    
    if (!fileData) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }
    
    // Check if file is expired
    const now = new Date()
    const expiresAt = new Date(fileData.expiresAt)
    
    if (expiresAt < now) {
      return NextResponse.json(
        { error: 'File has expired' },
        { status: 410 }
      )
    }
    
    // Check download count
    const downloadCount = fileData.downloadCount || 0
    if (downloadCount >= 3) {
      return NextResponse.json(
        { error: 'Maximum download limit reached (3 downloads)' },
        { status: 403 }
      )
    }
    
    // Calculate total size from files
    let totalSize = 0
    const files = fileData.files.map((file: any) => {
      const size = file.asset?.size || file.size || 0
      totalSize += size
      
      return {
        title: file.title,
        size: size,
        formattedSize: formatBytes(size),
        mimeType: file.asset?.mimeType || 'application/octet-stream',
        originalFilename: file.asset?.originalFilename,
        asset: file.asset
      }
    })
    
    return NextResponse.json({
      success: true,
      id: fileData._id,
      transferName: fileData.transferName,
      senderEmail: fileData.senderEmail,
      receiverEmail: fileData.receiverEmail,
      fileCount: fileData.fileCount || files.length,
      totalSize: totalSize,
      formattedSize: formatBytes(totalSize),
      transferDate: fileData.transferDate,
      expiresAt: fileData.expiresAt,
      downloadCount: downloadCount,
      files: files,
      requiresPassword: true,
      downloadUrl: `/api/download/${id}`
    })
    
  } catch (error: any) {
    console.error('File info fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch file information', details: error.message },
      { status: 500 }
    )
  }
}

// Helper function to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}