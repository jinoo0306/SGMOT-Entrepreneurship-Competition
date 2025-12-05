'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useUIStore } from '@/store/uiStore'

export default function SettingsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { theme, setTheme, addToast } = useUIStore()

  // Local state for settings
  const [folders, setFolders] = useState([
    { id: 'work', name: '업무' },
    { id: 'personal', name: '개인' }
  ])
  const [tags, setTags] = useState([
    { id: '1', name: '중요', color: '#EF4444' },
    { id: '2', name: '업무', color: '#2F80ED' },
    { id: '3', name: '개인', color: '#10B981' }
  ])
  
  const [showFolderModal, setShowFolderModal] = useState(false)
  const [showTagModal, setShowTagModal] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#2F80ED')
  
  // Notification settings
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sound: false
  })

  const colorOptions = [
    '#2F80ED', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#06B6D4', '#F97316', '#84CC16', '#6366F1',
  ]

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      addToast('폴더 이름을 입력해주세요', 'error')
      return
    }
    setFolders([...folders, { id: `folder-${Date.now()}`, name: newFolderName.trim() }])
    setNewFolderName('')
    setShowFolderModal(false)
    addToast('폴더가 생성되었습니다', 'success')
  }

  const handleDeleteFolder = (id: string) => {
    if (confirm('이 폴더를 삭제하시겠습니까?')) {
      setFolders(folders.filter(f => f.id !== id))
      addToast('폴더가 삭제되었습니다', 'info')
    }
  }

  const handleCreateTag = () => {
    if (!newTagName.trim()) {
      addToast('태그 이름을 입력해주세요', 'error')
      return
    }
    setTags([...tags, { id: `tag-${Date.now()}`, name: newTagName.trim(), color: newTagColor }])
    setNewTagName('')
    setNewTagColor('#2F80ED')
    setShowTagModal(false)
    addToast('태그가 생성되었습니다', 'success')
  }

  const handleDeleteTag = (id: string) => {
    setTags(tags.filter(t => t.id !== id))
    addToast('태그가 삭제되었습니다', 'info')
  }

  return (
    <div className="main-container" style={{ background: 'var(--secondary-color)' }}>
      <div style={{
        flex: 1,
        padding: '40px',
        overflowY: 'auto',
        maxWidth: 800,
        margin: '0 auto'
      }}>
        {/* Back button */}
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            fontSize: 14,
            marginBottom: 24
          }}
        >
          <i className="fas fa-arrow-left"></i>
          <span>돌아가기</span>
        </button>

        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 32 }}>설정</h1>

        {/* Profile Section */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <i className="fas fa-user" style={{ color: 'var(--text-secondary)' }}></i>
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>프로필</h2>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #A855F7 0%, #3B82F6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 24
            }}>
              <i className="fas fa-user"></i>
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>
                {session?.user?.name || '사용자'}
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                {session?.user?.email || 'demo@example.com'}
              </p>
            </div>
          </div>
        </div>

        {/* Theme Section */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <i className="fas fa-palette" style={{ color: 'var(--text-secondary)' }}></i>
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>테마</h2>
          </div>
          
          <div style={{ display: 'flex', gap: 16 }}>
            <button
              onClick={() => setTheme('light')}
              style={{
                flex: 1,
                padding: 20,
                borderRadius: 12,
                border: theme === 'light' ? '2px solid var(--primary-color)' : '2px solid var(--border-color)',
                background: theme === 'light' ? 'rgba(0, 199, 60, 0.05)' : 'white',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              <i className="fas fa-sun" style={{ fontSize: 24, color: '#FFC107', marginBottom: 8, display: 'block' }}></i>
              <span style={{ fontWeight: 500 }}>라이트</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              style={{
                flex: 1,
                padding: 20,
                borderRadius: 12,
                border: theme === 'dark' ? '2px solid var(--primary-color)' : '2px solid var(--border-color)',
                background: theme === 'dark' ? 'rgba(0, 199, 60, 0.05)' : 'white',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              <i className="fas fa-moon" style={{ fontSize: 24, color: '#6366F1', marginBottom: 8, display: 'block' }}></i>
              <span style={{ fontWeight: 500 }}>다크</span>
            </button>
          </div>
        </div>

        {/* Notifications Section */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <i className="fas fa-bell" style={{ color: 'var(--text-secondary)' }}></i>
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>알림</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { key: 'email', label: '이메일 알림', desc: '중요한 업데이트를 이메일로 받습니다' },
              { key: 'push', label: '푸시 알림', desc: '브라우저 푸시 알림을 받습니다' },
              { key: 'sound', label: '소리 알림', desc: '알림 시 소리를 재생합니다' }
            ].map(item => (
              <div 
                key={item.key}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: '1px solid var(--border-color)'
                }}
              >
                <div>
                  <p style={{ fontWeight: 500, marginBottom: 4 }}>{item.label}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.desc}</p>
                </div>
                <label style={{ 
                  position: 'relative', 
                  width: 48, 
                  height: 24, 
                  cursor: 'pointer' 
                }}>
                  <input
                    type="checkbox"
                    checked={notifications[item.key as keyof typeof notifications]}
                    onChange={(e) => setNotifications({
                      ...notifications,
                      [item.key]: e.target.checked
                    })}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: notifications[item.key as keyof typeof notifications] ? 'var(--primary-color)' : '#ccc',
                    borderRadius: 24,
                    transition: 'background 0.3s'
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: notifications[item.key as keyof typeof notifications] ? 26 : 2,
                      top: 2,
                      width: 20,
                      height: 20,
                      background: 'white',
                      borderRadius: '50%',
                      transition: 'left 0.3s',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }} />
                  </span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Folders Section */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <i className="fas fa-folder" style={{ color: 'var(--text-secondary)' }}></i>
              <h2 style={{ fontSize: 18, fontWeight: 600 }}>폴더 관리</h2>
            </div>
            <button
              onClick={() => setShowFolderModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                background: 'none',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 14
              }}
            >
              <i className="fas fa-plus"></i>
              <span>새 폴더</span>
            </button>
          </div>
          
          {folders.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {folders.map(folder => (
                <div
                  key={folder.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: 'var(--secondary-color)',
                    borderRadius: 8
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <i className="fas fa-folder" style={{ color: 'var(--text-secondary)' }}></i>
                    <span>{folder.name}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteFolder(folder.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)',
                      padding: 6
                    }}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 20 }}>
              아직 폴더가 없습니다
            </p>
          )}
        </div>

        {/* Tags Section */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <i className="fas fa-tag" style={{ color: 'var(--text-secondary)' }}></i>
              <h2 style={{ fontSize: 18, fontWeight: 600 }}>태그 관리</h2>
            </div>
            <button
              onClick={() => setShowTagModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                background: 'none',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 14
              }}
            >
              <i className="fas fa-plus"></i>
              <span>새 태그</span>
            </button>
          </div>
          
          {tags.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {tags.map(tag => (
                <span
                  key={tag.id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 12px',
                    borderRadius: 20,
                    background: `${tag.color}20`,
                    color: tag.color,
                    fontSize: 14
                  }}
                >
                  {tag.name}
                  <button
                    onClick={() => handleDeleteTag(tag.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: tag.color,
                      padding: 0,
                      display: 'flex'
                    }}
                  >
                    <i className="fas fa-times" style={{ fontSize: 12 }}></i>
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 20 }}>
              아직 태그가 없습니다
            </p>
          )}
        </div>

        {/* Storage Section */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <i className="fas fa-database" style={{ color: 'var(--text-secondary)' }}></i>
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>저장 공간</h2>
          </div>
          
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14 }}>
              <span style={{ color: 'var(--text-secondary)' }}>사용 중</span>
              <span style={{ fontWeight: 500 }}>0.5 GB / 5 GB</span>
            </div>
            <div style={{
              height: 8,
              background: 'var(--secondary-color)',
              borderRadius: 4,
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: '10%',
                background: 'var(--primary-color)',
                borderRadius: 4
              }} />
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 12 }}>
              전체 저장 공간의 10%를 사용하고 있습니다
            </p>
          </div>
        </div>

        {/* Logout Section */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 24,
          boxShadow: 'var(--shadow-sm)'
        }}>
          <button
            onClick={() => signOut({ callbackUrl: '/signin' })}
            style={{
              width: '100%',
              padding: '14px 20px',
              background: 'none',
              border: '1px solid var(--danger-color)',
              color: 'var(--danger-color)',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 15,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            <i className="fas fa-sign-out-alt"></i>
            <span>로그아웃</span>
          </button>
        </div>
      </div>

      {/* Folder Modal */}
      {showFolderModal && (
        <>
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 2000
            }}
            onClick={() => setShowFolderModal(false)}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'white',
            borderRadius: 12,
            padding: 24,
            width: 400,
            maxWidth: '90vw',
            zIndex: 2001,
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ marginBottom: 16, fontSize: 18, fontWeight: 600 }}>새 폴더</h3>
            <input
              type="text"
              placeholder="폴더 이름"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                fontSize: 15,
                marginBottom: 16,
                outline: 'none'
              }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowFolderModal(false)}
                style={{
                  padding: '10px 20px',
                  border: '1px solid var(--border-color)',
                  background: 'white',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                취소
              </button>
              <button
                onClick={handleCreateFolder}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  background: 'var(--primary-color)',
                  color: 'white',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                생성
              </button>
            </div>
          </div>
        </>
      )}

      {/* Tag Modal */}
      {showTagModal && (
        <>
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 2000
            }}
            onClick={() => setShowTagModal(false)}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'white',
            borderRadius: 12,
            padding: 24,
            width: 400,
            maxWidth: '90vw',
            zIndex: 2001,
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ marginBottom: 16, fontSize: 18, fontWeight: 600 }}>새 태그</h3>
            <input
              type="text"
              placeholder="태그 이름"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                fontSize: 15,
                marginBottom: 16,
                outline: 'none'
              }}
              autoFocus
            />
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>색상</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {colorOptions.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewTagColor(color)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: color,
                      border: newTagColor === color ? '3px solid #333' : '3px solid transparent',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      transform: newTagColor === color ? 'scale(1.1)' : 'scale(1)'
                    }}
                  />
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowTagModal(false)}
                style={{
                  padding: '10px 20px',
                  border: '1px solid var(--border-color)',
                  background: 'white',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                취소
              </button>
              <button
                onClick={handleCreateTag}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  background: 'var(--primary-color)',
                  color: 'white',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                생성
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
