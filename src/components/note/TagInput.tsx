'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTags, useCreateTag } from '@/queries/tags'

interface TagInputProps {
  selectedTags: { id: string; name: string; color: string }[]
  onChange: (tagIds: string[]) => void
  className?: string
}

export function TagInput({ selectedTags, onChange, className }: TagInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: allTags } = useTags()
  const createTag = useCreateTag()

  const filteredTags = allTags?.filter(
    (tag) =>
      tag.name.toLowerCase().includes(searchValue.toLowerCase()) &&
      !selectedTags.some((st) => st.id === tag.id)
  )

  const handleAddTag = (tag: { id: string; name: string; color: string }) => {
    onChange([...selectedTags.map((t) => t.id), tag.id])
    setSearchValue('')
    setIsOpen(false)
  }

  const handleRemoveTag = (tagId: string) => {
    onChange(selectedTags.filter((t) => t.id !== tagId).map((t) => t.id))
  }

  const handleCreateTag = async () => {
    if (!searchValue.trim()) return

    try {
      const newTag = await createTag.mutateAsync({
        name: searchValue.trim(),
        color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
      })
      handleAddTag(newTag)
    } catch (error) {
      console.error('Failed to create tag:', error)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Selected Tags */}
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedTags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-sm rounded-full"
            style={{
              backgroundColor: `${tag.color}20`,
              color: tag.color,
            }}
          >
            <span>{tag.name}</span>
            <button
              onClick={() => handleRemoveTag(tag.id)}
              className="p-0.5 hover:bg-black/10 rounded-full"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>

      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="태그 추가..."
          className="w-full px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-clova-blue focus:border-transparent"
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
          {filteredTags && filteredTags.length > 0 ? (
            filteredTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => handleAddTag(tag)}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
                <span>{tag.name}</span>
              </button>
            ))
          ) : searchValue ? (
            <button
              onClick={handleCreateTag}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-clova-blue hover:bg-gray-50"
            >
              <Plus className="w-4 h-4" />
              <span>"{searchValue}" 태그 만들기</span>
            </button>
          ) : (
            <p className="px-4 py-2.5 text-sm text-gray-400">
              태그를 검색하거나 새로 만드세요
            </p>
          )}
        </div>
      )}
    </div>
  )
}

