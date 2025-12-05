import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_ID: z.string().optional(),
  GITHUB_SECRET: z.string().optional(),
  TRANSCRIPTION_PROVIDER: z.enum(['mock', 'real']).default('mock'),
  STORAGE_BASE_URL: z.string().default('http://localhost:3000/uploads'),
})

export const env = envSchema.parse(process.env)

