'use client'

import { useEffect } from 'react'
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useJob, type TranscriptionJob } from '@/queries/jobs'

interface TranscriptionProgressProps {
  jobId: string
  onComplete?: (text: string) => void
  onError?: (error: string) => void
}

export function TranscriptionProgress({
  jobId,
  onComplete,
  onError,
}: TranscriptionProgressProps) {
  const { data: job, isLoading } = useJob(jobId, {
    refetchInterval: (data) => {
      if (!data) return 1000
      if (data.status === 'SUCCEEDED' || data.status === 'FAILED') return false
      return 1000
    },
  })

  const typedJob = job as TranscriptionJob | null | undefined

  useEffect(() => {
    if (typedJob?.status === 'SUCCEEDED' && typedJob.result) {
      onComplete?.(typedJob.result)
    }
    if (typedJob?.status === 'FAILED') {
      onError?.(typedJob.error || '전사에 실패했습니다')
    }
  }, [typedJob?.status, typedJob?.result, typedJob?.error, onComplete, onError])

  const statusConfig = {
    PENDING: {
      icon: Clock,
      label: '대기 중',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
    },
    PROCESSING: {
      icon: Loader2,
      label: '전사 중',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    SUCCEEDED: {
      icon: CheckCircle,
      label: '완료',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    FAILED: {
      icon: XCircle,
      label: '실패',
      color: 'text-red-500',
      bgColor: 'bg-red-50',
    },
  }

  const status = typedJob?.status || 'PENDING'
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className={cn('rounded-xl p-4', config.bgColor)}>
      <div className="flex items-center gap-3">
        <Icon
          className={cn(
            'w-5 h-5',
            config.color,
            status === 'PROCESSING' && 'animate-spin'
          )}
        />
        <div className="flex-1">
          <p className={cn('font-medium', config.color)}>{config.label}</p>
          {status === 'PROCESSING' && (
            <p className="text-sm text-gray-500 mt-1">
              음성을 텍스트로 변환하고 있습니다...
            </p>
          )}
          {status === 'FAILED' && typedJob?.error && (
            <p className="text-sm text-red-600 mt-1">{typedJob.error}</p>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {(status === 'PENDING' || status === 'PROCESSING') && (
        <div className="mt-3 h-1.5 bg-white rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              status === 'PENDING' ? 'bg-yellow-400 w-1/4' : 'bg-blue-400'
            )}
            style={{
              width: status === 'PROCESSING' ? '75%' : undefined,
              animation: status === 'PROCESSING' ? 'pulse 2s infinite' : undefined,
            }}
          />
        </div>
      )}
    </div>
  )
}

