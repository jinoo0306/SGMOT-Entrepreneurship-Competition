export type TranscribeRequest = {
  audioUrl: string
  language: string
}

export type TranscribeResult = {
  text: string
  segments?: {
    start: number
    end: number
    text: string
    speaker?: string
  }[]
}

export type JobStatus = 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED'

export interface TranscriptionAdapter {
  submit(req: TranscribeRequest): Promise<{ jobId: string }>
  get(jobId: string): Promise<{
    status: JobStatus
    text?: string
    error?: string
    progress?: number
  }>
}

