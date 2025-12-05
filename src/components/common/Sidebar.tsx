'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  FileText,
  Mic,
  Star,
  Search,
  Folder,
  Tag,
  Plus,
  ChevronRight,
  ChevronDown,
  X,
} from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useFolders } from '@/queries/folders'
import { useTags } from '@/queries/tags'

const mainNavItems = [
  { href: '/dashboard', icon: Home, label: '홈' },
  { href: '/notes', icon: FileText, label: '모든 노트' },
  { href: '/record', icon: Mic, label: '새 녹음', highlight: true },
  { href: '/notes?favorite=true', icon: Star, label: '즐겨찾기' },
  { href: '/search', icon: Search, label: '검색' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, setSidebarOpen } = useUIStore()
  const { data: folders } = useFolders()
  const { data: tags } = useTags()
  
  const [foldersExpanded, setFoldersExpanded] = useState(true)
  const [tagsExpanded, setTagsExpanded] = useState(true)

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 lg:top-14 left-0 z-50 lg:z-30
          w-60 h-screen lg:h-[calc(100vh-56px)] 
          bg-white border-r border-[#E8E8E8]
          transform transition-transform duration-200 ease-out
          lg:transform-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#E8E8E8] lg:hidden">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#03C75A] rounded-lg flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
                </svg>
              </div>
              <span className="font-bold text-[#03C75A]">CLOVA Note</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-[#666666] hover:bg-[#F5F6F8] rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New Note Button */}
          <div className="p-3">
            <Link href="/record">
              <button className="w-full flex items-center justify-center gap-2 py-3 bg-[#03C75A] hover:bg-[#02B150] text-white font-medium rounded-lg transition-colors">
                <Mic className="w-5 h-5" />
                <span>새 녹음</span>
              </button>
            </Link>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-2 pb-4">
            {/* Main Navigation */}
            <nav className="space-y-0.5 mb-4">
              {mainNavItems.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/dashboard' && pathname.startsWith(item.href.split('?')[0]))
                
                if (item.highlight) return null; // 새 녹음은 위 버튼으로 대체
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm
                      ${isActive
                        ? 'bg-[#E8F9EF] text-[#03C75A] font-medium'
                        : 'text-[#666666] hover:bg-[#F5F6F8]'
                      }
                    `}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Divider */}
            <div className="h-px bg-[#F0F0F0] mx-2 my-3" />

            {/* Folders Section */}
            <div className="mb-3">
              <button
                onClick={() => setFoldersExpanded(!foldersExpanded)}
                className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium text-[#999999] hover:text-[#666666]"
              >
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4" />
                  <span>폴더</span>
                </div>
                {foldersExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              
              {foldersExpanded && (
                <div className="mt-1 space-y-0.5">
                  {folders?.map((folder) => (
                    <Link
                      key={folder.id}
                      href={`/notes?folder=${folder.id}`}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-[#666666] hover:bg-[#F5F6F8] rounded-lg ml-2"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Folder className="w-4 h-4 text-[#999999]" />
                      <span className="truncate flex-1">{folder.name}</span>
                      <span className="text-xs text-[#999999]">
                        {folder._count?.notes || 0}
                      </span>
                    </Link>
                  ))}
                  {(!folders || folders.length === 0) && (
                    <p className="px-3 py-2 text-xs text-[#999999] ml-2">
                      폴더가 없습니다
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Tags Section */}
            <div>
              <button
                onClick={() => setTagsExpanded(!tagsExpanded)}
                className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium text-[#999999] hover:text-[#666666]"
              >
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  <span>태그</span>
                </div>
                {tagsExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              
              {tagsExpanded && (
                <div className="mt-1 space-y-0.5">
                  {tags?.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/notes?tag=${tag.id}`}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-[#666666] hover:bg-[#F5F6F8] rounded-lg ml-2"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="truncate flex-1">{tag.name}</span>
                      <span className="text-xs text-[#999999]">
                        {tag._count?.notes || 0}
                      </span>
                    </Link>
                  ))}
                  {(!tags || tags.length === 0) && (
                    <p className="px-3 py-2 text-xs text-[#999999] ml-2">
                      태그가 없습니다
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Section - Storage */}
          <div className="p-3 border-t border-[#F0F0F0]">
            <div className="px-2">
              <div className="flex items-center justify-between text-xs text-[#999999] mb-2">
                <span>저장 공간</span>
                <span>0.5 GB / 5 GB</span>
              </div>
              <div className="h-1 bg-[#F0F0F0] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#03C75A] rounded-full" 
                  style={{ width: '10%' }} 
                />
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
