// Enhanced UI Utility Classes
// Use these throughout the app for consistent, appealing styling

export const cardClasses = {
  base: 'bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-primary-200',
  elevated: 'bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100',
  ghost: 'bg-transparent border-2 border-gray-200 rounded-xl hover:border-primary-600 hover:bg-primary-50 transition-all duration-300',
}

export const buttonClasses = {
  primary: 'bg-gradient-to-r from-primary-600 to-secondary-600 hover:shadow-lg text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 active:scale-95',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-all duration-200 active:scale-95',
  outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 font-semibold py-2 px-4 rounded-lg transition-all duration-200',
  danger: 'bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 active:scale-95',
  success: 'bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 active:scale-95',
}

export const inputClasses = {
  base: 'w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-600 focus:ring-2 focus:ring-primary-100 outline-none transition-all',
  error: 'border-red-500 focus:border-red-600 focus:ring-red-100',
}

export const badgeClasses = {
  primary: 'bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold',
  secondary: 'bg-secondary-100 text-secondary-700 px-3 py-1 rounded-full text-xs font-semibold',
  success: 'bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold',
  warning: 'bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold',
  error: 'bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold',
}

export const animationClasses = {
  fadeIn: 'animate-in fade-in duration-300',
  slideIn: 'animate-in slide-in-from-bottom-4 duration-300',
  scaleIn: 'animate-in zoom-in duration-300',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
}

export const gradientClasses = {
  primary: 'bg-gradient-to-r from-primary-600 to-secondary-600',
  primaryReverse: 'bg-gradient-to-r from-secondary-600 to-primary-600',
  blue: 'bg-gradient-to-r from-blue-600 to-blue-400',
  green: 'bg-gradient-to-r from-green-600 to-green-400',
  purple: 'bg-gradient-to-r from-purple-600 to-purple-400',
  pink: 'bg-gradient-to-r from-pink-600 to-pink-400',
}

export const containerClasses = {
  base: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  section: 'py-12 md:py-20 px-4 sm:px-6 lg:px-8',
}

export const textClasses = {
  h1: 'text-3xl md:text-4xl lg:text-5xl font-bold',
  h2: 'text-2xl md:text-3xl lg:text-4xl font-bold',
  h3: 'text-xl md:text-2xl font-bold',
  subtitle: 'text-gray-600 text-lg',
  body: 'text-gray-700 text-base',
  small: 'text-gray-600 text-sm',
}

// Utility to combine multiple class strings
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ')
}
