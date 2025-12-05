'use client'

import { forwardRef, ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  isLoading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center font-medium 
      transition-all duration-200 
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
    `

    const variants: Record<string, string> = {
      primary: 'bg-[#03C75A] text-white hover:bg-[#02B150] focus:ring-[#03C75A] rounded-lg shadow-sm',
      secondary: 'bg-[#F5F6F8] text-[#1E1E1E] hover:bg-[#E8E8E8] focus:ring-gray-400 rounded-lg',
      ghost: 'text-[#666666] hover:bg-[#F5F6F8] focus:ring-gray-400 rounded-lg',
      danger: 'bg-[#FF3B30] text-white hover:bg-[#E63529] focus:ring-[#FF3B30] rounded-lg',
      outline: 'border border-[#E8E8E8] text-[#1E1E1E] hover:bg-[#F5F6F8] focus:ring-[#03C75A] rounded-lg',
    }

    const sizes: Record<string, string> = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
      icon: 'p-2',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
