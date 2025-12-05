import { TranscriptionAdapter, JobStatus } from './adapter'

// 메모리 내 Job 상태 저장 (실제 환경에서는 DB 사용)
const jobs = new Map<string, {
  status: JobStatus
  text?: string
  error?: string
  progress: number
  createdAt: number
}>()

const MOCK_TRANSCRIPTION_TEXTS = [
  '안녕하세요, 오늘 회의에서는 프로젝트 진행 상황에 대해 논의하겠습니다. 먼저 개발팀에서 진행 중인 기능들에 대해 설명해 주시기 바랍니다.',
  '지난 주에 계획했던 대로 API 개발이 완료되었습니다. 현재 테스트 단계에 있으며, 다음 주 초에 배포할 예정입니다.',
  '마케팅 팀에서는 새로운 캠페인을 준비하고 있습니다. SNS와 이메일 마케팅을 병행하여 진행할 예정이며, 예상 도달률은 약 30%입니다.',
  '고객 피드백을 분석한 결과, 사용자들이 가장 원하는 기능은 음성 메모 기능입니다. 이 부분을 우선적으로 개발하는 것이 좋겠습니다.',
  '다음 분기 목표는 사용자 수 50% 증가입니다. 이를 위해 마케팅 예산을 20% 늘리고, 신규 기능 3개를 출시할 계획입니다.',
]

export const mockAdapter: TranscriptionAdapter = {
  async submit(req) {
    const jobId = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    jobs.set(jobId, {
      status: 'PENDING',
      progress: 0,
      createdAt: Date.now(),
    })

    // 비동기로 상태 전환 시뮬레이션
    setTimeout(() => {
      const job = jobs.get(jobId)
      if (job) {
        job.status = 'PROCESSING'
        job.progress = 30
      }
    }, 1000)

    setTimeout(() => {
      const job = jobs.get(jobId)
      if (job) {
        job.progress = 60
      }
    }, 2000)

    setTimeout(() => {
      const job = jobs.get(jobId)
      if (job) {
        job.progress = 90
      }
    }, 3000)

    setTimeout(() => {
      const job = jobs.get(jobId)
      if (job) {
        job.status = 'SUCCEEDED'
        job.progress = 100
        job.text = MOCK_TRANSCRIPTION_TEXTS[Math.floor(Math.random() * MOCK_TRANSCRIPTION_TEXTS.length)]
      }
    }, 4000)

    return { jobId }
  },

  async get(jobId) {
    const job = jobs.get(jobId)
    
    if (!job) {
      return {
        status: 'FAILED' as JobStatus,
        error: 'Job not found',
      }
    }

    return {
      status: job.status,
      text: job.text,
      error: job.error,
      progress: job.progress,
    }
  },
}

