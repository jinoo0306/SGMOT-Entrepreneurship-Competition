'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Plus, Grid, List, SlidersHorizontal, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { NoteCard } from '@/components/note/NoteCard'
import { EmptyState } from '@/components/common/EmptyState'
import { useNotes, useUpdateNote } from '@/queries/notes'

type ViewMode = 'grid' | 'list'
type SortMode = 'newest' | 'oldest' | 'title'

export default function NotesPage() {
  const searchParams = useSearchParams()
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortMode, setSortMode] = useState<SortMode>('newest')
  const [showSortMenu, setShowSortMenu] = useState(false)

  const tag = searchParams.get('tag') || undefined
  const folder = searchParams.get('folder') || undefined
  const favorite = searchParams.get('favorite') === 'true'

  const { data, isLoading } = useNotes({
    tag,
    folder,
    favorite: favorite || undefined,
    sort: sortMode,
  })

  const updateNote = useUpdateNote()

  const handleFavorite = (id: string, isFavorite: boolean) => {
    updateNote.mutate({ id, isFavorite })
  }

  const sortOptions = [
    { value: 'newest', label: '최신순' },
    { value: 'oldest', label: '오래된순' },
    { value: 'title', label: '이름순' },
  ]

  const getTitle = () => {
    if (favorite) return '즐겨찾기'
    return '모든 노트'
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{getTitle()}</h1>
          <p className="text-gray-500 mt-1">
            {data?.total || 0}개의 노트
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="hidden md:flex items-center bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Sort */}
          <div className="relative">
            <Button
              variant="secondary"
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="gap-2"
            >
              <ArrowUpDown className="w-4 h-4" />
              <span className="hidden sm:inline">정렬</span>
            </Button>

            {showSortMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowSortMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortMode(option.value as SortMode)
                        setShowSortMenu(false)
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                        sortMode === option.value
                          ? 'text-clova-blue font-medium'
                          : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* New Note Button */}
          <Link href="/notes/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">새 노트</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Notes Grid/List */}
      {isLoading ? (
        <div className={`grid gap-4 ${
          viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
        }`}>
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse"
            >
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-full mb-2" />
              <div className="h-4 bg-gray-100 rounded w-5/6 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-4/6" />
            </div>
          ))}
        </div>
      ) : data?.notes && data.notes.length > 0 ? (
        <div className={`grid gap-4 ${
          viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
        }`}>
          {data.notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onFavorite={handleFavorite}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={favorite ? 'tag' : 'notes'}
          title={favorite ? '즐겨찾기한 노트가 없습니다' : '노트가 없습니다'}
          description={
            favorite
              ? '노트에서 별표를 눌러 즐겨찾기에 추가하세요'
              : '첫 번째 노트를 작성해보세요!'
          }
          action={
            !favorite && (
              <Link href="/notes/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  새 노트 만들기
                </Button>
              </Link>
            )
          }
        />
      )}
    </div>
  )
}

