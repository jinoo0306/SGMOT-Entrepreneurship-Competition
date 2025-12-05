'use client'

import { ReactNode } from 'react'
import { FileText, Mic, Search, Folder, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: 'notes' | 'record' | 'search' | 'folder' | 'tag'
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

const icons = {
  notes: FileText,
  record: Mic,
  search: Search,
  folder: Folder,
  tag: Tag,
}

export function EmptyState({
  icon = 'notes',
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const Icon = icons[icon]

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4',
        className
      )}
    >
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 text-center">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-gray-500 text-center max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

