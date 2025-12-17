"use client";

import { useState, useEffect } from 'react'
import NavBar from '@/app/Components/Navbar';
import Link from 'next/link';
import Footer from '@/app/Components/Footer';
import { Download, Lock, AlertCircle, Shield, Zap, Key, File, Eye, EyeOff, FileText, Mail, MessageSquare } from 'lucide-react'
import { useParams } from 'next/navigation'

export default function DownloadPage() {
  const params = useParams()
  const documentId = params.id as string
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fileInfo, setFileInfo] = useState<any>(null)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [downloadCount, setDownloadCount] = useState(0)
  const [maxDownloadsReached, setMaxDownloadsReached] = useState(false)

  useEffect(() => {
    const fetchFileInfo = async () => {
      try {
        const response = await fetch(`/api/download/${documentId}/info`)
        const data = await response.json()
        
        if (!response.ok) {
          setError(data.error || 'Failed to fetch file information')
          return
        }
        
        setFileInfo(data)
        
        // Set download count from API response
        const count = data.downloadCount || 0
        setDownloadCount(count)
        
        if (count >= 3) {
          setMaxDownloadsReached(true)
          setError('Maximum download limit reached (3 downloads)')
        }
        
        // Also check localStorage for client-side tracking
        const storedCount = localStorage.getItem(`download_count_${documentId}`)
        if (storedCount) {
          const localCount = parseInt(storedCount)
          if (localCount >= 3) {
            setMaxDownloadsReached(true)
          }
        }
      } catch (err) {
        setError('Failed to fetch file information')
      }
    }

    if (documentId) {
      fetchFileInfo()
    }
  }, [documentId])

  // Calculate total file size from files array
  const calculateTotalFileSize = () => {
    if (!fileInfo || !fileInfo.files || !Array.isArray(fileInfo.files)) {
      return 0
    }
    
    return fileInfo.files.reduce((total: number, file: any) => {
      const fileSize = file.size || 0
      return total + (typeof fileSize === 'string' ? parseInt(fileSize) : fileSize)
    }, 0)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === undefined || bytes === null) return 'Calculating...'
    if (typeof bytes === 'string') {
      bytes = parseInt(bytes)
    }
    if (isNaN(bytes) || bytes <= 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Get total file size
  const totalFileSize = calculateTotalFileSize()

  const handleDownload = async () => {
    if (!password) {
      setError('Please enter the password')
      return
    }

    if (maxDownloadsReached) {
      setError('Maximum download limit reached (3 downloads)')
      return
    }

    setLoading(true)
    setError('')
    setDownloadProgress(0)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 5
      })
    }, 300)

    try {
      const response = await fetch(`/api/download/${documentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })

      if (response.ok) {
        // Get the blob from response
        const blob = await response.blob()
        
        // Check if blob is valid
        if (!blob || blob.size === 0) {
          throw new Error('Empty file received')
        }
        
        clearInterval(progressInterval)
        setDownloadProgress(100)
        
        // Create download link
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        const fileName = fileInfo?.transferName ? 
          `${fileInfo.transferName.replace(/[^a-zA-Z0-9-_]/g, '_')}.zip` : 
          'secure-files.zip'
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        
        // Cleanup
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        // Increment download count
        const newCount = downloadCount + 1
        setDownloadCount(newCount)
        
        // Store in localStorage for client-side tracking
        localStorage.setItem(`download_count_${documentId}`, newCount.toString())
        
        if (newCount >= 3) {
          setMaxDownloadsReached(true)
        }
        
        // Show success for 3 seconds before resetting
        setTimeout(() => {
          setPassword('')
          setLoading(false)
          setDownloadProgress(0)
        }, 3000)
        
      } else {
        clearInterval(progressInterval)
        try {
          const data = await response.json()
          setError(data.error || 'Download failed')
        } catch {
          setError('Invalid response from server')
        }
        setLoading(false)
        setDownloadProgress(0)
      }
    } catch (err: any) {
      clearInterval(progressInterval)
      setError(err.message || 'Network error. Please try again.')
      setLoading(false)
      setDownloadProgress(0)
    }
  }

  if (error && !fileInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
          >
            Go Back
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
        {/* Left Content Section */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-24">
          <div className="max-w-lg">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-black to-gray-800 text-white px-4 py-2 rounded-full mb-6">
              <Shield size={18} />
              <span className="font-medium">Secure Download</span>
            </div>
            
            <h1 className="text-4xl xl:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Access Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-black to-gray-700">Secure Files</span>
            </h1>
            
            <p className="text-lg text-gray-600 mb-10">
              Decrypt and download your files with military-grade security. Your data remains protected until you access it.
            </p>

            {/* Features List */}
            <div className="space-y-6 mb-10">
              <div className="flex items-start gap-4">
                <div className="bg-black/5 p-2 rounded-lg">
                  <Lock className="text-black" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">AES-256 Decryption</h3>
                  <p className="text-gray-600 text-sm">Files are decrypted locally on your device</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-black/5 p-2 rounded-lg">
                  <Zap className="text-black" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Fast Download</h3>
                  <p className="text-gray-600 text-sm">High-speed file transfer with resume support</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-black/5 p-2 rounded-lg">
                  <Key className="text-black" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Download Limit</h3>
                  <p className="text-gray-600 text-sm">Maximum 3 downloads for security</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-8">
              <div>
                <div className="text-2xl font-bold text-gray-900">Zero-Knowledge</div>
                <div className="text-sm text-gray-600">We never see your password</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">3× Limit</div>
                <div className="text-sm text-gray-600">Maximum downloads</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">24h</div>
                <div className="text-sm text-gray-600">Auto-delete available</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Section */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8 lg:hidden">
              <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full mb-4">
                <Lock size={18} />
                <span className="font-medium">Secure Download</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Access Your Files
              </h1>
              <p className="text-gray-600">
                Enter the password to decrypt and download your files
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8">
              {loading ? (
                // Loading/Progress View
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="relative inline-flex items-center justify-center">
                      {/* Large Circular Progress - 140px */}
                      <svg className="w-36 h-36 transform -rotate-90">
                        {/* Background Circle */}
                        <circle
                          cx="72"
                          cy="72"
                          r="68"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="6"
                        />
                        {/* Progress Circle - Bolder line (6px) */}
                        <circle
                          cx="72"
                          cy="72"
                          r="68"
                          fill="none"
                          stroke={downloadProgress === 100 ? "#10b981" : "#000"}
                          strokeWidth="6"
                          strokeLinecap="round"
                          strokeDasharray={427.26} // 2 * π * 68
                          strokeDashoffset={427.26 - (427.26 * downloadProgress) / 100}
                          className="transition-all duration-300"
                        />
                      </svg>
                      
                      {/* Percentage Text - Larger */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-gray-900">
                          {downloadProgress}%
                        </span>
                        <span className="text-sm text-gray-600 mt-2">
                          {downloadProgress === 100 ? 'Complete!' : 'Downloading...'}
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-3">
                      {downloadProgress === 100 ? 'Download Complete!' : 'Downloading Files'}
                    </h3>
                    <p className="text-gray-600">
                      {downloadProgress === 100 
                        ? 'Your files have been downloaded successfully'
                        : `Downloading ${fileInfo?.fileCount || 0} file${(fileInfo?.fileCount || 0) > 1 ? 's' : ''} (${formatFileSize(totalFileSize)})`
                      }
                    </p>
                    
                    {/* Download Counter */}
                    <div className="mt-4 inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                      <span className="text-sm font-medium text-gray-700">
                        Downloads: {downloadCount}/3
                      </span>
                    </div>
                  </div>

                  {downloadProgress === 100 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <File className="text-green-600" size={20} />
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm">Download Successful</h3>
                          <p className="text-xs text-gray-600">Files saved to your downloads folder</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-700">
                        <p>• {fileInfo?.fileCount || 0} file{(fileInfo?.fileCount || 0) > 1 ? 's' : ''} downloaded</p>
                        <p>• Total size: {formatFileSize(totalFileSize)}</p>
                        <p className="mt-2 text-xs text-gray-600">
                          {downloadCount >= 3 
                            ? 'Maximum download limit reached'
                            : `${3 - downloadCount} download${3 - downloadCount === 1 ? '' : 's'} remaining`
                          }
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="text-center text-xs text-gray-600 pt-4 border-t border-gray-200">
                    <p className="inline-flex items-center gap-1">
                      <Lock size={12} />
                      <span>Files are decrypted locally on your device using AES-256</span>
                    </p>
                  </div>
                </div>
              ) : (
                // Normal Form View
                <div className="space-y-6">
                  {/* Download Counter */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-gray-100 px-3 py-1.5 rounded-full">
                        <span className="text-sm font-medium text-gray-700">
                          Downloads: {downloadCount}/3
                        </span>
                      </div>
                    </div>
                    {maxDownloadsReached && (
                      <div className="bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-xs font-medium">
                        Limit Reached
                      </div>
                    )}
                  </div>

                  {/* Transfer Details */}
                  {fileInfo && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-black font-medium text-sm">
                          Transfer Details
                        </span>
                        <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                          {fileInfo.fileCount || 0} file{(fileInfo.fileCount || 0) > 1 ? 's' : ''}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-black/5 p-2 rounded-lg">
                            <FileText size={16} />
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Transfer Name</p>
                            <p className="text-sm font-medium text-black">{fileInfo.transferName || 'Secure Files'}</p>
                          </div>
                        </div>
                        
                        {fileInfo.senderEmail && (
                          <div className="flex items-center gap-3">
                            <div className="bg-black/5 p-2 rounded-lg">
                              <Mail size={16} />
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">From</p>
                              <p className="text-sm font-medium text-black">{fileInfo.senderEmail}</p>
                            </div>
                          </div>
                        )}
                        
                        {fileInfo.message && (
                          <div className="flex items-start gap-3">
                            <div className="bg-black/5 p-2 rounded-lg mt-1">
                              <MessageSquare size={16} />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-gray-600">Message from Sender</p>
                              <p className="text-sm text-black mt-1 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                {fileInfo.message}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-3">
                          <div className="bg-black/5 p-2 rounded-lg">
                            <Zap size={16} />
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Total Size</p>
                            <p className="text-sm font-medium text-black">
                              {formatFileSize(totalFileSize)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Password Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Decryption Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter the password provided by sender"
                        disabled={maxDownloadsReached}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black transition-all text-black placeholder-gray-500 bg-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleDownload()
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black disabled:opacity-50"
                        disabled={maxDownloadsReached}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      Enter the exact password provided by the sender
                    </p>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                      </div>
                    </div>
                  )}

                  {/* Download Button */}
                  <button
                    onClick={handleDownload}
                    disabled={loading || !password || maxDownloadsReached}
                    className={`w-full text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm ${
                      maxDownloadsReached 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : loading 
                          ? 'bg-gray-800' 
                          : 'bg-black hover:bg-gray-800'
                    }`}
                  >
                    {maxDownloadsReached ? (
                      <>
                        <Lock size={18} />
                        <span>Maximum Downloads Reached</span>
                      </>
                    ) : (
                      <>
                        <Download size={18} />
                        <span>Download Files</span>
                      </>
                    )}
                  </button>

                  {/* Security Note */}
                  <div className="text-center text-xs text-gray-600 pt-4 border-t border-gray-200">
                    <p className="inline-flex items-center gap-1">
                      <Lock size={12} />
                      <span>Maximum 3 downloads allowed per file transfer</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}