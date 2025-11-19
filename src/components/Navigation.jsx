import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Users, LogOut, User as UserIcon, Home, Network, MessageSquare, BookOpen, Users2, Video, Trophy, Calendar, Settings, Bell } from 'lucide-react'
import { useUser } from '../contexts/UserContext'

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useUser()

  // Track scroll for navbar effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/network', label: 'Network', icon: Network },
    { path: '/messages', label: 'Messages', icon: MessageSquare },
    { path: '/resources', label: 'Resources', icon: BookOpen },
    { path: '/groups', label: 'Groups', icon: Users2 },
    { path: '/video', label: 'Video', icon: Video },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { path: '/events', label: 'Events', icon: Calendar },
  ]

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-2xl' : 'bg-white shadow-lg'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center group-hover:shadow-lg transition-all">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">PeerIQ</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  isActive(path)
                    ? 'text-primary-600 bg-primary-50 shadow-md'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={toggleProfile}
                  className="flex items-center space-x-3 bg-gradient-to-r from-primary-50 to-secondary-50 hover:from-primary-100 hover:to-secondary-100 text-primary-700 px-4 py-2 rounded-lg transition-all duration-200 border border-primary-200 hover:border-primary-300 shadow-sm hover:shadow-md"
                >
                  <img
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.name || 'User')}`}
                    alt={user.displayName || user.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-sm font-semibold">{user.displayName || user.name}</span>
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-2xl z-10 border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-4 text-white">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.name || 'User')}`}
                          alt={user.displayName || user.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-white"
                        />
                        <div>
                          <p className="font-semibold text-sm">{user.displayName || user.name}</p>
                          <p className="text-xs text-primary-100">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2 border-t border-gray-100">
                      <Link
                        to={`/profile/${user.id}`}
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-primary-600" />
                        <span>My Profile</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors border-t border-gray-100 mt-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Login
                </Link>
                <Link to="/signup" className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:shadow-lg text-white px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md">
                  Join Institute
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            {user && (
              <img
                src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.name || 'User')}`}
                alt={user.displayName || user.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-primary-600 focus:outline-none focus:text-primary-600 transition-colors"
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
        <div className="md:hidden bg-white border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={toggleMenu}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium transition-all ${
                  isActive(path)
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            ))}
            <div className="pt-4 pb-3 border-t border-gray-200">
              {user ? (
                <>
                  <Link
                    to={`/profile/${user.id}`}
                    onClick={toggleMenu}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                  >
                    <img
                      src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.name || 'User')}`}
                      alt={user.displayName || user.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span>My Profile</span>
                  </Link>
                  <div className="px-3 py-2 border-b border-gray-200 mb-2">
                    <p className="text-sm font-semibold text-gray-900">{user.displayName || user.name}</p>
                    <p className="text-xs text-gray-600">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout()
                      toggleMenu()
                    }}
                    className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign out</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={toggleMenu} className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50">
                    Login
                  </Link>
                  <Link to="/signup" onClick={toggleMenu} className="block px-3 py-2 mt-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-base font-medium transition-colors">
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
