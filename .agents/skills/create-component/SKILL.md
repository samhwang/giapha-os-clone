# Component Creation Skill

## Purpose

Create a new React component with proper structure, styling, and testing patterns.

## Trigger Condition

When user asks to:
- Create a new component
- Add UI element
- Create React component in `src/components/`

## Workflow

### Step 1: Determine Component Location

- **Shared/reusable** → `src/components/ui/` or `src/components/`
- **Feature-specific** → Co-locate with route (e.g., `src/routes/members/components/`)
- **Complex features** → `src/*/components/`

### Step 2: Create Component File

Create `src/components/[ComponentName].tsx`:

```typescript
import { motion } from 'framer-motion'

interface ComponentNameProps {
  title: string
  children?: React.ReactNode
}

export function ComponentName({ title, children }: ComponentNameProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="class-name"
    >
      <h1>{title}</h1>
      {children}
    </motion.div>
  )
}
```

### Step 3: Add PandaCSS Styling

Use PandaCSS `css` function or recipe:
- Layout: `display: 'flex'`, `gap: '4'`, `padding: '4'`
- Typography: `fontSize: 'lg'`, `fontWeight: 'bold'`, `color: 'stone.700'`
- Colors: `backgroundColor: 'white'`, `borderWidth: '1px'`, `boxShadow: 'sm'`
- Responsive: `sm: { flexDirection: 'row' }`, `lg: { gridTemplateColumns: 'repeat(3, 1fr)' }`

Import from `styled-system`:
```typescript
import { css } from '../../../styled-system/css'
import { button, input } from '../../../styled-system/recipes'
```

### Step 4: Add Animations (optional)

Use Framer Motion for transitions:
```typescript
import { motion } from 'framer-motion'

<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.2 }}
>
```

### Step 5: Create Tests

Create co-located test: `src/components/[ComponentName].test.tsx`

## Checklist

- [ ] Component follows React 19 patterns
- [ ] Props typed with TypeScript interfaces
- [ ] Uses PandaCSS for styling
- [ ] Uses Framer Motion for animations (if needed)
- [ ] Exports named component
- [ ] Tests cover render and interactions
- [ ] Passes `pnpm typecheck` and `pnpm lint`

## Patterns

### Button Component

```typescript
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors'
    const variants = {
      primary: 'bg-emerald-600 text-white hover:bg-emerald-700',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
      ghost: 'hover:bg-gray-100',
    }
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg',
    }
    
    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
```

### Card Component

```typescript
interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-xl border shadow-sm ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }: CardProps) {
  return (
    <div className={`px-6 py-4 border-b ${className}`}>
      {children}
    </div>
  )
}

export function CardContent({ children, className = '' }: CardProps) {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  )
}
```

### Form Input

```typescript
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${className}`}
          {...props}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
```

## Notes

- Use `forwardRef` for components that need ref forwarding
- Co-locate tests next to components
- Use semantic HTML elements
- Keep components small and focused
- Extract reusable parts to `src/components/ui/`
