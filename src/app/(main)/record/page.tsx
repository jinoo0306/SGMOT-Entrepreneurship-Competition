'use client'

import { Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Recorder } from '@/components/record/Recorder'
import { useUIStore } from '@/store/uiStore'
import { useCreateNote } from '@/queries/notes'
import { useCreateTranscription } from '@/queries/jobs'

export default function RecordPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addToast } = useUIStore()
  const createNote = useCreateNote()
  const createTranscription = useCreateTranscription()
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      addToast('오디오 파일만 업로드할 수 있습니다', 'error')
      return
    }

    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      addToast('파일 크기는 100MB 이하여야 합니다', 'error')
      return
    }

    setIsUploading(true)

    try {
      // In a real app, you would upload the file to a storage service
      // For now, we'll use a mock URL
      const mockAudioUrl = `/uploads/${file.name}`

      // Create note
      const note = await createNote.mutateAsync({
        title: file.name.replace(/\.[^/.]+$/, ''),
        content: '',
        audioUrl: mockAudioUrl,
      })

      // Create transcription job
      await createTranscription.mutateAsync({
        audioUrl: mockAudioUrl,
        sourceType: 'upload',
        noteId: note.id,
        language: 'ko',
      })

      addToast('파일이 업로드되었습니다', 'success')
      router.push(`/notes/${note.id}`)
    } catch (error) {
      addToast('업로드에 실패했습니다', 'error')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
          녹음하기
        </h1>
        <p className="text-gray-600">
          음성을 녹음하거나 오디오 파일을 업로드하세요
        </p>
      </div>

      {/* Recorder */}
      <Card className="mb-6">
        <CardContent className="p-6 lg:p-8">
          <Recorder />
        </CardContent>
      </Card>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-background text-gray-500">또는</span>
        </div>
      </div>

      {/* File Upload */}
      <Card>
        <CardContent className="p-6 lg:p-8">
          <div
            className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-clova-blue hover:bg-clova-blue/5 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">
              오디오 파일 업로드
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              MP3, WAV, M4A, WebM 형식 지원 (최대 100MB)
            </p>
            <Button
              variant="outline"
              isLoading={isUploading}
              onClick={(e) => {
                e.stopPropagation()
                fileInputRef.current?.click()
              }}
            >
              파일 선택
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <div className="mt-8 p-6 bg-clova-blue/5 rounded-2xl">
        <h3 className="font-semibold text-gray-900 mb-3">녹음 팁</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-clova-blue">•</span>
            조용한 환경에서 녹음하면 전사 정확도가 높아집니다
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clova-blue">•</span>
            마이크와 적당한 거리(20-30cm)를 유지하세요
          </li>
          <li className="flex items-start gap-2">
            <span className="text-clova-blue">•</span>
            명확하고 천천히 말하면 더 정확한 결과를 얻을 수 있습니다
          </li>
        </ul>
      </div>
    </div>
  )
}

