import { useState } from 'react'
import { Menu, X, Users } from 'lucide-react'

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">PeerIQ</span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Home
            </a>
            <a href="/network" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Network
            </a>
            <a href="/messages" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Messages
            </a>
            <a href="/resources" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Resources
            </a>
            <a href="/groups" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Groups
            </a>
            <a href="/video" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Video Meet
            </a>
            <a href="/leaderboard" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Leaderboard
            </a>
            <a href="/events" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Events
            </a>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <a href="/login" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Login
            </a>
            <a href="/signup" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Join Institute
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-primary-600 focus:outline-none focus:text-primary-600"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            <a href="/" className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium">
              Home
            </a>
            <a href="/network" className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium">
              Network
            </a>
            <a href="/messages" className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium">
              Messages
            </a>
            <a href="/resources" className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium">
              Resources
            </a>
            <a href="/groups" className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium">
              Groups
            </a>
            <a href="/video" className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium">
              Video Meet
            </a>
            <a href="/leaderboard" className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium">
              Leaderboard
            </a>
            <a href="/events" className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium">
              Events
            </a>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <a href="/login" className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium">
                Login
              </a>
              <a href="/signup" className="bg-primary-600 hover:bg-primary-700 text-white block px-3 py-2 rounded-md text-base font-medium mt-2">
                Join Institute
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
} 