'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/useDebounce'

interface SearchInputProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  autoFocus?: boolean
  className?: string
  onSearch?: (value: string) => void
  showSuggestions?: boolean
}

export function SearchInput({
  value: externalValue,
  onChange,
  placeholder = '노트 검색...',
  autoFocus = false,
  className,
  onSearch,
  showSuggestions = false,
}: SearchInputProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [internalValue, setInternalValue] = useState(externalValue || '')
  const [isFocused, setIsFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const value = externalValue !== undefined ? externalValue : internalValue
  const debouncedValue = useDebounce(value, 300)

  const handleChange = useCallback((newValue: string) => {
    if (onChange) {
      onChange(newValue)
    } else {
      setInternalValue(newValue)
    }
  }, [onChange])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (onSearch) {
      onSearch(value)
    } else if (value.trim()) {
      router.push(`/search?q=${encodeURIComponent(value.trim())}`)
    }
  }, [value, onSearch, router])

  const handleClear = useCallback(() => {
    handleChange('')
    inputRef.current?.focus()
  }, [handleChange])

  // Keyboard shortcut (⌘K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        inputRef.current?.blur()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus()
    }
  }, [autoFocus])

  return (
    <form onSubmit={handleSubmit} className={cn('relative', className)}>
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl',
          'transition-all duration-200',
          isFocused && 'border-clova-blue ring-2 ring-clova-blue/20'
        )}
      >
        <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-gray-900 placeholder:text-gray-400 outline-none"
        />
        {isLoading && (
          <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
        )}
        {value && !isLoading && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </form>
  )
}

