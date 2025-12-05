'use client'

import { forwardRef, InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, label, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={id} 
            className="block text-sm font-medium text-[#1E1E1E] mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`
            w-full px-4 py-3 
            text-[#1E1E1E] text-sm
            bg-white 
            border border-[#E8E8E8] 
            rounded-lg
            placeholder:text-[#999999]
            focus:outline-none focus:border-[#03C75A] focus:ring-1 focus:ring-[#03C75A]
            transition-colors duration-200
            disabled:bg-[#F5F6F8] disabled:text-[#999999] disabled:cursor-not-allowed
            ${error ? 'border-[#FF3B30] focus:border-[#FF3B30] focus:ring-[#FF3B30]' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-[#FF3B30]">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
