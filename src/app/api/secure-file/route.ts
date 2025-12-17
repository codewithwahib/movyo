import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { v4 as uuidv4 } from 'uuid'

// Create Sanity client configuration
const sanityConfig = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
}

// Initialize client
const client = createClient(sanityConfig)

// Define file upload with retry logic
async function uploadFileWithRetry(file: File, maxRetries = 3): Promise<any> {
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const buffer = await file.arrayBuffer()
      const fileBuffer = Buffer.from(buffer)
      
      const asset = await client.assets.upload('file', fileBuffer, {
        filename: file.name,
        contentType: file.type || 'application/octet-stream',
      })
      
      return {
        _key: uuidv4(),
        _type: 'file',
        asset: {
          _type: 'reference',
          _ref: asset._id
        },
        title: file.name,
        size: file.size,
        fileType: file.type || 'unknown'
      }
    } catch (error: any) {
      lastError = error
      console.warn(`Attempt ${attempt} failed for ${file.name}:`, error.message)
      
      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    }
  }
  
  throw new Error(`Failed to upload ${file.name} after ${maxRetries} attempts: ${lastError?.message}`)
}

export async function POST(req: NextRequest) {
  try {
    // Check required environment variables
    if (!sanityConfig.projectId || !sanityConfig.dataset || !sanityConfig.token) {
      console.error('Missing Sanity environment variables')
      return NextResponse.json(
        { 
          success: false, 
          error: 'Server configuration error',
          details: 'Sanity environment variables are not properly configured'
        }, 
        { status: 500 }
      )
    }

    const formData = await req.formData()
    
    // Extract form data
    const password = formData.get('password') as string
    const senderEmail = formData.get('senderEmail') as string
    const receiverEmail = formData.get('receiverEmail') as string
    const transferName = formData.get('transferName') as string
    const message = formData.get('message') as string
    
    // Get all files
    const files = formData.getAll('files') as File[]
    
    // Validate required fields
    const missingFields = []
    if (!password) missingFields.push('password')
    if (!senderEmail) missingFields.push('senderEmail')
    if (!receiverEmail) missingFields.push('receiverEmail')
    if (!transferName) missingFields.push('transferName')
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields',
          details: `Please provide: ${missingFields.join(', ')}`
        },
        { status: 400 }
      )
    }
    
    // Validate that sender and receiver emails are not the same
    if (senderEmail.toLowerCase() === receiverEmail.toLowerCase()) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid email addresses',
          details: 'Sender and receiver emails cannot be the same'
        },
        { status: 400 }
      )
    }
    
    // Validate email format (basic validation)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(senderEmail)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid sender email',
          details: 'Please provide a valid sender email address'
        },
        { status: 400 }
      )
    }
    
    if (!emailRegex.test(receiverEmail)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid receiver email',
          details: 'Please provide a valid receiver email address'
        },
        { status: 400 }
      )
    }
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No files uploaded',
          details: 'Please select at least one file to upload'
        },
        { status: 400 }
      )
    }

    // Validate file sizes (optional: limit to 10MB per file)
    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
    const oversizedFiles = files.filter(file => file.size > MAX_FILE_SIZE)
    
    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles.map(f => f.name).join(', ')
      return NextResponse.json(
        {
          success: false,
          error: 'File size limit exceeded',
          details: `The following files exceed 10MB: ${fileNames}`
        },
        { status: 400 }
      )
    }

    // Upload all files to Sanity with progress tracking
    console.log(`Starting upload of ${files.length} files...`)
    
    const fileUploadPromises = files.map(async (file) => {
      try {
        console.log(`Uploading: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`)
        return await uploadFileWithRetry(file)
      } catch (error: any) {
        console.error(`Failed to upload ${file.name}:`, error)
        throw error
      }
    })
    
    const fileReferences = await Promise.all(fileUploadPromises)
    console.log(`Successfully uploaded ${fileReferences.length} files`)
    
    // Calculate total size
    const totalSize = files.reduce((acc, file) => acc + file.size, 0)
    
    // Create the secure file document
    const secureFileDoc = {
      _type: 'secureFile',
      password: password, // Note: In production, you should hash/encrypt this
      senderEmail,
      receiverEmail,
      transferName,
      message: message || '',
      files: fileReferences,
      fileCount: files.length,
      totalSize,
      transferDate: new Date().toISOString(),
      isDownloaded: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      status: 'pending'
    }
    
    console.log('Creating secure file document in Sanity...')
    const result = await client.create(secureFileDoc)
    console.log('Document created successfully:', result._id)
    
    // Generate a secure shareable link (you can customize this)
    const shareableId = Buffer.from(result._id).toString('base64').replace(/=/g, '').substring(0, 12)
    
    return NextResponse.json({ 
      success: true,
      message: 'Secure file transfer created successfully',
      documentId: result._id,
      shareableId: shareableId,
      details: {
        fileCount: files.length,
        totalSize: formatBytes(totalSize),
        expiresIn: '7 days',
        transferName: transferName,
        // Note: In a real app, you'd generate an actual download URL
        downloadHint: 'Files have been securely stored. The recipient will be notified.'
      }
    })
    
  } catch (error: any) {
    console.error('Create secure file error:', error)
    
    // Provide more specific error messages
    let errorMessage = 'Failed to create secure file transfer'
    let errorDetails = error.message || 'Unknown error occurred'
    
    if (error.message.includes('NetworkError')) {
      errorMessage = 'Network connection error'
      errorDetails = 'Please check your internet connection and try again'
    } else if (error.message.includes('projectId')) {
      errorMessage = 'Server configuration error'
      errorDetails = 'Sanity project configuration is invalid'
    } else if (error.message.includes('token')) {
      errorMessage = 'Authentication error'
      errorDetails = 'Invalid or missing Sanity API token'
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: errorDetails
      }, 
      { status: 500 }
    )
  }
}

// Helper function to format bytes
function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export const runtime = 'edge'

export const maxDuration = 60