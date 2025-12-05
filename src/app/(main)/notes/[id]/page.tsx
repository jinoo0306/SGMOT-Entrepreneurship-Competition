'use client'

import { use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Mic } from 'lucide-react'
import { NoteEditor } from '@/components/note/NoteEditor'
import { Toolbar } from '@/components/note/Toolbar'
import { TranscriptionProgress } from '@/components/record/TranscriptionProgress'
import { useNote, useUpdateNote, useDeleteNote, useShareNote } from '@/queries/notes'
import { useUIStore } from '@/store/uiStore'
import { formatDuration } from '@/lib/utils'

export default function NoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { addToast } = useUIStore()
  
  const { data: note, isLoading, error } = useNote(id)
  const updateNote = useUpdateNote()
  const deleteNote = useDeleteNote()
  const shareNote = useShareNote()

  useEffect(() => {
    if (error) {
      addToast('노트를 찾을 수 없습니다', 'error')
      router.push('/notes')
    }
  }, [error, addToast, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-clova-blue" />
      </div>
    )
  }

  if (!note) {
    return null
  }

  const handleFavorite = () => {
    updateNote.mutate(
      { id: note.id, isFavorite: !note.isFavorite },
      {
        onSuccess: () => {
          addToast(
            note.isFavorite ? '즐겨찾기에서 제거되었습니다' : '즐겨찾기에 추가되었습니다',
            'success'
          )
        },
      }
    )
  }

  const handleShare = () => {
    shareNote.mutate(note.id, {
      onSuccess: () => {
        addToast('공유 링크가 생성되었습니다', 'success')
      },
    })
  }

  const handleDelete = () => {
    deleteNote.mutate(note.id, {
      onSuccess: () => {
        addToast('노트가 삭제되었습니다', 'success')
        router.push('/notes')
      },
    })
  }

  const handleFolderChange = (folderId: string | null) => {
    updateNote.mutate(
      { id: note.id, folderId },
      {
        onSuccess: () => {
          addToast('폴더가 변경되었습니다', 'success')
        },
      }
    )
  }

  const handleTagsChange = (tagIds: string[]) => {
    updateNote.mutate(
      { id: note.id, tagIds },
      {
        onSuccess: () => {
          addToast('태그가 업데이트되었습니다', 'success')
        },
      }
    )
  }

  // Get the latest transcription job
  const latestJob = (note as any).transcriptionJobs?.[0]

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <Toolbar
        note={note}
        onFavorite={handleFavorite}
        onShare={handleShare}
        onDelete={handleDelete}
        onFolderChange={handleFolderChange}
        onTagsChange={handleTagsChange}
      />

      <div className="flex-1 max-w-4xl mx-auto w-full p-6 lg:p-8">
        {/* Audio Info */}
        {note.audioUrl && (
          <div className="mb-6 p-4 bg-clova-blue/5 rounded-2xl border border-clova-blue/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-clova-blue/10 rounded-xl flex items-center justify-center">
                <Mic className="w-5 h-5 text-clova-blue" />
              </div>
              <div>
                <p className="font-medium text-gray-900">음성 메모</p>
                {note.duration && (
                  <p className="text-sm text-gray-500">
                    {formatDuration(note.duration)}
                  </p>
                )}
              </div>
            </div>
            
            {/* Transcription Progress */}
            {latestJob && latestJob.status !== 'SUCCEEDED' && (
              <TranscriptionProgress
                jobId={latestJob.id}
                onComplete={(text) => {
                  // Note content will be updated by the job processor
                }}
              />
            )}
          </div>
        )}

        {/* Note Editor */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <NoteEditor
            noteId={note.id}
            initialTitle={note.title}
            initialContent={note.content}
          />
        </div>

        {/* Tags Display */}
        {note.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {note.tags.map(({ tag }) => (
              <span
                key={tag.id}
                className="inline-flex items-center px-3 py-1 text-sm rounded-full"
                style={{
                  backgroundColor: `${tag.color}15`,
                  color: tag.color,
                }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

