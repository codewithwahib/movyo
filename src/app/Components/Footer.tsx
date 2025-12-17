"use client";

import { Shield, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-br from-gray-50 to-gray-100 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-black to-gray-800 p-2 rounded-lg">
                <Shield className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Movyo</h2>
                <p className="text-sm text-gray-600">Military-Grade File Transfer</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Secure file transfer with end-to-end encryption. Your data stays private, always.
            </p>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 hover:text-black text-sm transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-600 hover:text-black text-sm transition-colors">
                  Upload Files
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-600 hover:text-black text-sm transition-colors">
                  Download Files
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-600 hover:text-black text-sm transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/Contact" className="text-gray-600 hover:text-black text-sm transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info Column */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Mail className="text-gray-500" size={16} />
                <span className="text-gray-600 text-sm">support@movyo.com</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-gray-500" size={16} />
                <span className="text-gray-600 text-sm">+92 342 3415018</span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="text-gray-500" size={16} />
                <span className="text-gray-600 text-sm">Karachi, Pakistan.</span>
              </li>
            </ul>
          </div>

          {/* Social Media Column */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Follow Us</h3>
            <div className="flex gap-3">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-200 hover:bg-black text-gray-700 hover:text-white rounded-lg flex items-center justify-center transition-colors"
              >
                <Facebook size={18} />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-200 hover:bg-black text-gray-700 hover:text-white rounded-lg flex items-center justify-center transition-colors"
              >
                <Twitter size={18} />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-200 hover:bg-black text-gray-700 hover:text-white rounded-lg flex items-center justify-center transition-colors"
              >
                <Linkedin size={18} />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-200 hover:bg-black text-gray-700 hover:text-white rounded-lg flex items-center justify-center transition-colors"
              >
                <Instagram size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-sm">
              © {currentYear} Movyo. All rights reserved.
            </p>
            
            <div className="flex gap-6">
              <Link href="/" className="text-gray-600 hover:text-black text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/" className="text-gray-600 hover:text-black text-sm transition-colors">
                Terms of Service
              </Link>
              <Link href="/" className="text-gray-600 hover:text-black text-sm transition-colors">
                Security
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}