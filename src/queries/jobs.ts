import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface TranscriptionJob {
  id: string
  status: 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED'
  sourceType: string
  audioUrl: string
  language: string
  result?: string | null
  error?: string | null
  noteId?: string | null
  createdAt: string
  updatedAt: string
}

export function useJob(
  id: string | null,
  options?: {
    refetchInterval?: number | false | ((data: TranscriptionJob | undefined) => number | false | undefined)
  }
) {
  return useQuery<TranscriptionJob | null>({
    queryKey: ['job', id],
    queryFn: async () => {
      if (!id) return null
      const res = await fetch(`/api/jobs/${id}`)
      if (!res.ok) throw new Error('Failed to fetch job')
      return res.json() as Promise<TranscriptionJob>
    },
    enabled: !!id,
    refetchInterval: options?.refetchInterval,
  })
}

export function useCreateTranscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { audioUrl: string; language?: string; sourceType: 'upload' | 'record'; noteId?: string }) => {
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create transcription job')
      return res.json() as Promise<TranscriptionJob>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })
}

