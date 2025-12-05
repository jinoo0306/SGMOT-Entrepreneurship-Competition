import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { generateSlug } from '@/lib/utils'

// POST /api/notes/[id]/share - Generate or get share link
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if note exists and belongs to user
    const note = await prisma.note.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    // If already shared, return existing slug
    if (note.shared && note.sharedSlug) {
      return NextResponse.json({ sharedSlug: note.sharedSlug })
    }

    // Generate new share slug
    const sharedSlug = generateSlug()

    await prisma.note.update({
      where: { id },
      data: {
        shared: true,
        sharedSlug,
      },
    })

    return NextResponse.json({ sharedSlug })
  } catch (error) {
    console.error('Failed to share note:', error)
    return NextResponse.json(
      { error: 'Failed to share note' },
      { status: 500 }
    )
  }
}

// DELETE /api/notes/[id]/share - Remove share link
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if note exists and belongs to user
    const note = await prisma.note.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    await prisma.note.update({
      where: { id },
      data: {
        shared: false,
        sharedSlug: null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to unshare note:', error)
    return NextResponse.json(
      { error: 'Failed to unshare note' },
      { status: 500 }
    )
  }
}

