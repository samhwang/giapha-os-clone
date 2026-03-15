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

```tsx
interface ComponentNameProps {
  title: string
  children?: React.ReactNode
}

export function ComponentName({ title, children }: ComponentNameProps) {
  return (
    <div className="animate-[fade-in_0.3s_ease-out_forwards]">
      <h1>{title}</h1>
      {children}
    </div>
  )
}
```

### Step 3: Add Tailwind Styling

Use Tailwind v4 classes:
- Layout: `flex`, `grid`, `p-4`, `m-2`
- Typography: `text-lg`, `font-bold`, `text-gray-700`
- Colors: `bg-white`, `border`, `shadow-sm`
- Responsive: `md:flex`, `lg:grid-cols-3`

### Step 4: Add Animations (optional)

Use Tailwind CSS animations (custom keyframes in `src/styles.css`):
```tsx
// Fade in with slide up
<div className="animate-[fade-in-up_0.3s_ease-out_forwards]">

// Transition on hover/focus
<button className="transition-all duration-200 hover:scale-105">
```

### Step 5: Create Tests

Create co-located test: `src/components/[ComponentName].test.tsx`

## Checklist

- [ ] Component follows React 19 patterns
- [ ] Props typed with TypeScript interfaces
- [ ] Uses Tailwind CSS for styling
- [ ] Uses Tailwind CSS for animations (if needed)
- [ ] Exports named component
- [ ] Tests cover render and interactions
- [ ] Passes `pnpm typecheck` and `pnpm lint`

## Patterns

### Button Component

```tsx
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../ui/utils/cn'

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
        className={cn(baseStyles, variants[variant], sizes[size], className)}
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

```tsx
import { cn } from '../../ui/utils/cn'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={cn('bg-white rounded-xl border shadow-sm', className)}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }: CardProps) {
  return (
    <div className={cn('px-6 py-4 border-b', className)}>
      {children}
    </div>
  )
}

export function CardContent({ children, className = '' }: CardProps) {
  return (
    <div className={cn('px-6 py-4', className)}>
      {children}
    </div>
  )
}
```

### Form Input

```tsx
import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../ui/utils/cn'

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
          className={cn(
            'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500',
            error && 'border-red-500',
            className
          )}
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
