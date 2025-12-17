"use client";

import { useState, useRef, ChangeEvent } from 'react'
import NavBar from './Components/Navbar';
import Footer from './Components/Footer';
import { Upload, Send, Lock, Mail, FileText, Eye, EyeOff, X, File, Shield, Zap, Key, Copy, Check, Link, AlertCircle } from 'lucide-react'

interface FileItem {
  file: File
  id: string
  size: number
}

export default function SecureUploadPage() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [files, setFiles] = useState<FileItem[]>([])
  const [successAnimation, setSuccessAnimation] = useState(false)
  const [uploadResult, setUploadResult] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const downloadLinkRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).map(file => ({
        file,
        id: Math.random().toString(36).substring(2),
        size: file.size
      }))
      setFiles(prev => [...prev, ...newFiles])
    }
  }

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        id: Math.random().toString(36).substring(2),
        size: file.size
      }))
      setFiles(prev => [...prev, ...newFiles])
    }
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getTotalSize = () => {
    return files.reduce((total, file) => total + file.size, 0)
  }

  const generateDownloadLink = (documentId: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    return `${baseUrl}/download/${documentId}`
  }

  const copyToClipboard = () => {
    if (downloadLinkRef.current) {
      downloadLinkRef.current.select()
      document.execCommand('copy')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Clear previous email error
    setEmailError(null)
    
    // Get form data
    const form = e.currentTarget
    const formData = new FormData(form)
    
    // Get email values
    const senderEmail = formData.get('senderEmail') as string
    const receiverEmail = formData.get('receiverEmail') as string
    
    // Validation: Check if emails are the same
    if (senderEmail && receiverEmail && senderEmail.toLowerCase() === receiverEmail.toLowerCase()) {
      setEmailError("Sender and receiver emails cannot be the same")
      return
    }
    
    // Validation: Check if files are selected
    if (files.length === 0) {
      alert('Please select at least one file')
      return
    }

    // Add all files to FormData
    files.forEach((fileItem) => {
      formData.append('files', fileItem.file)
    })

    setLoading(true)
    setUploadProgress(0)
    setSuccessAnimation(false)
    setUploadResult(null)

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    try {
      const res = await fetch('/api/secure-file', {
        method: 'POST',
        body: formData,
      })

      const result = await res.json()
      
      setUploadProgress(100)
      clearInterval(progressInterval)

      if (res.ok && result.success) {
        setSuccessAnimation(true)
        
        // Generate download link
        const downloadLink = generateDownloadLink(result.documentId || result.shareableId)
        setUploadResult(downloadLink)
        
        // Reset form after showing success
        setTimeout(() => {
          form.reset()
          setFiles([])
          setSuccessAnimation(false)
          setUploadProgress(0)
          setLoading(false)
          setEmailError(null)
        }, 2000)
        
      } else {
        throw new Error(result.error || 'Upload failed')
      }
      
    } catch (error: any) {
      console.error('Upload error:', error)
      clearInterval(progressInterval)
      setLoading(false)
      setUploadProgress(0)
      alert(`Upload failed: ${error.message}`)
    }
  }

  const handleNewTransfer = () => {
    setUploadResult(null)
    setFiles([])
    setEmailError(null)
    if (formRef.current) {
      formRef.current.reset()
    }
  }

  return (<>
    <NavBar/>
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Left Content Section */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-24">
        <div className="max-w-lg">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-black to-gray-800 text-white px-4 py-2 rounded-full mb-6">
            <Shield size={18} />
            <span className="font-medium">Military-Grade Security</span>
          </div>
          
          <h1 className="text-4xl xl:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Send Files <span className="text-transparent bg-clip-text bg-gradient-to-r from-black to-gray-700">Securely</span> in Minutes
          </h1>
          
          <p className="text-lg text-gray-600 mb-10">
            Encrypted file transfer with end-to-end protection. Your data stays private, always.
          </p>

          {/* Features List */}
          <div className="space-y-6 mb-10">
            <div className="flex items-start gap-4">
              <div className="bg-black/5 p-2 rounded-lg">
                <Lock className="text-black" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">AES-256 Encryption</h3>
                <p className="text-gray-600 text-sm">Bank-level encryption for all your files</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-black/5 p-2 rounded-lg">
                <Zap className="text-black" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Lightning Fast</h3>
                <p className="text-gray-600 text-sm">Transfer multiple files simultaneously</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-black/5 p-2 rounded-lg">
                <Key className="text-black" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Password Protected</h3>
                <p className="text-gray-600 text-sm">Decrypt files only with your password</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-8">
            <div>
              <div className="text-2xl font-bold text-gray-900">10K+</div>
              <div className="text-sm text-gray-600">Secure Transfers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">99.9%</div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="text-sm text-gray-600">Data Breaches</div>
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
              <span className="font-medium">Secure Transfer</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Encrypted File Transfer
            </h1>
            <p className="text-gray-600">
              Send multiple files securely with end-to-end encryption
            </p>
          </div>

          {uploadResult ? (
            // Success View - ONLY LINK
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <Check className="text-green-600" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Success!
                </h2>
                <p className="text-gray-600 mb-6">
                  Your files have been uploaded. Share this link:
                </p>
              </div>

              {/* Download Link Only */}
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      ref={downloadLinkRef}
                      type="text"
                      readOnly
                      value={uploadResult}
                      className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono text-gray-900 truncate"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black"
                    >
                      {copied ? <Check size={20} /> : <Copy size={20} />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a
                    href={uploadResult}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors text-center"
                  >
                    Open Link
                  </a>
                  <button
                    onClick={handleNewTransfer}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    New Transfer
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Original Upload Form
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8"
            >
              <div className="space-y-5">
                {/* Email Fields */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      name="senderEmail"
                      type="email"
                      placeholder="Your Email"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black transition-all text-black placeholder-gray-500 bg-white text-sm"
                    />
                  </div>
                  
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      name="receiverEmail"
                      type="email"
                      placeholder="Receiver's Email"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black transition-all text-black placeholder-gray-500 bg-white text-sm"
                    />
                  </div>
                </div>

                {/* Email Error Message */}
                {emailError && (
                  <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <span>{emailError}</span>
                  </div>
                )}

                {/* Transfer Name */}
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    name="transferName"
                    type="text"
                    placeholder="Transfer Title"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black transition-all text-black placeholder-gray-500 bg-white text-sm"
                  />
                </div>

                {/* Password with toggle */}
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Encryption Password"
                    required
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black transition-all text-black placeholder-gray-500 bg-white text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {/* Message */}
                <textarea
                  name="message"
                  placeholder="Add a secure message..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-black focus:border-black transition-all resize-none text-black placeholder-gray-500 bg-white text-sm"
                />

                {/* File Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                    isDragging 
                      ? 'border-black bg-gray-50' 
                      : 'border-gray-300 hover:border-black hover:bg-gray-50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mx-auto text-gray-400 mb-3" size={28} />
                  <p className="text-black font-medium mb-1 text-sm">
                    Drop your files here or click to browse
                  </p>
                  <p className="text-xs text-gray-600 mb-4">
                    You can select multiple files
                  </p>
                  <input
                    ref={fileInputRef}
                    name="files-input"
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className="text-xs text-gray-600 bg-gray-100 inline-flex items-center gap-1 px-3 py-1 rounded-full">
                    <Lock size={12} />
                    <span>Files are encrypted before upload</span>
                  </div>
                </div>

                {/* Selected Files List */}
                {files.length > 0 && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-black font-medium text-sm">
                        Selected Files ({files.length})
                      </span>
                      <span className="text-xs text-gray-600">
                        Total: {formatFileSize(getTotalSize())}
                      </span>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {files.map((fileItem) => (
                        <div
                          key={fileItem.id}
                          className="flex items-center justify-between p-2 hover:bg-gray-50 rounded text-sm"
                        >
                          <div className="flex items-center gap-3">
                            <File size={16} className="text-gray-500" />
                            <div className="text-left">
                              <p className="text-black truncate max-w-xs">
                                {fileItem.file.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(fileItem.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(fileItem.id)}
                            className="text-gray-400 hover:text-black p-1"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Progress Bar */}
                {uploadProgress > 0 && (
                  <div className="space-y-2">
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-black transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-black text-center">
                      Uploading {files.length} file{files.length > 1 ? 's' : ''}... {uploadProgress}%
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || files.length === 0}
                  className={`w-full text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm ${
                    successAnimation 
                      ? 'bg-gray-800' 
                      : 'bg-black hover:bg-gray-800'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Uploading {files.length} File{files.length > 1 ? 's' : ''}...</span>
                    </>
                  ) : successAnimation ? (
                    <>
                      <div className="w-5 h-5">
                        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>Sent Successfully!</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Send {files.length} File{files.length > 1 ? 's' : ''}</span>
                    </>
                  )}
                </button>

                {/* Security Note */}
                <div className="text-center text-xs text-gray-600 pt-4 border-t border-gray-200">
                  <p className="inline-flex items-center gap-1">
                    <Lock size={12} />
                    <span>All files are encrypted with AES-256 before transmission</span>
                  </p>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
    <Footer/>
    </>
  )
}