'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useUIStore } from '@/store/uiStore'

export function Header() {
  const router = useRouter()
  const { data: session } = useSession()
  const { 
    toggleSidebar, 
    searchQuery, 
    setSearchQuery,
    showNotifications,
    setShowNotifications,
  } = useUIStore()
  
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)

  // 검색어 디바운싱
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [localSearchQuery, setSearchQuery])

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [setShowNotifications])

  // 검색 폼 제출
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(localSearchQuery)
  }

  // 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K로 검색 포커스
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const notifications = [
    { id: 1, message: '새로운 기능이 추가되었습니다!', time: '방금 전', read: false },
    { id: 2, message: 'Melodious에 오신 것을 환영합니다.', time: '1시간 전', read: true },
  ]

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-btn" onClick={toggleSidebar} title="메뉴 (Ctrl+B)">
          <i className="fas fa-bars"></i>
        </button>
        <Link href="/dashboard" className="logo" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #A855F7 0%, #3B82F6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <i className="fas fa-music" style={{ fontSize: 16, color: 'white' }}></i>
          </div>
          <span style={{ 
            fontSize: 20, 
            fontWeight: 700, 
            background: 'linear-gradient(135deg, #A855F7 0%, #3B82F6 100%)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent' 
          }}>
            Melodious
          </span>
        </Link>
      </div>
      
      <div className="header-center">
        <form className="search-bar" onSubmit={handleSearchSubmit}>
          <i className="fas fa-search"></i>
          <input 
            ref={searchInputRef}
            type="text" 
            placeholder="노트 검색 (Ctrl+K)" 
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
          />
          {localSearchQuery && (
            <button 
              type="button"
              onClick={() => {
                setLocalSearchQuery('')
                setSearchQuery('')
              }}
              style={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                padding: '4px'
              }}
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </form>
      </div>
      
      <div className="header-right">
        <button 
          className="header-btn" 
          title="설정"
          onClick={() => router.push('/settings')}
        >
          <i className="fas fa-cog"></i>
        </button>
        
        <div style={{ position: 'relative' }} ref={notificationRef}>
          <button 
            className="header-btn" 
            title="알림"
            onClick={() => setShowNotifications(!showNotifications)}
            style={{ position: 'relative' }}
          >
            <i className="fas fa-bell"></i>
            {notifications.some(n => !n.read) && (
              <span style={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 8,
                height: 8,
                background: '#dc3545',
                borderRadius: '50%'
              }} />
            )}
          </button>
          
          {showNotifications && (
            <div className="context-menu" style={{ 
              display: 'block', 
              position: 'absolute', 
              right: 0, 
              top: '100%', 
              marginTop: 8,
              width: 320
            }}>
              <div style={{ 
                padding: '12px 16px', 
                borderBottom: '1px solid var(--border-color)',
                fontWeight: 600
              }}>
                알림
              </div>
              {notifications.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  알림이 없습니다
                </div>
              ) : (
                notifications.map(notif => (
                  <div 
                    key={notif.id}
                    className="context-menu-item"
                    style={{
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: 4,
                      opacity: notif.read ? 0.6 : 1
                    }}
                  >
                    <span style={{ fontSize: 14 }}>{notif.message}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{notif.time}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        
        <div style={{ position: 'relative' }} ref={userMenuRef}>
          <button 
            className="header-btn user-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
            title="프로필"
          >
            <i className="fas fa-user-circle"></i>
          </button>
          
          {showUserMenu && (
            <div className="context-menu" style={{ 
              display: 'block', 
              position: 'absolute', 
              right: 0, 
              top: '100%', 
              marginTop: 8 
            }}>
              {session?.user && (
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{session.user.name || '사용자'}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{session.user.email}</div>
                </div>
              )}
              <div 
                className="context-menu-item"
                onClick={() => {
                  setShowUserMenu(false)
                  router.push('/settings')
                }}
              >
                <i className="fas fa-cog"></i>
                <span>설정</span>
              </div>
              <div className="context-menu-divider"></div>
              <div 
                className="context-menu-item danger"
                onClick={() => signOut({ callbackUrl: '/signin' })}
              >
                <i className="fas fa-sign-out-alt"></i>
                <span>로그아웃</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
