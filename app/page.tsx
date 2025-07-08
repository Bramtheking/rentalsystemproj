"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Building2,
  Users,
  CreditCard,
  BarChart3,
  Shield,
  Smartphone,
  ArrowRight,
  Star,
  Play,
  Menu,
  X,
  CheckCircle,
} from "lucide-react"

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const features = [
    {
      icon: Building2,
      title: "Property Management",
      description: "Manage multiple properties and units with ease",
    },
    {
      icon: Users,
      title: "Tenant Management",
      description: "Track tenants, leases, and move-in/out processes",
    },
    {
      icon: CreditCard,
      title: "Payment Processing",
      description: "Automated rent collection and payment tracking",
    },
    {
      icon: BarChart3,
      title: "Financial Reports",
      description: "Comprehensive financial analytics and reporting",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Bank-level security for your property data",
    },
    {
      icon: Smartphone,
      title: "Mobile Friendly",
      description: "Access your dashboard anywhere, anytime",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Property Owner",
      content: "RentPro has transformed how I manage my properties. The automation saves me hours every week!",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Real Estate Manager",
      content: "The best property management software I've used. Clean interface and powerful features.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Property Investor",
      content: "Finally, a system that makes property management simple and efficient. Highly recommended!",
      rating: 5,
    },
  ]

  const benefits = [
    "Save 10+ hours per week on administrative tasks",
    "Increase rent collection rates by 25%",
    "Reduce tenant turnover with better communication",
    "Generate professional reports in seconds",
    "Track all expenses and maximize tax deductions",
    "Mobile access for on-the-go management",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 floating-animation"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 floating-animation"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-40 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 floating-animation"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">RentPro</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-white/80 hover:text-white transition-colors">
              Features
            </a>
            <a href="#benefits" className="text-white/80 hover:text-white transition-colors">
              Benefits
            </a>
            <a href="#testimonials" className="text-white/80 hover:text-white transition-colors">
              Testimonials
            </a>
            <Link href="/auth/signin">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="btn-modern">Get Started</Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-black/20 backdrop-blur-md border-t border-white/10">
            <div className="px-6 py-4 space-y-4">
              <a href="#features" className="block text-white/80 hover:text-white transition-colors">
                Features
              </a>
              <a href="#benefits" className="block text-white/80 hover:text-white transition-colors">
                Benefits
              </a>
              <a href="#testimonials" className="block text-white/80 hover:text-white transition-colors">
                Testimonials
              </a>
              <Link href="/auth/signin" className="block">
                <Button variant="ghost" className="w-full text-white hover:bg-white/10">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup" className="block">
                <Button className="w-full btn-modern">Get Started</Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Modern Property
              <span className="gradient-text block">Management</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed">
              Streamline your rental business with our comprehensive property management platform. Manage tenants,
              collect rent, and track expenses all in one place.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/auth/signup">
              <Button className="btn-modern text-lg px-8 py-4">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" className="glass text-white border-white/20 hover:bg-white/10 text-lg px-8 py-4">
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          {/* Dashboard Preview */}
          <div className="relative max-w-5xl mx-auto">
            <div className="glass rounded-2xl p-8 transform hover:scale-105 transition-transform duration-500">
              <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl p-6 backdrop-blur-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="glass-dark rounded-xl p-6 text-center">
                    <h3 className="text-2xl font-bold text-white mb-2">$125,000</h3>
                    <p className="text-white/70">Monthly Revenue</p>
                  </div>
                  <div className="glass-dark rounded-xl p-6 text-center">
                    <h3 className="text-2xl font-bold text-white mb-2">95%</h3>
                    <p className="text-white/70">Occupancy Rate</p>
                  </div>
                  <div className="glass-dark rounded-xl p-6 text-center">
                    <h3 className="text-2xl font-bold text-white mb-2">247</h3>
                    <p className="text-white/70">Active Tenants</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Everything You Need</h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Powerful features designed to simplify property management and maximize your rental income.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="glass border-white/20 card-hover group">
                <CardContent className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-white/70 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Why Choose <span className="gradient-text">RentPro?</span>
              </h2>
              <p className="text-xl text-white/80 mb-8">
                Join thousands of property managers who have transformed their business with our platform.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0" />
                    <span className="text-white/90">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass rounded-2xl p-8">
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">Get Started Today</h3>
                  <p className="text-white/70">Discover the benefits of RentPro</p>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-white/20">
                    <span className="text-white/80">Easy Setup</span>
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/20">
                    <span className="text-white/80">Cancel anytime</span>
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/20">
                    <span className="text-white/80">24/7 support</span>
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-white/80">Setup assistance</span>
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                </div>
                <Link href="/auth/signup" className="block">
                  <Button className="w-full btn-modern text-lg py-4">
                    Get Started Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Loved by Property Managers</h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Join thousands of property managers who trust RentPro to streamline their business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="glass border-white/20 card-hover">
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-white/80 mb-6 italic">"{testimonial.content}"</p>
                  <div>
                    <h4 className="text-white font-semibold">{testimonial.name}</h4>
                    <p className="text-white/60 text-sm">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass rounded-3xl p-12 pulse-glow">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your
              <span className="gradient-text block">Property Management?</span>
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Join thousands of property managers who have streamlined their operations with RentPro.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button className="btn-modern text-lg px-8 py-4">
                  Get Started Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button
                  variant="outline"
                  className="glass text-white border-white/20 hover:bg-white/10 text-lg px-8 py-4"
                >
                  Sign In to Your Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">RentPro</span>
            </div>
            <div className="flex items-center space-x-6 text-white/60 text-sm">
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Contact
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-white/60 text-sm">
            © 2024 RentPro. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
