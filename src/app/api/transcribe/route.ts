import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import prisma from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { mockAdapter } from '@/lib/transcription/mockAdapter'

const transcribeSchema = z.object({
  audioUrl: z.string().min(1),
  language: z.string().default('ko'),
  sourceType: z.enum(['upload', 'record']),
  noteId: z.string().optional(),
})

// POST /api/transcribe - Create transcription job
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { audioUrl, language, sourceType, noteId } = transcribeSchema.parse(body)

    // If noteId provided, verify it belongs to user
    if (noteId) {
      const note = await prisma.note.findFirst({
        where: {
          id: noteId,
          userId: session.user.id,
        },
      })

      if (!note) {
        return NextResponse.json({ error: 'Note not found' }, { status: 404 })
      }
    }

    // Submit to transcription adapter
    const { jobId: externalJobId } = await mockAdapter.submit({ audioUrl, language })

    // Create job record in database
    const job = await prisma.transcriptionJob.create({
      data: {
        userId: session.user.id,
        noteId,
        status: 'PENDING',
        sourceType,
        audioUrl,
        language,
      },
    })

    // Start background processing simulation
    processTranscription(job.id, externalJobId, noteId)

    return NextResponse.json(job, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Failed to create transcription job:', error)
    return NextResponse.json(
      { error: 'Failed to create transcription job' },
      { status: 500 }
    )
  }
}

// Background processing function
async function processTranscription(
  dbJobId: string,
  externalJobId: string,
  noteId?: string
) {
  const checkStatus = async () => {
    try {
      const result = await mockAdapter.get(externalJobId)

      // Update job status in database
      await prisma.transcriptionJob.update({
        where: { id: dbJobId },
        data: {
          status: result.status,
          result: result.text,
          error: result.error,
        },
      })

      // If completed and noteId provided, update note content
      if (result.status === 'SUCCEEDED' && result.text && noteId) {
        await prisma.note.update({
          where: { id: noteId },
          data: {
            content: result.text,
          },
        })
      }

      // Continue polling if not finished
      if (result.status === 'PENDING' || result.status === 'PROCESSING') {
        setTimeout(checkStatus, 1000)
      }
    } catch (error) {
      console.error('Transcription processing error:', error)
      await prisma.transcriptionJob.update({
        where: { id: dbJobId },
        data: {
          status: 'FAILED',
          error: 'Processing failed',
        },
      })
    }
  }

  // Start checking status
  setTimeout(checkStatus, 1000)
}

