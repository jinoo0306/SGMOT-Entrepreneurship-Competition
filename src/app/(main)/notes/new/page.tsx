'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useCreateNote } from '@/queries/notes'
import { useUIStore } from '@/store/uiStore'

export default function NewNotePage() {
  const router = useRouter()
  const { addToast } = useUIStore()
  const createNote = useCreateNote()
  
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async () => {
    if (isCreating) return
    
    setIsCreating(true)
    
    try {
      const note = await createNote.mutateAsync({
        title: title || '제목 없는 노트',
        content,
      })
      
      router.push(`/notes/${note.id}`)
    } catch (error) {
      addToast('노트 생성에 실패했습니다', 'error')
      setIsCreating(false)
    }
  }

  // Auto-create note on first keystroke
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    
    // Create note after typing title
    if (newTitle.length === 1 && !isCreating) {
      handleCreate()
    }
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)
    
    // Create note after typing content
    if (newContent.length === 1 && !isCreating && !title) {
      handleCreate()
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-8">
      {isCreating ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-clova-blue mx-auto mb-4" />
            <p className="text-gray-500">노트를 생성하고 있습니다...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="제목을 입력하세요"
            className="w-full text-3xl font-bold text-gray-900 placeholder:text-gray-300 outline-none border-none bg-transparent mb-6"
            autoFocus
          />
          
          <textarea
            value={content}
            onChange={handleContentChange}
            placeholder="내용을 입력하세요..."
            className="w-full text-gray-700 leading-relaxed placeholder:text-gray-400 outline-none border-none bg-transparent resize-none min-h-[400px]"
          />
        </div>
      )}
    </div>
  )
}

