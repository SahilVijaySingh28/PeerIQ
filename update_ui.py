#!/usr/bin/env python3
"""Apply consistent UI/UX design across Messages, Groups, and Video pages"""

# Update Messages.jsx
with open('src/pages/Messages.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Update background and sticky header for Messages
old_section = '''  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">Messages & Notifications</h1>
          <p className="text-gray-600">Stay connected with your peers and never miss important updates</p>
        </motion.div>'''

new_section = '''  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sticky Header */}
      <motion.div 
        className="bg-white border-b sticky top-0 z-10 shadow-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Messages & Notifications</h1>
          <p className="text-gray-600 mt-1">Stay connected with your peers and never miss important updates</p>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">'''

content = content.replace(old_section, new_section)

# Fix closing tags
content = content.replace('      </div>\n    </motion.div>\n  );\n};', '      </div>\n    </div>\n  );\n};')

# Update shadow and border styling
content = content.replace('rounded-2xl shadow-sm mb-6 border border-gray-100', 'rounded-2xl shadow-lg mb-6 border-2 border-gray-200')
content = content.replace('rounded-2xl shadow-md overflow-hidden h-[550px] mb-8 border border-gray-100', 'rounded-2xl shadow-lg overflow-hidden h-[550px] mb-8 border-2 border-gray-200')
content = content.replace('rounded-2xl shadow-sm p-6 border border-gray-100', 'rounded-2xl shadow-lg p-6 border-2 border-gray-200')

with open('src/pages/Messages.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Messages.jsx updated")

# Update Groups.jsx
with open('src/pages/Groups.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Enhance background gradient
content = content.replace(
    'className="min-h-screen bg-gradient-to-b from-gray-50 to-white"',
    'className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100"'
)

# Make header font black instead of bold and fix title
content = content.replace(
    'className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">Study Groups',
    'className="text-4xl font-black bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Study Groups'
)

# Update border and shadow styling
content = content.replace('rounded-2xl shadow-sm p-6 mb-6 border border-gray-100', 'rounded-2xl shadow-lg p-6 mb-6 border-2 border-gray-200')
content = content.replace('rounded-2xl shadow-sm mb-6 border border-gray-100', 'rounded-2xl shadow-lg mb-6 border-2 border-gray-200')

with open('src/pages/Groups.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Groups.jsx updated")

# Update Video.jsx
with open('src/pages/Video.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Enhance background gradient
content = content.replace(
    'className="min-h-screen bg-gradient-to-b from-gray-50 to-white"',
    'className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100"'
)

# Make header font black and update title
content = content.replace(
    'className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">Video Meet',
    'className="text-4xl font-black bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Video Meetings'
)

# Update border and shadow styling  
content = content.replace('rounded-2xl shadow-sm p-6 hover:shadow-xl transition-all border border-gray-100', 'rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all border-2 border-gray-200')

with open('src/pages/Video.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Video.jsx updated")

print("\n✅ All pages updated with consistent UI/UX design!")
print("   - Sticky headers with better typography")
print("   - Enhanced gradient backgrounds (from-gray-50 to-gray-100)")
print("   - Improved border styling (2px, better colors)")
print("   - Consistent shadow effects (shadow-lg)")
