# 🎨 PeerIQ Design System & Component Library

## Color Palette

### Primary Gradient
```
from-primary-600 to-secondary-600
```
Used for: Main CTAs, headers, highlights

### Status Colors
- **Success**: `from-green-600 to-emerald-600` ✅
- **Error**: `from-red-600 to-red-700` ❌
- **Warning**: `from-amber-500 to-amber-600` ⚠️
- **Info**: `from-blue-500 to-blue-600` ℹ️

### Neutral Colors
- **Background**: `bg-gradient-to-br from-gray-50 to-gray-100`
- **Cards**: `bg-white`
- **Text Primary**: `text-gray-900`
- **Text Secondary**: `text-gray-600`
- **Border**: `border-gray-100 to border-gray-200`

---

## Typography System

### Headings
```jsx
// H1 - Page Title
<h1 className="text-5xl font-black bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
  Page Title
</h1>

// H2 - Section Title
<h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
  Section Title
</h2>

// H3 - Subsection
<h3 className="text-xl font-bold text-gray-900">
  Subsection
</h3>
```

### Body Text
```jsx
// Regular
<p className="text-gray-600">Regular text</p>

// Small
<p className="text-sm text-gray-600">Small text</p>

// Extra Small
<p className="text-xs text-gray-600">Extra small text</p>
```

---

## Component Patterns

### Card Component
```jsx
<motion.div 
  className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary-200 overflow-hidden group"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  whileHover={{ y: -4 }}
>
  {/* Content */}
</motion.div>
```

**Classes:**
- `rounded-2xl` - Modern corners
- `shadow-sm hover:shadow-xl` - Hover shadow effect
- `border border-gray-100` - Subtle border
- `transition-all duration-300` - Smooth transitions

---

### Button Variants

#### Primary Button
```jsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:shadow-lg text-white font-bold py-2.5 px-6 rounded-xl transition-all"
>
  Primary Action
</motion.button>
```

#### Secondary Button
```jsx
<button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-6 rounded-xl transition-all">
  Secondary Action
</button>
```

#### Outlined Button
```jsx
<button className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-bold py-2.5 px-6 rounded-xl transition-all">
  Outlined Action
</button>
```

---

### Input Fields
```jsx
<input
  type="text"
  placeholder="Enter text..."
  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
/>

<select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-600 focus:ring-2 focus:ring-primary-100 outline-none transition-all font-semibold bg-white">
  <option>Select option</option>
</select>
```

---

### Badge Variants
```jsx
// Primary
<span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-bold">
  Badge
</span>

// Success
<span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
  Success
</span>

// Warning
<span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">
  Warning
</span>

// Error
<span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
  Error
</span>
```

---

## Animation Patterns

### Entrance Animation
```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.1 }}
>
  Content fades in and slides up
</motion.div>
```

### Staggered List Animation
```jsx
<motion.div>
  {items.map((item, idx) => (
    <motion.div
      key={idx}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
    >
      {item}
    </motion.div>
  ))}
</motion.div>
```

### Hover Animation
```jsx
<motion.div
  whileHover={{ y: -4, scale: 1.02 }}
  transition={{ duration: 0.2 }}
>
  Content lifts on hover
</motion.div>
```

### Tap Animation
```jsx
<motion.button
  whileTap={{ scale: 0.95 }}
>
  Scales down on click
</motion.button>
```

### Loading Spinner
```jsx
<motion.div 
  className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full"
  animate={{ rotate: 360 }}
  transition={{ duration: 1, repeat: Infinity }}
/>
```

### Floating Animation
```jsx
<motion.div
  animate={{ y: [0, -5, 0] }}
  transition={{ duration: 2, repeat: Infinity }}
>
  Content floats up and down
</motion.div>
```

---

## Spacing Scale

```
xs: 0.25rem (4px)
sm: 0.5rem (8px)
base: 1rem (16px)
md: 1.5rem (24px)
lg: 2rem (32px)
xl: 2.5rem (40px)
2xl: 3rem (48px)
```

