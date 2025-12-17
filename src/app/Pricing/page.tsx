"use client";

import { useState, useEffect } from 'react'
import { Check, X, Zap, Shield, Users, Globe, Clock, HelpCircle, ArrowRight } from 'lucide-react'
import NavBar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { useRouter } from 'next/navigation'

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()
  
  // Add useEffect to track client-side rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Exchange rate: 1 USD = ~280 PKR (approx)
  const plans = [
    {
      name: 'Free',
      description: 'Perfect for occasional file transfers',
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        { text: '5 GB total storage', included: true },
        { text: 'Max 100 MB per file', included: true },
        { text: 'Basic encryption', included: true },
        { text: '24-hour file retention', included: true },
        { text: 'Email support', included: true },
        { text: 'Custom branding', included: false },
        { text: 'Priority support', included: false },
        { text: 'API access', included: false },
      ],
      ctaText: 'Get Started',
      popular: false,
    },
    {
      name: 'Pro',
      description: 'For professionals and small teams',
      monthlyPrice: 5320, // ~$19 USD converted to PKR
      annualPrice: 4200,  // ~$15 USD converted to PKR
      features: [
        { text: '100 GB total storage', included: true },
        { text: 'Max 2 GB per file', included: true },
        { text: 'AES-256 encryption', included: true },
        { text: '7-day file retention', included: true },
        { text: 'Priority email support', included: true },
        { text: 'Custom branding', included: true },
        { text: 'Priority support', included: false },
        { text: 'API access', included: false },
      ],
      ctaText: 'Contact Sales',
      popular: true,
    },
    {
      name: 'Business',
      description: 'For enterprises with advanced needs',
      monthlyPrice: 13720, // ~$49 USD converted to PKR
      annualPrice: 10920,  // ~$39 USD converted to PKR
      features: [
        { text: 'Unlimited storage', included: true },
        { text: 'Max 10 GB per file', included: true },
        { text: 'Military-grade encryption', included: true },
        { text: '30-day file retention', included: true },
        { text: '24/7 phone support', included: true },
        { text: 'Custom branding', included: true },
        { text: 'Priority support', included: true },
        { text: 'API access', included: true },
      ],
      ctaText: 'Contact Sales',
      popular: false,
    },
  ]

  const features = [
    {
      icon: Shield,
      title: 'Military-Grade Security',
      description: 'AES-256 encryption for all file transfers'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'High-speed transfers with no bandwidth limits'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Share files securely with your entire team'
    },
    {
      icon: Globe,
      title: 'Global Coverage',
      description: 'Servers worldwide for optimal performance'
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Round-the-clock customer support'
    },
    {
      icon: HelpCircle,
      title: 'Easy Setup',
      description: 'Get started in minutes, no IT help needed'
    },
  ]

  // Function to format PKR prices with comma separators
  const formatPKR = (amount: number) => {
    if (amount === 0) return 'Free'
    return amount.toLocaleString('en-PK') + ' PKR'
  }

  // Wait for client-side to avoid hydration mismatch
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <NavBar />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-48 mx-auto mb-6"></div>
              <div className="h-12 bg-gray-300 rounded w-96 mx-auto mb-4"></div>
              <div className="h-6 bg-gray-300 rounded w-2/3 mx-auto mb-8"></div>
              <div className="h-12 bg-gray-300 rounded w-64 mx-auto mb-16"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-black to-gray-800 text-white px-4 py-2 rounded-full mb-6">
            <Shield size={18} />
            <span className="font-medium">Simple, Transparent Pricing</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-black to-gray-700">Secure Plan</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Secure file transfer solutions for individuals, teams, and enterprises.
            All plans include military-grade encryption.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-gray-200 rounded-full p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-gray-700 hover:text-black'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === 'annual'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-gray-700 hover:text-black'
              }`}
            >
              Annual Billing <span className="text-green-600 ml-1">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`bg-white rounded-xl border ${
                plan.popular
                  ? 'border-black shadow-lg relative'
                  : 'border-gray-200 shadow'
              } p-8`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-black text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600">{plan.description}</p>
              </div>
              
              <div className="mb-8">
                <div className="flex items-baseline mb-2">
                  <span className="text-4xl font-bold text-gray-900">
                    {formatPKR(billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice)}
                  </span>
                  {plan.monthlyPrice > 0 && (
                    <span className="text-gray-600 ml-2">
                      /{billingCycle === 'monthly' ? 'month' : 'month'}
                    </span>
                  )}
                </div>
                {billingCycle === 'annual' && plan.monthlyPrice > 0 && (
                  <p className="text-sm text-gray-600">
                    Billed annually ({formatPKR(plan.annualPrice * 12)}/year)
                  </p>
                )}
              </div>
              
              <button
                onClick={() => router.push('/Contact')}
                className={`w-full py-3 rounded-lg font-medium mb-8 transition-all ${
                  plan.popular
                    ? 'bg-black text-white hover:bg-gray-800'
                    : 'border border-gray-300 text-gray-900 hover:border-black'
                }`}
              >
                {plan.ctaText}
              </button>
              
              <ul className="space-y-4">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    {feature.included ? (
                      <Check className="text-green-500 mt-0.5 mr-3 flex-shrink-0" size={18} />
                    ) : (
                      <X className="text-gray-300 mt-0.5 mr-3 flex-shrink-0" size={18} />
                    )}
                    <span className={`text-sm ${feature.included ? 'text-gray-900' : 'text-gray-400'}`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Everything You Need for Secure File Transfer
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="w-12 h-12 bg-black/5 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="text-black" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I pay in Pakistani Rupees?
              </h3>
              <p className="text-gray-600">
                Yes, all our pricing is in Pakistani Rupees (PKR). We accept local bank transfers and major credit cards.
              </p>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is there a free trial for paid plans?
              </h3>
              <p className="text-gray-600">
                Absolutely! The Pro plan comes with a 14-day free trial. No credit card required to start.
              </p>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What payment methods do you accept in Pakistan?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards, bank transfers, and EasyPaisa/JazzCash for Pakistani customers.
              </p>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do you offer discounts for Pakistani businesses?
              </h3>
              <p className="text-gray-600">
                Yes, we offer special pricing for Pakistani startups, educational institutions, and non-profits. Contact our sales team for more information.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-black to-gray-800 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Secure Your File Transfers?
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses in Pakistan that trust SecureSend for their file transfer needs.
              Start your free trial today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => router.push('/')}
                className="bg-white text-black px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >
                Start Free Trial
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}