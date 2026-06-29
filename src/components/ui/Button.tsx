/** Props for the Button component, extending native button attributes */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: 'primary' | 'secondary' | 'ghost'
  /** Size preset */
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

/** Tailwind classes for each button variant */
const variants = {
  primary:
    'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow-md',
  secondary:
    'bg-white text-indigo-600 border border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50',
  ghost:
    'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
}

/** Tailwind classes for each button size */
const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-base',
}

/** Reusable button component with variant and size presets */
export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 cursor-pointer ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