### Common Spacing Patterns
- Page padding: `px-4 sm:px-6 lg:px-8`
- Section gap: `gap-6` or `gap-8`
- Element margin: `mb-4`, `mt-6`, `py-12`
- Card padding: `p-5` to `p-8`

---

## Responsive Breakpoints

```
sm: 640px   - Tablets
md: 768px   - Small Laptops
lg: 1024px  - Desktops
xl: 1280px  - Large Desktops
```

### Grid Patterns
```jsx
// Standard 3-column grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// 2-column grid
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">

// 4-column grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
```

---

## Reusable Component Examples

### User Card
```jsx
<div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all border border-gray-100 p-6">
  <img src={user.avatar} className="w-12 h-12 rounded-full mb-4" />
  <h3 className="font-bold text-gray-900">{user.name}</h3>
  <p className="text-sm text-gray-600">{user.email}</p>
  <button className="mt-4 w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-2 rounded-lg">
    Action
  </button>
</div>
```

### Stat Card
```jsx
<div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-6 border border-primary-200">
  <p className="text-sm text-gray-600">Label</p>
  <p className="text-3xl font-black text-primary-600">12,345</p>
  <p className="text-xs text-gray-600 mt-2">+5% from last month</p>
</div>
```

### Progress Card
```jsx
<div className="bg-white rounded-2xl p-6 border border-gray-100">
  <h3 className="font-bold text-gray-900 mb-4">Progress Title</h3>
  <div className="w-full bg-gray-200 rounded-full h-2">
    <div className="bg-gradient-to-r from-primary-600 to-secondary-600 h-2 rounded-full" style={{ width: '65%' }} />
  </div>
  <p className="text-sm text-gray-600 mt-2">65% Complete</p>
</div>
```

---

## Best Practices

### DO ✅
- Use gradient backgrounds for visual interest
- Add animations to interactive elements
- Provide clear hover states
- Use consistent spacing
- Group related components
- Add proper focus states for accessibility

### DON'T ❌
- Over-animate - keep it subtle
- Mix too many colors
- Use inconsistent spacing
- Forget mobile responsiveness
- Nest animations too deeply
- Use colors without contrast

---

## Accessibility Considerations

### Focus States
```jsx
className="focus:ring-2 focus:ring-primary-300 focus:outline-none"
```

### Color Contrast
- Primary text on white: AA compliant
- Hover states: Clear visual difference
- Focus states: 2px ring outline

### ARIA Labels
```jsx
<button aria-label="Close menu">
  <X className="w-6 h-6" />
</button>
```

---

## Performance Tips

1. **Use CSS transforms** for animations (faster than layout changes)
2. **Memoize components** to prevent unnecessary re-renders
3. **Lazy load images** with proper loading states
4. **Optimize motion** - keep animations under 300ms
5. **Use GPU acceleration** via `will-change`

---

## File Organization

```
src/
├── components/
│   ├── Navigation.jsx
│   ├── LoginPromptModal.jsx
│   ├── ProtectedRoute.jsx
│   └── Footer.jsx
├── pages/
│   ├── HomePage.jsx
│   ├── Resources.jsx
│   ├── Network.jsx
│   ├── Leaderboard.jsx
│   ├── Events.jsx
│   ├── Groups.jsx
│   ├── Messages.jsx
│   └── UserProfile.jsx
└── utils/
    └── uiClasses.js
```

---

## Quick Reference

### Import Animations
```jsx
import { motion } from 'framer-motion'
```

### Import UI Classes
```jsx
import { cardClasses, buttonClasses, animationClasses } from '../utils/uiClasses'
```

### Common Tailwind Classes
```
Rounded: rounded-xl, rounded-2xl, rounded-full
Shadows: shadow-sm, shadow-md, shadow-lg, shadow-xl
Borders: border, border-2, border-gray-100
Opacity: opacity-50, opacity-75, opacity-100
Transitions: transition-all, transition-colors, duration-300
```

---

## Resources

- [Tailwind CSS Docs](https://tailwindcss.com)
- [Framer Motion Docs](https://www.framer.com/motion)
- [Lucide Icons](https://lucide.dev)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

**This design system ensures consistency and maintainability across the PeerIQ platform!** 🎨
