'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useEditorStore } from '@/store/editorStore'
import { useUIStore } from '@/store/uiStore'
import { useUpdateNote } from '@/queries/notes'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/lib/utils'

interface NoteEditorProps {
  noteId: string
  initialTitle: string
  initialContent: string
  className?: string
}

export function NoteEditor({ noteId, initialTitle, initialContent, className }: NoteEditorProps) {
  const {
    titleDraft,
    contentDraft,
    isDirty,
    isSaving,
    setCurrentNote,
    setTitleDraft,
    setContentDraft,
    markSaved,
    setIsSaving,
  } = useEditorStore()

  const { addToast } = useUIStore()
  const updateNote = useUpdateNote()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const debouncedTitle = useDebounce(titleDraft, 1000)
  const debouncedContent = useDebounce(contentDraft, 1000)

  // Initialize editor with note data
  useEffect(() => {
    setCurrentNote(noteId, initialTitle, initialContent)
  }, [noteId, initialTitle, initialContent, setCurrentNote])

  // Auto-save when debounced values change
  useEffect(() => {
    if (!isDirty) return

    const save = async () => {
      try {
        setIsSaving(true)
        await updateNote.mutateAsync({
          id: noteId,
          title: debouncedTitle,
          content: debouncedContent,
        })
        markSaved()
      } catch (error) {
        addToast('저장에 실패했습니다', 'error')
      }
    }

    save()
  }, [debouncedTitle, debouncedContent, isDirty, noteId])

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }, [])

  useEffect(() => {
    adjustTextareaHeight()
  }, [contentDraft, adjustTextareaHeight])

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Title Input */}
      <input
        type="text"
        value={titleDraft}
        onChange={(e) => setTitleDraft(e.target.value)}
        placeholder="제목을 입력하세요"
        className="text-3xl font-bold text-gray-900 placeholder:text-gray-300 outline-none border-none bg-transparent mb-4"
      />

      {/* Content Textarea */}
      <textarea
        ref={textareaRef}
        value={contentDraft}
        onChange={(e) => {
          setContentDraft(e.target.value)
          adjustTextareaHeight()
        }}
        placeholder="내용을 입력하세요..."
        className="flex-1 text-gray-700 leading-relaxed placeholder:text-gray-400 outline-none border-none bg-transparent resize-none min-h-[300px]"
      />

      {/* Save Status */}
      <div className="fixed bottom-6 right-6">
        <div
          className={cn(
            'px-3 py-1.5 text-xs font-medium rounded-full transition-all',
            isSaving
              ? 'bg-yellow-100 text-yellow-700'
              : isDirty
              ? 'bg-orange-100 text-orange-700'
              : 'bg-green-100 text-green-700'
          )}
        >
          {isSaving ? '저장 중...' : isDirty ? '저장되지 않음' : '저장됨'}
        </div>
      </div>
    </div>
  )
}

