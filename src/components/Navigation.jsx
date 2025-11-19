import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Users, LogOut, User as UserIcon } from 'lucide-react'
import { useUser } from '../contexts/UserContext'

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useUser()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
    setIsProfileOpen(false)
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">PeerIQ</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'}`}>
              Home
            </Link>
            <Link to="/network" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/network') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'}`}>
              Network
            </Link>
            <Link to="/messages" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/messages') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'}`}>
              Messages
            </Link>
            <Link to="/resources" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/resources') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'}`}>
              Resources
            </Link>
            <Link to="/groups" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/groups') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'}`}>
              Groups
            </Link>
            <Link to="/video" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/video') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'}`}>
              Video Meet
            </Link>
            <Link to="/leaderboard" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/leaderboard') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'}`}>
              Leaderboard
            </Link>
            <Link to="/events" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/events') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'}`}>
              Events
            </Link>
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={toggleProfile}
                  className="flex items-center space-x-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded-lg transition-colors"
                >
                  <img
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.name || 'User')}`}
                    alt={user.displayName || user.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium">{user.displayName || user.name}</span>
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
                    <Link
                      to={`/profile/${user.id}`}
                      onClick={() => setIsProfileOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 border-b border-gray-200"
                    >
                      <UserIcon className="w-4 h-4" />
                      <span>My Profile</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Login
                </Link>
                <Link to="/signup" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Join Institute
                </Link>
              </>
            )}
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
            <Link to="/" onClick={toggleMenu} className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium">
              Home
            </Link>
            <Link to="/network" onClick={toggleMenu} className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium">
              Network
            </Link>
            <Link to="/messages" onClick={toggleMenu} className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium">
              Messages
            </Link>
            <Link to="/resources" onClick={toggleMenu} className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium">
              Resources
            </Link>
            <Link to="/groups" onClick={toggleMenu} className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium">
              Groups
            </Link>
            <Link to="/video" onClick={toggleMenu} className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium">
              Video Meet
            </Link>
            <Link to="/leaderboard" onClick={toggleMenu} className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium">
              Leaderboard
            </Link>
            <Link to="/events" onClick={toggleMenu} className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium">
              Events
            </Link>
            <div className="pt-4 pb-3 border-t border-gray-200">
              {user ? (
                <>
                  <Link
                    to={`/profile/${user.id}`}
                    onClick={toggleMenu}
                    className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2"
                  >
                    <img
                      src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.name || 'User')}`}
                      alt={user.displayName || user.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span>My Profile</span>
                  </Link>
                  <div className="px-3 py-2 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-900">{user.displayName || user.name}</p>
                    <p className="text-xs text-gray-600">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 rounded-md transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign out</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={toggleMenu} className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium">
                    Login
                  </Link>
                  <Link to="/signup" onClick={toggleMenu} className="bg-primary-600 hover:bg-primary-700 text-white block px-3 py-2 rounded-md text-base font-medium mt-2">
                    Join Institute
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
} 