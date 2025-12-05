'use client'

import Link from 'next/link'
import { Star, Folder, Clock, Mic } from 'lucide-react'
import type { Note } from '@/queries/notes'

interface NoteCardProps {
  note: Note
  onFavorite?: (id: string, isFavorite: boolean) => void
  onDelete?: (id: string) => void
}

function formatDate(date: string): string {
  const d = new Date(date)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - d.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  } else if (diffDays === 1) {
    return '어제'
  } else if (diffDays < 7) {
    return `${diffDays}일 전`
  } else {
    return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  }
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function NoteCard({ note, onFavorite }: NoteCardProps) {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onFavorite?.(note.id, !note.isFavorite)
  }

  return (
    <Link href={`/notes/${note.id}`}>
      <div className="bg-white rounded-xl border border-[#E8E8E8] hover:border-[#D0D0D0] hover:shadow-md transition-all duration-200 cursor-pointer group">
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[#1E1E1E] truncate group-hover:text-[#03C75A] transition-colors">
                {note.title || '제목 없음'}
              </h3>
              {note.folder && (
                <div className="flex items-center gap-1 mt-1">
                  <Folder className="w-3 h-3 text-[#999999]" />
                  <span className="text-xs text-[#999999]">{note.folder.name}</span>
                </div>
              )}
            </div>
            <button
              onClick={handleFavoriteClick}
              className={`
                p-1.5 rounded-lg transition-colors
                ${note.isFavorite
                  ? 'text-[#FF9500]'
                  : 'text-[#D0D0D0] hover:text-[#FF9500] opacity-0 group-hover:opacity-100'
                }
              `}
            >
              <Star
                className="w-4 h-4"
                fill={note.isFavorite ? 'currentColor' : 'none'}
              />
            </button>
          </div>

          {/* Content Preview */}
          <p className="text-sm text-[#666666] line-clamp-2 mb-4 min-h-[40px]">
            {note.content ? truncateText(note.content, 100) : '내용이 없습니다'}
          </p>

          {/* Tags */}
          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {note.tags.slice(0, 3).map(({ tag }) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full"
                  style={{
                    backgroundColor: `${tag.color}15`,
                    color: tag.color,
                  }}
                >
                  {tag.name}
                </span>
              ))}
              {note.tags.length > 3 && (
                <span className="text-xs text-[#999999]">
                  +{note.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-[#999999]">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatDate(note.updatedAt)}</span>
            </div>
            {note.audioUrl && (
              <div className="flex items-center gap-1 text-[#03C75A]">
                <Mic className="w-3 h-3" />
                <span>음성</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
