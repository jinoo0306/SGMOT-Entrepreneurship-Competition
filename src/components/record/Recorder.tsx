'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mic, Square, Pause, Play, Upload, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Waveform } from './Waveform'
import { useRecorder } from '@/hooks/useRecorder'
import { useUIStore } from '@/store/uiStore'
import { useCreateNote } from '@/queries/notes'
import { useCreateTranscription } from '@/queries/jobs'
import { cn, formatDuration } from '@/lib/utils'

export function Recorder() {
  const router = useRouter()
  const { addToast } = useUIStore()
  const createNote = useCreateNote()
  const createTranscription = useCreateTranscription()

  const {
    isRecording,
    isPaused,
    recordingTime,
    audioBlob,
    audioUrl,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
  } = useRecorder()

  const [isProcessing, setIsProcessing] = useState(false)

  const handleStartRecording = async () => {
    try {
      await startRecording()
    } catch (error) {
      addToast('마이크 접근 권한이 필요합니다', 'error')
    }
  }

  const handleSaveRecording = async () => {
    if (!audioBlob) return

    setIsProcessing(true)

    try {
      // 실제 구현에서는 오디오를 서버에 업로드하고 URL을 받아야 함
      // 여기서는 임시로 Mock URL 사용
      const mockAudioUrl = `/uploads/recording-${Date.now()}.webm`

      // 노트 생성
      const note = await createNote.mutateAsync({
        title: `녹음 ${new Date().toLocaleString('ko-KR')}`,
        content: '',
        audioUrl: mockAudioUrl,
      })

      // 전사 작업 생성
      await createTranscription.mutateAsync({
        audioUrl: mockAudioUrl,
        sourceType: 'record',
        noteId: note.id,
        language: 'ko',
      })

      addToast('녹음이 저장되었습니다', 'success')
      resetRecording()
      router.push(`/notes/${note.id}`)
    } catch (error) {
      addToast('저장에 실패했습니다', 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-12">
      {/* Waveform or Recording Animation */}
      <div className="w-full max-w-md mb-12">
        {isRecording ? (
          <div className="flex items-center justify-center gap-1 h-24">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-1 bg-clova-blue rounded-full transition-all duration-150',
                  isPaused ? 'h-2' : ''
                )}
                style={{
                  height: isPaused
                    ? '8px'
                    : `${Math.random() * 60 + 20}px`,
                  animationDelay: `${i * 50}ms`,
                }}
              />
            ))}
          </div>
        ) : audioUrl ? (
          <Waveform audioUrl={audioUrl} />
        ) : (
          <div className="flex items-center justify-center h-24">
            <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
              <Mic className="w-12 h-12 text-gray-400" />
            </div>
          </div>
        )}
      </div>

      {/* Recording Time */}
      <div className="text-4xl font-mono font-bold text-gray-900 mb-8">
        {formatDuration(recordingTime)}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {!isRecording && !audioBlob && (
          <Button
            size="lg"
            onClick={handleStartRecording}
            className="w-48 h-14 text-lg rounded-full"
          >
            <Mic className="w-6 h-6 mr-2" />
            녹음 시작
          </Button>
        )}

        {isRecording && (
          <>
            <Button
              variant="ghost"
              size="lg"
              onClick={isPaused ? resumeRecording : pauseRecording}
              className="w-14 h-14 rounded-full"
            >
              {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
            </Button>

            <Button
              variant="danger"
              size="lg"
              onClick={stopRecording}
              className="w-14 h-14 rounded-full"
            >
              <Square className="w-6 h-6" />
            </Button>
          </>
        )}

        {audioBlob && (
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              size="lg"
              onClick={resetRecording}
              className="px-6 h-14 rounded-full"
            >
              다시 녹음
            </Button>

            <Button
              size="lg"
              onClick={handleSaveRecording}
              disabled={isProcessing}
              className="px-8 h-14 rounded-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  처리 중...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  저장 및 전사
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Help Text */}
      {!isRecording && !audioBlob && (
        <p className="mt-8 text-sm text-gray-500 text-center max-w-sm">
          녹음 버튼을 눌러 음성을 녹음하세요.
          <br />
          녹음된 음성은 자동으로 텍스트로 변환됩니다.
        </p>
      )}

      {/* Audio Preview */}
      {audioUrl && !isRecording && (
        <div className="mt-8 w-full max-w-md">
          <audio
            src={audioUrl}
            controls
            className="w-full rounded-xl"
          />
        </div>
      )}
    </div>
  )
}

