'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Star,
  Share2,
  Trash2,
  MoreHorizontal,
  Folder,
  Tag,
  Copy,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { TagInput } from './TagInput'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/uiStore'
import { useFolders } from '@/queries/folders'
import type { Note } from '@/queries/notes'

interface ToolbarProps {
  note: Note
  onFavorite: () => void
  onShare: () => void
  onDelete: () => void
  onFolderChange: (folderId: string | null) => void
  onTagsChange: (tagIds: string[]) => void
}

export function Toolbar({
  note,
  onFavorite,
  onShare,
  onDelete,
  onFolderChange,
  onTagsChange,
}: ToolbarProps) {
  const { addToast } = useUIStore()
  const { data: folders } = useFolders()
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showFolderModal, setShowFolderModal] = useState(false)
  const [showTagModal, setShowTagModal] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  const handleCopyLink = async () => {
    if (note.sharedSlug) {
      const url = `${window.location.origin}/notes/${note.id}/share`
      await navigator.clipboard.writeText(url)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
      addToast('링크가 복사되었습니다', 'success')
    }
  }

  return (
    <>
      <div className="flex items-center justify-between py-3 px-4 border-b border-gray-100 bg-white sticky top-16 z-30">
        {/* Back Button */}
        <Link href="/notes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onFavorite}
            className={cn(note.isFavorite && 'text-yellow-500')}
          >
            <Star className="w-5 h-5" fill={note.isFavorite ? 'currentColor' : 'none'} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowShareModal(true)}
          >
            <Share2 className="w-5 h-5" />
          </Button>

          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMoreMenu(!showMoreMenu)}
            >
              <MoreHorizontal className="w-5 h-5" />
            </Button>

            {showMoreMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMoreMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20">
                  <button
                    onClick={() => {
                      setShowFolderModal(true)
                      setShowMoreMenu(false)
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    <Folder className="w-4 h-4" />
                    <span>폴더 이동</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowTagModal(true)
                      setShowMoreMenu(false)
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    <Tag className="w-4 h-4" />
                    <span>태그 관리</span>
                  </button>
                  <div className="my-1 border-t border-gray-100" />
                  <button
                    onClick={() => {
                      setShowDeleteModal(true)
                      setShowMoreMenu(false)
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>삭제</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="노트 공유"
      >
        {note.shared && note.sharedSlug ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              이 노트는 이미 공유 중입니다. 아래 링크를 복사하여 공유하세요.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/notes/${note.id}/share`}
                readOnly
                className="flex-1 px-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl"
              />
              <Button onClick={handleCopyLink}>
                {linkCopied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              이 노트를 공유하면 링크를 아는 모든 사람이 읽을 수 있습니다.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowShareModal(false)}>
                취소
              </Button>
              <Button
                onClick={() => {
                  onShare()
                  setShowShareModal(false)
                }}
              >
                공유하기
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="노트 삭제"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            이 노트를 삭제하시겠습니까? 삭제된 노트는 복구할 수 없습니다.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              취소
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                onDelete()
                setShowDeleteModal(false)
              }}
            >
              삭제
            </Button>
          </div>
        </div>
      </Modal>

      {/* Folder Modal */}
      <Modal
        isOpen={showFolderModal}
        onClose={() => setShowFolderModal(false)}
        title="폴더 이동"
      >
        <div className="space-y-2">
          <button
            onClick={() => {
              onFolderChange(null)
              setShowFolderModal(false)
            }}
            className={cn(
              'flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-colors',
              !note.folderId ? 'bg-clova-blue/10 text-clova-blue' : 'hover:bg-gray-100'
            )}
          >
            <Folder className="w-5 h-5" />
            <span>폴더 없음</span>
          </button>
          {folders?.map((folder) => (
            <button
              key={folder.id}
              onClick={() => {
                onFolderChange(folder.id)
                setShowFolderModal(false)
              }}
              className={cn(
                'flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-colors',
                note.folderId === folder.id
                  ? 'bg-clova-blue/10 text-clova-blue'
                  : 'hover:bg-gray-100'
              )}
            >
              <Folder className="w-5 h-5" />
              <span>{folder.name}</span>
            </button>
          ))}
        </div>
      </Modal>

      {/* Tag Modal */}
      <Modal
        isOpen={showTagModal}
        onClose={() => setShowTagModal(false)}
        title="태그 관리"
      >
        <TagInput
          selectedTags={note.tags.map((nt) => nt.tag)}
          onChange={(tagIds) => {
            onTagsChange(tagIds)
          }}
        />
        <div className="mt-4 flex justify-end">
          <Button onClick={() => setShowTagModal(false)}>완료</Button>
        </div>
      </Modal>
    </>
  )
}

