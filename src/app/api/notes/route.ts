import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import prisma from '@/lib/db'
import { authOptions } from '@/lib/auth'

const createNoteSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  content: z.string().optional(),
  audioUrl: z.string().optional(),
  folderId: z.string().optional(),
})

// GET /api/notes - List notes
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')
    const tag = searchParams.get('tag')
    const folder = searchParams.get('folder')
    const favorite = searchParams.get('favorite')
    const sort = searchParams.get('sort') || 'newest'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {
      userId: session.user.id,
    }

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { content: { contains: q } },
      ]
    }

    if (tag) {
      where.tags = {
        some: { tagId: tag },
      }
    }

    if (folder) {
      where.folderId = folder
    }

    if (favorite === 'true') {
      where.isFavorite = true
    }

    const orderBy: any = {}
    if (sort === 'newest') {
      orderBy.updatedAt = 'desc'
    } else if (sort === 'oldest') {
      orderBy.updatedAt = 'asc'
    } else if (sort === 'title') {
      orderBy.title = 'asc'
    }

    const [notes, total] = await Promise.all([
      prisma.note.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          folder: {
            select: { id: true, name: true },
          },
          tags: {
            include: {
              tag: {
                select: { id: true, name: true, color: true },
              },
            },
          },
        },
      }),
      prisma.note.count({ where }),
    ])

    return NextResponse.json({ notes, total })
  } catch (error) {
    console.error('Failed to fetch notes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    )
  }
}

// POST /api/notes - Create note
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, audioUrl, folderId } = createNoteSchema.parse(body)

    const note = await prisma.note.create({
      data: {
        userId: session.user.id,
        title,
        content: content || '',
        audioUrl,
        folderId,
      },
      include: {
        folder: {
          select: { id: true, name: true },
        },
        tags: {
          include: {
            tag: {
              select: { id: true, name: true, color: true },
            },
          },
        },
      },
    })

    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Failed to create note:', error)
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    )
  }
}

