import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import prisma from '@/lib/db'
import { authOptions } from '@/lib/auth'

const createFolderSchema = z.object({
  name: z.string().min(1, '폴더 이름을 입력해주세요'),
})

// GET /api/folders - List folders
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const folders = await prisma.folder.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        _count: {
          select: { notes: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(folders)
  } catch (error) {
    console.error('Failed to fetch folders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch folders' },
      { status: 500 }
    )
  }
}

// POST /api/folders - Create folder
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name } = createFolderSchema.parse(body)

    // Check if folder already exists
    const existingFolder = await prisma.folder.findFirst({
      where: {
        userId: session.user.id,
        name,
      },
    })

    if (existingFolder) {
      return NextResponse.json(
        { error: '이미 존재하는 폴더입니다' },
        { status: 400 }
      )
    }

    const folder = await prisma.folder.create({
      data: {
        userId: session.user.id,
        name,
      },
    })

    return NextResponse.json(folder, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Failed to create folder:', error)
    return NextResponse.json(
      { error: 'Failed to create folder' },
      { status: 500 }
    )
  }
}

