"use client";

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import Image from 'next/image'

export default function NavBar() {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigationItems = [
    { name: 'Home', path: '/' },
    { name: 'Pricing', path: '/Pricing' },
  ]

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === path
    }
    return pathname?.startsWith(path)
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left Section - Logo/Image */}
          <div className="flex items-center">
            <div 
              className="cursor-pointer"
              onClick={() => router.push('/')}
            >
              <Image 
                src="/logo.png" 
                alt="Logo" 
                width={120} 
                height={40}
                className="cursor-pointer"
                onClick={() => router.push('/')}
              />
            </div>
          </div>

          {/* Right Section - Desktop Navigation and Contact Button */}
          <div className="hidden md:flex items-center gap-6">
            {/* Navigation Links */}
            <div className="flex items-center gap-1">
              {navigationItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => router.push(item.path)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path) 
                      ? 'text-black font-semibold' 
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>

            {/* Contact Button - Right End */}
            <button
              onClick={() => router.push('/Contact')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/Contact')
                  ? 'bg-black text-white hover:bg-white hover:text-black hover:border hover:border-black' 
                  : 'bg-black text-white hover:bg-white hover:text-black hover:border hover:border-black border border-black'
              }`}
            >
              Contact
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden pt-4 pb-4 border-t border-gray-200">
            <div className="flex flex-col gap-1">
              {navigationItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    router.push(item.path)
                    setIsMobileMenuOpen(false)
                  }}
                  className={`px-4 py-3 rounded-lg text-sm font-medium text-left ${
                    isActive(item.path) 
                      ? 'text-black font-semibold bg-gray-100' 
                      : 'text-gray-600 hover:text-black hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </button>
              ))}
              
              {/* Contact Button - Mobile */}
              <button
                onClick={() => {
                  router.push('/Contact')
                  setIsMobileMenuOpen(false)
                }}
                className={`mt-2 px-4 py-3 rounded-lg text-sm font-medium text-left ${
                  isActive('/Contact')
                    ? 'bg-black text-white hover:bg-white hover:text-black hover:border hover:border-black' 
                    : 'bg-black text-white hover:bg-white hover:text-black hover:border hover:border-black border border-black'
                }`}
              >
                Contact
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}