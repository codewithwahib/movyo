// src/app/api/download/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import JSZip from 'jszip'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

export async function POST(
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
    
    const { password } = await request.json()
    
    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }
    
    // Fetch the secure file document from Sanity
    const query = `*[_type == "secureFile" && _id == $id][0]{
      _id,
      password,
      files[]{
        asset->{
          url,
          originalFilename,
          size,
          mimeType,
          _id
        },
        title,
        size
      },
      transferName,
      isDownloaded,
      expiresAt,
      downloadCount
    }`
    
    const fileData = await client.fetch(query, { id })
    
    if (!fileData) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }
    
    // Verify password
    if (fileData.password !== password) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
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
    
    // Check download count (max 3 downloads)
    const currentDownloadCount = fileData.downloadCount || 0
    if (currentDownloadCount >= 3) {
      return NextResponse.json(
        { error: 'Maximum download limit reached (3 downloads)' },
        { status: 403 }
      )
    }
    
    // Create a ZIP file
    const zip = new JSZip()
    
    // Download and add each file to the ZIP
    for (const file of fileData.files) {
      if (!file.asset?.url) {
        console.warn('File missing asset URL:', file)
        continue
      }
      
      try {
        // Download the file from Sanity CDN
        const response = await fetch(file.asset.url)
        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${response.statusText}`)
        }
        
        const arrayBuffer = await response.arrayBuffer()
        
        // Determine filename
        let fileName = file.title || file.asset.originalFilename || 'file'
        
        // Add extension if missing
        if (file.asset.mimeType) {
          const ext = getExtensionFromMimeType(file.asset.mimeType)
          if (ext && !fileName.endsWith(ext)) {
            fileName += ext
          }
        }
        
        // Add file to zip
        zip.file(fileName, arrayBuffer)
        
      } catch (error) {
        console.error(`Failed to download file:`, error)
        throw new Error(`Failed to download file: ${file.title || 'Unknown file'}`)
      }
    }
    
    // Generate ZIP as Blob (FIXED HERE)
    const zipBlob = await zip.generateAsync({ 
      type: 'blob',
      compression: 'DEFLATE'
    })
    
    // Update download count in Sanity
    const newDownloadCount = currentDownloadCount + 1
    await client
      .patch(id)
      .set({ 
        downloadCount: newDownloadCount,
        isDownloaded: newDownloadCount >= 3 ? true : fileData.isDownloaded,
        lastDownloadedAt: new Date().toISOString()
      })
      .commit()
    
    // Convert Blob to ArrayBuffer for Response
    const arrayBuffer = await zipBlob.arrayBuffer()
    
    // Return the ZIP file (FIXED HERE)
    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileData.transferName || 'secure-files')}.zip"`,
        'Content-Length': zipBlob.size.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    
  } catch (error: any) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: error.message || 'Download failed' },
      { status: 500 }
    )
  }
}

// Helper function to get file extension from mime type
function getExtensionFromMimeType(mimeType: string): string {
  const mimeMap: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
    'application/pdf': '.pdf',
    'text/plain': '.txt',
    'text/csv': '.csv',
    'text/html': '.html',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'application/vnd.ms-powerpoint': '.ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
    'application/zip': '.zip',
    'application/x-rar-compressed': '.rar',
    'application/x-7z-compressed': '.7z',
    'audio/mpeg': '.mp3',
    'audio/wav': '.wav',
    'video/mp4': '.mp4',
    'video/mpeg': '.mpeg',
    'application/json': '.json',
    'application/xml': '.xml'
  }
  
  return mimeMap[mimeType.toLowerCase()] || ''
}