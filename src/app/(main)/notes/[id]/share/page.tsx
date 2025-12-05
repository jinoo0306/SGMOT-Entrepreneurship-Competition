import { notFound } from 'next/navigation'
import { Mic, Calendar, Share2 } from 'lucide-react'
import prisma from '@/lib/db'
import { formatDate, formatDuration } from '@/lib/utils'

interface SharePageProps {
  params: Promise<{ id: string }>
}

async function getSharedNote(id: string) {
  const note = await prisma.note.findFirst({
    where: {
      id,
      shared: true,
    },
    include: {
      user: {
        select: { name: true },
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

  return note
}

export default async function SharePage({ params }: SharePageProps) {
  const { id } = await params
  const note = await getSharedNote(id)

  if (!note) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-clova-blue to-clova-blue-dark rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="font-bold text-gray-900">ClovaNote</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Share2 className="w-4 h-4" />
              <span>공유된 노트</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Note Card */}
        <article className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Meta Info */}
          <div className="px-8 py-4 bg-gray-50 border-b border-gray-100">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              {note.user?.name && (
                <span>작성자: {note.user.name}</span>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(note.createdAt)}</span>
              </div>
              {note.audioUrl && note.duration && (
                <div className="flex items-center gap-1 text-clova-blue">
                  <Mic className="w-4 h-4" />
                  <span>{formatDuration(note.duration)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Note Content */}
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              {note.title}
            </h1>

            {/* Tags */}
            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {note.tags.map(({ tag }) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center px-3 py-1 text-sm rounded-full"
                    style={{
                      backgroundColor: `${tag.color}15`,
                      color: tag.color,
                    }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="prose prose-gray max-w-none">
              {note.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </article>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-400">
          <p>이 노트는 ClovaNote에서 공유되었습니다.</p>
        </div>
      </main>
    </div>
  )
}

