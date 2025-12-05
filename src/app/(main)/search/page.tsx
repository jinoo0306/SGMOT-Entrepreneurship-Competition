'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Clock, FileText } from 'lucide-react'
import { SearchInput } from '@/components/common/SearchInput'
import { NoteCard } from '@/components/note/NoteCard'
import { EmptyState } from '@/components/common/EmptyState'
import { useNotes, useUpdateNote } from '@/queries/notes'
import { useDebounce } from '@/hooks/useDebounce'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const [query, setQuery] = useState(initialQuery)
  const debouncedQuery = useDebounce(query, 300)

  const { data, isLoading } = useNotes({
    q: debouncedQuery || undefined,
  })

  const updateNote = useUpdateNote()

  const handleFavorite = (id: string, isFavorite: boolean) => {
    updateNote.mutate({ id, isFavorite })
  }

  // Recent searches (stored in localStorage)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('clova-note-recent-searches')
    if (stored) {
      setRecentSearches(JSON.parse(stored))
    }
  }, [])

  useEffect(() => {
    if (debouncedQuery && !recentSearches.includes(debouncedQuery)) {
      const updated = [debouncedQuery, ...recentSearches.slice(0, 4)]
      setRecentSearches(updated)
      localStorage.setItem('clova-note-recent-searches', JSON.stringify(updated))
    }
  }, [debouncedQuery])

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('clova-note-recent-searches')
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">검색</h1>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="노트 제목이나 내용을 검색하세요..."
          autoFocus
          className="max-w-full"
        />
      </div>

      {/* Search Results or Recent Searches */}
      {query ? (
        // Search Results
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              검색 결과 {data?.total ? `(${data.total})` : ''}
            </h2>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse"
                >
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-gray-100 rounded w-full mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-5/6" />
                </div>
              ))}
            </div>
          ) : data?.notes && data.notes.length > 0 ? (
            <div className="space-y-4">
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
              icon="search"
              title="검색 결과가 없습니다"
              description={`"${query}"에 대한 결과를 찾을 수 없습니다. 다른 키워드로 검색해보세요.`}
            />
          )}
        </div>
      ) : (
        // Recent Searches & Tips
        <div>
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-900">최근 검색</h2>
                </div>
                <button
                  onClick={clearRecentSearches}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  모두 삭제
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => setQuery(search)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm text-gray-700 transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Tips */}
          <div className="bg-clova-blue/5 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-5 h-5 text-clova-blue" />
              <h2 className="font-semibold text-gray-900">검색 팁</h2>
            </div>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-clova-blue font-medium">•</span>
                <span>노트 제목이나 내용에 포함된 키워드로 검색하세요</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-clova-blue font-medium">•</span>
                <span>여러 단어를 입력하면 모든 단어가 포함된 노트를 찾습니다</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-clova-blue font-medium">•</span>
                <span>키보드 단축키 ⌘K (또는 Ctrl+K)로 빠르게 검색창을 열 수 있습니다</span>
              </li>
            </ul>
          </div>

          {/* All Notes Preview */}
          {data?.notes && data.notes.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900">모든 노트</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {data.notes.slice(0, 4).map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onFavorite={handleFavorite}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

