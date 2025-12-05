'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useUIStore } from '@/store/uiStore'

interface Speaker {
  id: string
  name: string
  color: string
}

interface Utterance {
  id: number
  speakerId: string
  timestamp: string
  text: string
}

interface Note {
  id: number
  title: string
  utterances: Utterance[]
  speakers: Speaker[]
  duration: string
  date: string
  tags: string[]
  favorite: boolean
  folderId: string | null
  createdAt: Date
}

interface Folder {
  id: string
  name: string
}

// 병원 진료 더미 데이터
const hospitalVisitUtterances: Utterance[] = [
  { id: 1, speakerId: 'doctor', timestamp: '00:05', text: '안녕하세요, 이민수 님. 어디가 불편해서 오셨나요?' },
  { id: 2, speakerId: 'patient', timestamp: '00:12', text: '네, 안녕하세요 선생님. 오른쪽 무릎이 요즘 너무 아파서요. 계단 오르내릴 때 특히 심해요.' },
  { id: 3, speakerId: 'doctor', timestamp: '00:25', text: '언제부터 아프셨어요? 다치신 적이 있으신가요?' },
  { id: 4, speakerId: 'patient', timestamp: '00:32', text: '한 2주 전부터요. 특별히 다친 건 아닌데 갑자기 아프기 시작했어요. 앉았다 일어날 때도 뚝뚝 소리가 나고요.' },
  { id: 5, speakerId: 'doctor', timestamp: '00:48', text: '그러시군요. 평소에 운동은 어떻게 하세요? 무리하게 운동하신 적은요?' },
  { id: 6, speakerId: 'patient', timestamp: '00:58', text: '주말마다 등산을 다니는데요. 최근에 좀 무리해서 높은 산을 다녀왔어요. 그 이후로 더 심해진 것 같아요.' },
  { id: 7, speakerId: 'doctor', timestamp: '01:15', text: '아, 그러셨군요. 일단 진찰을 해볼게요. 여기 누우시고 다리 펴주세요.' },
  { id: 8, speakerId: 'patient', timestamp: '01:22', text: '네, 알겠습니다.' },
  { id: 9, speakerId: 'doctor', timestamp: '01:45', text: '여기 누르면 아프세요?' },
  { id: 10, speakerId: 'patient', timestamp: '01:48', text: '아! 네, 거기 많이 아파요.' },
  { id: 11, speakerId: 'doctor', timestamp: '02:00', text: '무릎 관절 주변에 염증이 있는 것 같습니다. X-ray를 한번 찍어보는 게 좋겠어요. 연골 상태도 확인해봐야 할 것 같습니다.' },
  { id: 12, speakerId: 'patient', timestamp: '02:18', text: '혹시 심각한 건가요? 수술해야 하는 건 아니겠죠?' },
  { id: 13, speakerId: 'doctor', timestamp: '02:28', text: '아직 정확한 건 검사 결과를 봐야 알겠지만, 증상으로 봤을 때 퇴행성 관절염 초기 단계거나 슬개건염일 가능성이 높아요. 수술까지는 안 가실 거예요.' },
  { id: 14, speakerId: 'patient', timestamp: '02:48', text: '다행이네요. 그럼 치료는 어떻게 해야 하나요?' },
  { id: 15, speakerId: 'doctor', timestamp: '02:58', text: '일단 당분간 등산은 피하시고요. 소염제 처방해드릴 테니 일주일 정도 드셔보세요. 그리고 물리치료도 병행하시면 좋을 것 같습니다.' },
  { id: 16, speakerId: 'patient', timestamp: '03:18', text: '네, 알겠습니다. 물리치료는 얼마나 자주 받아야 하나요?' },
  { id: 17, speakerId: 'doctor', timestamp: '03:28', text: '일주일에 2-3회 정도 받으시면 됩니다. 보통 2-3주 정도 하시면 많이 좋아지실 거예요. 그리고 집에서 간단한 스트레칭도 해주시면 회복에 도움이 됩니다.' },
  { id: 18, speakerId: 'patient', timestamp: '03:48', text: '어떤 스트레칭을 하면 좋을까요?' },
  { id: 19, speakerId: 'doctor', timestamp: '03:55', text: '허벅지 앞쪽 근육 스트레칭이랑 햄스트링 스트레칭을 추천드려요. 방법은 간호사 선생님한테 안내 자료 받으시면 됩니다.' },
  { id: 20, speakerId: 'patient', timestamp: '04:10', text: '네, 감사합니다 선생님. X-ray는 지금 바로 찍으면 되나요?' },
  { id: 21, speakerId: 'doctor', timestamp: '04:18', text: '네, 바로 옆에 영상의학과에서 찍으시면 됩니다. 결과는 30분 정도 후에 나오니까 다시 이쪽으로 오세요.' },
  { id: 22, speakerId: 'patient', timestamp: '04:30', text: '알겠습니다. 감사합니다!' },
]

const hospitalSpeakers: Speaker[] = [
  { id: 'doctor', name: '김정훈 의사', color: '#7C3AED' },
  { id: 'patient', name: '이민수 환자', color: '#F59E0B' },
]

export default function DashboardPage() {
  // Notes state
  const [notes, setNotes] = useState<Note[]>([
    {
      id: 1,
      title: '정형외과 진료 - 무릎 통증',
      utterances: hospitalVisitUtterances,
      speakers: hospitalSpeakers,
      duration: '04:30',
      date: '오늘',
      tags: ['진료', '정형외과'],
      favorite: true,
      folderId: null,
      createdAt: new Date()
    },
    {
      id: 2,
      title: '팀 회의록',
      utterances: [
        { id: 1, speakerId: 'manager', timestamp: '00:10', text: '오늘 회의 주제는 신규 프로젝트 일정 조율입니다.' },
        { id: 2, speakerId: 'dev1', timestamp: '00:25', text: '개발 일정은 약 3주 정도 예상됩니다.' },
        { id: 3, speakerId: 'designer', timestamp: '00:40', text: '디자인은 이미 80% 완료되었습니다.' },
        { id: 4, speakerId: 'manager', timestamp: '00:55', text: '좋습니다. 다음 주 월요일까지 마무리 부탁드립니다.' },
      ],
      speakers: [
        { id: 'manager', name: '박지영 팀장', color: '#3B82F6' },
        { id: 'dev1', name: '김철수 개발자', color: '#10B981' },
        { id: 'designer', name: '이수진 디자이너', color: '#EC4899' },
      ],
      duration: '01:05',
      date: '어제',
      tags: ['회의', '프로젝트'],
      favorite: false,
      folderId: 'work',
      createdAt: new Date(Date.now() - 86400000)
    }
  ])

  // Folders state
  const [folders, setFolders] = useState<Folder[]>([
    { id: 'work', name: '업무' },
    { id: 'personal', name: '개인' },
    { id: 'medical', name: '의료' }
  ])

  // Trash state
  const [trash, setTrash] = useState<Note[]>([])

  // UI state from global store
  const { 
    sidebarCollapsed, 
    searchQuery, 
    activeFilter, 
    setActiveFilter,
    activeFolder,
    setActiveFolder,
    showFolderModal,
    setShowFolderModal,
    addToast
  } = useUIStore()

  // Local UI state
  const [currentNoteId, setCurrentNoteId] = useState<number>(1)
  const [currentTab, setCurrentTab] = useState<'transcript' | 'record' | 'summary'>('transcript')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'recent' | 'created' | 'title'>('recent')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [liveTranscript, setLiveTranscript] = useState<Utterance[]>([])
  const [summaryContent, setSummaryContent] = useState<string | null>(null)
  const [keywords, setKeywords] = useState<string[]>([])
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 })
  const [contextMenuNoteId, setContextMenuNoteId] = useState<number | null>(null)
  const [newFolderName, setNewFolderName] = useState('')
  const [currentSpeaker, setCurrentSpeaker] = useState<string>('speaker1')
  
  // Refs
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const contextMenuRef = useRef<HTMLDivElement>(null)
  const transcriptEndRef = useRef<HTMLDivElement>(null)

  // Get current note
  const currentNote = notes.find(n => n.id === currentNoteId)

  // Filter notes
  const filteredNotes = notes.filter(note => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesTitle = note.title.toLowerCase().includes(query)
      const matchesContent = note.utterances.some(u => u.text.toLowerCase().includes(query))
      const matchesTags = note.tags.some(tag => tag.toLowerCase().includes(query))
      const matchesSpeaker = note.speakers.some(s => s.name.toLowerCase().includes(query))
      if (!matchesTitle && !matchesContent && !matchesTags && !matchesSpeaker) return false
    }

    switch (activeFilter) {
      case 'favorites':
        return note.favorite
      case 'recording':
        return true // 모든 노트가 녹음 기반
      case 'trash':
        return false
      default:
        if (activeFolder) {
          return note.folderId === activeFolder
        }
        return true
    }
  })

  // Sort notes
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    switch (sortBy) {
      case 'created':
        return b.createdAt.getTime() - a.createdAt.getTime()
      case 'title':
        return a.title.localeCompare(b.title)
      default:
        return b.createdAt.getTime() - a.createdAt.getTime()
    }
  })

  // Get display title
  const getDisplayTitle = () => {
    if (searchQuery) return `"${searchQuery}" 검색 결과`
    switch (activeFilter) {
      case 'favorites':
        return '즐겨찾기'
      case 'recording':
        return '녹음 노트'
      case 'trash':
        return '휴지통'
      default:
        if (activeFolder) {
          const folder = folders.find(f => f.id === activeFolder)
          return folder?.name || '폴더'
        }
        return '모든 녹음'
    }
  }

  // Select note
  const selectNote = useCallback((noteId: number) => {
    setCurrentNoteId(noteId)
    setCurrentTab('transcript')
    setSummaryContent(null)
    setKeywords([])
  }, [])

  // Create new recording
  const createNewRecording = () => {
    const newNote: Note = {
      id: Date.now(),
      title: `새 녹음 - ${new Date().toLocaleDateString('ko-KR')}`,
      utterances: [],
      speakers: [
        { id: 'speaker1', name: '화자 1', color: '#7C3AED' },
        { id: 'speaker2', name: '화자 2', color: '#F59E0B' },
      ],
      duration: '00:00',
      date: '방금 전',
      tags: [],
      favorite: false,
      folderId: activeFolder,
      createdAt: new Date()
    }
    setNotes([newNote, ...notes])
    setCurrentNoteId(newNote.id)
    setCurrentTab('record')
    setLiveTranscript([])
    setActiveFilter('all')
    addToast('새 녹음이 생성되었습니다', 'success')
  }

  // Toggle favorite
  const toggleFavorite = (noteId: number) => {
    setNotes(notes.map(note =>
      note.id === noteId
        ? { ...note, favorite: !note.favorite }
        : note
    ))
    const note = notes.find(n => n.id === noteId)
    if (note) {
      addToast(note.favorite ? '즐겨찾기에서 제거되었습니다' : '즐겨찾기에 추가되었습니다', 'info')
    }
  }

  // Delete note
  const deleteNote = (noteId: number) => {
    const noteToDelete = notes.find(n => n.id === noteId)
    if (noteToDelete && confirm('이 녹음을 삭제하시겠습니까?')) {
      setTrash([...trash, noteToDelete])
      const newNotes = notes.filter(n => n.id !== noteId)
      setNotes(newNotes)
      addToast('녹음이 휴지통으로 이동되었습니다', 'info')
      
      if (newNotes.length > 0) {
        setCurrentNoteId(newNotes[0].id)
      }
    }
  }

  // Duplicate note
  const duplicateNote = (noteId: number) => {
    const noteToDuplicate = notes.find(n => n.id === noteId)
    if (noteToDuplicate) {
      const newNote: Note = {
        ...noteToDuplicate,
        id: Date.now(),
        title: `${noteToDuplicate.title} (복사본)`,
        createdAt: new Date(),
        date: '방금 전'
      }
      setNotes([newNote, ...notes])
      setCurrentNoteId(newNote.id)
      addToast('녹음이 복제되었습니다', 'success')
    }
  }

  // Move to folder
  const moveToFolder = (noteId: number, folderId: string | null) => {
    setNotes(notes.map(note =>
      note.id === noteId
        ? { ...note, folderId }
        : note
    ))
    const folder = folders.find(f => f.id === folderId)
    addToast(folder ? `"${folder.name}" 폴더로 이동되었습니다` : '폴더에서 제거되었습니다', 'info')
  }

  // Restore from trash
  const restoreFromTrash = (noteId: number) => {
    const noteToRestore = trash.find(n => n.id === noteId)
    if (noteToRestore) {
      setNotes([noteToRestore, ...notes])
      setTrash(trash.filter(n => n.id !== noteId))
      addToast('녹음이 복원되었습니다', 'success')
    }
  }

  // Permanently delete
  const permanentlyDelete = (noteId: number) => {
    if (confirm('이 녹음을 영구적으로 삭제하시겠습니까?')) {
      setTrash(trash.filter(n => n.id !== noteId))
      addToast('녹음이 영구 삭제되었습니다', 'info')
    }
  }

  // Empty trash
  const emptyTrash = () => {
    if (trash.length === 0) {
      addToast('휴지통이 비어있습니다', 'info')
      return
    }
    if (confirm('휴지통을 비우시겠습니까?')) {
      setTrash([])
      addToast('휴지통이 비워졌습니다', 'success')
    }
  }

  // Create folder
  const createFolder = () => {
    if (!newFolderName.trim()) {
      addToast('폴더 이름을 입력해주세요', 'error')
      return
    }
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name: newFolderName.trim()
    }
    setFolders([...folders, newFolder])
    setNewFolderName('')
    setShowFolderModal(false)
    addToast('폴더가 생성되었습니다', 'success')
  }

  // Recording functions
  const toggleRecording = () => {
    if (!isRecording) {
      startRecording()
    } else {
      stopRecording()
    }
  }

  // 시뮬레이션용 대화 데이터
  const simulatedConversation = [
    { speaker: 'speaker1', text: '안녕하세요, 무엇을 도와드릴까요?' },
    { speaker: 'speaker2', text: '네, 최근에 무릎이 아파서 상담받으러 왔습니다.' },
    { speaker: 'speaker1', text: '언제부터 아프셨나요?' },
    { speaker: 'speaker2', text: '한 일주일 정도 됐어요. 계단 오르내릴 때 특히 아파요.' },
    { speaker: 'speaker1', text: '알겠습니다. 검사를 해보도록 하겠습니다.' },
  ]

  const startRecording = () => {
    setIsRecording(true)
    setRecordingTime(0)
    setLiveTranscript([])
    
    let conversationIndex = 0
    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime(prev => {
        const newTime = prev + 1
        
        // 5초마다 새로운 발화 추가 (시뮬레이션)
        if (newTime % 5 === 0 && conversationIndex < simulatedConversation.length) {
          const conv = simulatedConversation[conversationIndex]
          const newUtterance: Utterance = {
            id: Date.now(),
            speakerId: conv.speaker,
            timestamp: formatTime(newTime),
            text: conv.text
          }
          setLiveTranscript(prev => [...prev, newUtterance])
          conversationIndex++
        }
        
        return newTime
      })
    }, 1000)
  }

  const stopRecording = () => {
    setIsRecording(false)
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
    }
    
    // 녹음 내용을 현재 노트에 저장
    if (liveTranscript.length > 0 && currentNote) {
      setNotes(notes.map(note =>
        note.id === currentNoteId
          ? { 
              ...note, 
              utterances: [...note.utterances, ...liveTranscript],
              duration: formatTime(recordingTime),
              date: '방금 전'
            }
          : note
      ))
      addToast('녹음이 저장되었습니다', 'success')
      setCurrentTab('transcript')
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  // Generate summary
  const generateSummary = () => {
    if (!currentNote) return
    
    const doctorName = currentNote.speakers.find(s => s.id === 'doctor')?.name || '의료진'
    const patientName = currentNote.speakers.find(s => s.id === 'patient')?.name || '환자'
    
    setSummaryContent(`
      <h4 style="margin-bottom: 16px; color: var(--primary-color);">📋 진료 요약</h4>
      
      <div style="margin-bottom: 20px;">
        <h5 style="margin-bottom: 8px;">👤 참석자</h5>
        <p style="margin-left: 16px;">${currentNote.speakers.map(s => s.name).join(', ')}</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h5 style="margin-bottom: 8px;">🩺 주요 증상</h5>
        <ul style="margin-left: 24px;">
          <li>오른쪽 무릎 통증</li>
          <li>계단 오르내릴 때 심한 통증</li>
          <li>앉았다 일어날 때 관절에서 소리 발생</li>
          <li>최근 등산 후 증상 악화</li>
        </ul>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h5 style="margin-bottom: 8px;">💊 진단 및 처방</h5>
        <ul style="margin-left: 24px;">
          <li>추정 진단: 퇴행성 관절염 초기 또는 슬개건염</li>
          <li>X-ray 검사 필요</li>
          <li>소염제 처방 (1주일)</li>
          <li>물리치료 권장 (주 2-3회, 2-3주)</li>
        </ul>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h5 style="margin-bottom: 8px;">📌 주의사항</h5>
        <ul style="margin-left: 24px;">
          <li>당분간 등산 자제</li>
          <li>허벅지 앞쪽 근육 스트레칭 권장</li>
          <li>햄스트링 스트레칭 권장</li>
        </ul>
      </div>
      
      <div>
        <h5 style="margin-bottom: 8px;">📅 후속 조치</h5>
        <p style="margin-left: 16px;">X-ray 촬영 후 30분 뒤 재진료</p>
      </div>
    `)
    setKeywords(['무릎통증', '관절염', '물리치료', 'X-ray', '소염제', '스트레칭'])
    addToast('요약이 생성되었습니다', 'success')
  }

  // Context menu
  const handleContextMenu = (e: React.MouseEvent, noteId: number) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenuNoteId(noteId)
    setContextMenuPosition({ x: e.pageX, y: e.pageY })
    setShowContextMenu(true)
  }

  // Close context menu
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setShowContextMenu(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  // Auto scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [liveTranscript])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        createNewRecording()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [notes])

  const notesToDisplay = activeFilter === 'trash' ? trash : sortedNotes

  // Get speaker info
  const getSpeaker = (speakerId: string): Speaker => {
    const note = currentNote
    return note?.speakers.find(s => s.id === speakerId) || { id: speakerId, name: '알 수 없음', color: '#6c757d' }
  }

  return (
    <div className="main-container">
      {/* 사이드바 */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <button className="new-note-btn" onClick={createNewRecording}>
            <i className="fas fa-microphone"></i>
            <span>새 녹음</span>
          </button>
        </div>

        <nav className="sidebar-nav">
          <a 
            className={`nav-item ${activeFilter === 'all' && !activeFolder ? 'active' : ''}`}
            onClick={() => { setActiveFilter('all'); setActiveFolder(null) }}
          >
            <i className="fas fa-list"></i>
            <span>모든 녹음</span>
            <span className="count">{notes.length}</span>
          </a>
          <a 
            className={`nav-item ${activeFilter === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveFilter('favorites')}
          >
            <i className="fas fa-star"></i>
            <span>즐겨찾기</span>
            <span className="count">{notes.filter(n => n.favorite).length}</span>
          </a>
          <a 
            className={`nav-item ${activeFilter === 'trash' ? 'active' : ''}`}
            onClick={() => setActiveFilter('trash')}
          >
            <i className="fas fa-trash"></i>
            <span>휴지통</span>
            <span className="count">{trash.length}</span>
          </a>
        </nav>

        <div className="sidebar-section">
          <div className="section-header">
            <span>폴더</span>
            <button className="icon-btn" onClick={() => setShowFolderModal(true)} title="폴더 추가">
              <i className="fas fa-plus"></i>
            </button>
          </div>
          <div className="folder-list">
            {folders.map(folder => (
              <div 
                key={folder.id}
                className={`folder-item ${activeFolder === folder.id ? 'active' : ''}`}
                onClick={() => setActiveFolder(folder.id)}
                style={{ 
                  background: activeFolder === folder.id ? 'var(--hover-bg)' : 'transparent',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className="fas fa-folder"></i>
                  <span>{folder.name}</span>
                </div>
                <span className="count" style={{ fontSize: 11 }}>
                  {notes.filter(n => n.folderId === folder.id).length}
                </span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* 녹음 리스트 */}
      <div className="note-list-container">
        <div className="note-list-header">
          <h2>{getDisplayTitle()}</h2>
          <div className="view-options">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <i className="fas fa-th"></i>
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <i className="fas fa-list"></i>
            </button>
            <select 
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'recent' | 'created' | 'title')}
            >
              <option value="recent">최근 순</option>
              <option value="created">생성일순</option>
              <option value="title">제목순</option>
            </select>
          </div>
        </div>

        {activeFilter === 'trash' && trash.length > 0 && (
          <div style={{ padding: '0 16px', marginBottom: 8 }}>
            <button
              onClick={emptyTrash}
              style={{
                background: 'none',
                border: '1px solid var(--danger-color)',
                color: 'var(--danger-color)',
                padding: '8px 16px',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 13,
                width: '100%'
              }}
            >
              <i className="fas fa-trash" style={{ marginRight: 8 }}></i>
              휴지통 비우기
            </button>
          </div>
        )}

        <div className="note-list">
          {notesToDisplay.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              color: 'var(--text-secondary)'
            }}>
              <i className="fas fa-microphone-slash" style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}></i>
              <p>
                {searchQuery ? '검색 결과가 없습니다' : 
                 activeFilter === 'favorites' ? '즐겨찾기한 녹음이 없습니다' :
                 activeFilter === 'trash' ? '휴지통이 비어있습니다' :
                 '녹음이 없습니다'}
              </p>
              {!searchQuery && activeFilter === 'all' && (
                <button
                  onClick={createNewRecording}
                  style={{
                    marginTop: 16,
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #A855F7 0%, #3B82F6 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  새 녹음 시작
                </button>
              )}
            </div>
          ) : (
            notesToDisplay.map(note => (
              <div 
                key={note.id}
                className={`note-card ${note.id === currentNoteId ? 'active' : ''}`}
                onClick={() => selectNote(note.id)}
              >
                <div className="note-card-header">
                  <h3 className="note-title">
                    {note.favorite && <i className="fas fa-star" style={{ color: '#F59E0B', marginRight: 6 }}></i>}
                    <i className="fas fa-microphone" style={{ color: 'var(--primary-color)', marginRight: 6, fontSize: 12 }}></i>
                    {note.title}
                  </h3>
                  <button 
                    className="note-menu-btn"
                    onClick={(e) => handleContextMenu(e, note.id)}
                  >
                    <i className="fas fa-ellipsis-h"></i>
                  </button>
                </div>
                <p className="note-preview">
                  {note.utterances[0]?.text || '녹음 내용이 없습니다'}
                </p>
                <div className="note-card-footer">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="note-date">{note.date}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                      <i className="fas fa-clock" style={{ marginRight: 4 }}></i>
                      {note.duration}
                    </span>
                  </div>
                  <div className="note-tags">
                    {note.tags.slice(0, 2).map((tag, idx) => (
                      <span key={idx} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 상세 보기 영역 */}
      <div className="editor-container">
        {currentNote ? (
          <>
            <div className="editor-header">
              <div className="editor-tabs">
                <button 
                  className={`editor-tab ${currentTab === 'transcript' ? 'active' : ''}`}
                  onClick={() => setCurrentTab('transcript')}
                >
                  <i className="fas fa-align-left"></i>
                  <span>대화 내역</span>
                </button>
                <button 
                  className={`editor-tab ${currentTab === 'record' ? 'active' : ''}`}
                  onClick={() => setCurrentTab('record')}
                >
                  <i className="fas fa-microphone"></i>
                  <span>녹음</span>
                </button>
                <button 
                  className={`editor-tab ${currentTab === 'summary' ? 'active' : ''}`}
                  onClick={() => setCurrentTab('summary')}
                >
                  <i className="fas fa-file-alt"></i>
                  <span>요약</span>
                </button>
              </div>
              <div className="editor-actions">
                <button 
                  className="editor-action-btn" 
                  title="즐겨찾기"
                  onClick={() => toggleFavorite(currentNoteId)}
                  style={{ color: currentNote.favorite ? '#F59E0B' : 'var(--text-secondary)' }}
                >
                  <i className={currentNote.favorite ? 'fas fa-star' : 'far fa-star'}></i>
                </button>
                <button 
                  className="editor-action-btn" 
                  title="공유"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href)
                    addToast('링크가 복사되었습니다', 'success')
                  }}
                >
                  <i className="fas fa-share-alt"></i>
                </button>
                <button 
                  className="editor-action-btn" 
                  title="더보기"
                  onClick={(e) => handleContextMenu(e, currentNoteId)}
                >
                  <i className="fas fa-ellipsis-v"></i>
                </button>
              </div>
            </div>

            {/* 대화 내역 탭 */}
            <div className={`editor-content ${currentTab === 'transcript' ? 'active' : ''}`}>
              <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)' }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{currentNote.title}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: 'var(--text-secondary)', fontSize: 14 }}>
                  <span><i className="fas fa-clock" style={{ marginRight: 6 }}></i>{currentNote.duration}</span>
                  <span><i className="fas fa-users" style={{ marginRight: 6 }}></i>{currentNote.speakers.length}명의 화자</span>
                  <span><i className="fas fa-calendar" style={{ marginRight: 6 }}></i>{currentNote.date}</span>
                </div>
                {/* 화자 범례 */}
                <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
                  {currentNote.speakers.map(speaker => (
                    <div key={speaker.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        background: speaker.color 
                      }} />
                      <span style={{ fontSize: 13 }}>{speaker.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 대화 목록 */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
                {currentNote.utterances.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '60px 20px',
                    color: 'var(--text-secondary)'
                  }}>
                    <i className="fas fa-comments" style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}></i>
                    <p>녹음된 대화가 없습니다</p>
                    <button
                      onClick={() => setCurrentTab('record')}
                      style={{
                        marginTop: 16,
                        padding: '10px 20px',
                        background: 'linear-gradient(135deg, #A855F7 0%, #3B82F6 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      녹음 시작하기
                    </button>
                  </div>
                ) : (
                  currentNote.utterances.map((utterance, index) => {
                    const speaker = getSpeaker(utterance.speakerId)
                    const isEven = index % 2 === 0
                    return (
                      <div 
                        key={utterance.id}
                        style={{
                          display: 'flex',
                          gap: 12,
                          marginBottom: 16,
                          padding: '16px',
                          background: isEven ? 'var(--secondary-color)' : 'white',
                          borderRadius: 12,
                          borderLeft: `4px solid ${speaker.color}`
                        }}
                      >
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: speaker.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: 14,
                          flexShrink: 0
                        }}>
                          {speaker.name.charAt(0)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 8, 
                            marginBottom: 6 
                          }}>
                            <span style={{ fontWeight: 600, color: speaker.color }}>
                              {speaker.name}
                            </span>
                            <span style={{ 
                              fontSize: 12, 
                              color: 'var(--text-secondary)',
                              background: 'var(--hover-bg)',
                              padding: '2px 8px',
                              borderRadius: 4
                            }}>
                              {utterance.timestamp}
                            </span>
                          </div>
                          <p style={{ 
                            lineHeight: 1.7, 
                            color: 'var(--text-primary)',
                            fontSize: 15
                          }}>
                            {utterance.text}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* 녹음 탭 */}
            <div className={`editor-content ${currentTab === 'record' ? 'active' : ''}`}>
              <div className="record-section">
                <div className="record-visualizer">
                  <div className={`record-icon ${isRecording ? 'recording' : ''}`}>
                    <i className="fas fa-microphone"></i>
                  </div>
                  <div className="record-status">
                    {isRecording ? '녹음 중...' : '녹음 준비'}
                  </div>
                  <div className="record-time">{formatTime(recordingTime)}</div>
                </div>
                
                <div className="record-controls">
                  {!isRecording ? (
                    <button className="record-btn start-record" onClick={toggleRecording}>
                      <i className="fas fa-circle"></i>
                      <span>녹음 시작</span>
                    </button>
                  ) : (
                    <button className="record-btn stop-record" onClick={toggleRecording}>
                      <i className="fas fa-stop"></i>
                      <span>녹음 완료</span>
                    </button>
                  )}
                </div>

                {/* 실시간 대화 내역 */}
                <div className="record-transcript">
                  <h4>실시간 대화 인식</h4>
                  <div className="transcript-content" style={{ maxHeight: 300, overflowY: 'auto' }}>
                    {liveTranscript.length === 0 ? (
                      <p style={{ color: 'var(--text-secondary)' }}>
                        녹음을 시작하면 대화가 자동으로 인식됩니다.
                      </p>
                    ) : (
                      liveTranscript.map((utterance) => {
                        const speaker = currentNote.speakers.find(s => s.id === utterance.speakerId) || 
                          { name: '화자', color: '#6c757d' }
                        return (
                          <div 
                            key={utterance.id}
                            style={{
                              marginBottom: 12,
                              paddingBottom: 12,
                              borderBottom: '1px solid var(--border-color)'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                              <span style={{ 
                                fontWeight: 600, 
                                color: speaker.color,
                                fontSize: 13
                              }}>
                                {speaker.name}
                              </span>
                              <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                                {utterance.timestamp}
                              </span>
                            </div>
                            <p style={{ fontSize: 14, lineHeight: 1.6 }}>{utterance.text}</p>
                          </div>
                        )
                      })
                    )}
                    <div ref={transcriptEndRef} />
                  </div>
                </div>
              </div>
            </div>

            {/* 요약 탭 */}
            <div className={`editor-content ${currentTab === 'summary' ? 'active' : ''}`}>
              <div className="summary-section">
                <div className="summary-header">
                  <h3>AI 요약</h3>
                  <button className="generate-summary-btn" onClick={generateSummary}>
                    <i className="fas fa-magic"></i>
                    <span>요약 생성</span>
                  </button>
                </div>
                <div className="summary-content">
                  {summaryContent ? (
                    <div 
                      style={{ textAlign: 'left', color: 'var(--text-primary)', lineHeight: 1.8 }}
                      dangerouslySetInnerHTML={{ __html: summaryContent }}
                    />
                  ) : (
                    <div className="summary-placeholder">
                      <i className="fas fa-file-alt"></i>
                      <p>녹음 내용을 AI가 자동으로 요약해드립니다.</p>
                      <p className="summary-hint">요약 생성 버튼을 클릭하세요.</p>
                    </div>
                  )}
                </div>
                <div className="summary-keywords">
                  <h4>키워드</h4>
                  <div className="keyword-list">
                    {keywords.length > 0 ? (
                      keywords.map((keyword, idx) => (
                        <span key={idx} className="tag">{keyword}</span>
                      ))
                    ) : (
                      <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                        요약 생성 후 키워드가 표시됩니다
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexDirection: 'column',
            color: 'var(--text-secondary)'
          }}>
            <i className="fas fa-microphone" style={{ fontSize: 64, marginBottom: 16, opacity: 0.3 }}></i>
            <p>녹음을 선택하거나 새 녹음을 시작하세요</p>
            <button
              onClick={createNewRecording}
              style={{
                marginTop: 16,
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #A855F7 0%, #3B82F6 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              새 녹음 시작
            </button>
          </div>
        )}
      </div>

      {/* 컨텍스트 메뉴 */}
      {showContextMenu && contextMenuNoteId && (
        <div
          ref={contextMenuRef}
          className="context-menu"
          style={{
            display: 'block',
            position: 'fixed',
            left: contextMenuPosition.x,
            top: contextMenuPosition.y
          }}
        >
          {activeFilter === 'trash' ? (
            <>
              <div 
                className="context-menu-item"
                onClick={() => {
                  restoreFromTrash(contextMenuNoteId)
                  setShowContextMenu(false)
                }}
              >
                <i className="fas fa-undo"></i>
                <span>복원</span>
              </div>
              <div className="context-menu-divider"></div>
              <div 
                className="context-menu-item danger"
                onClick={() => {
                  permanentlyDelete(contextMenuNoteId)
                  setShowContextMenu(false)
                }}
              >
                <i className="fas fa-trash"></i>
                <span>영구 삭제</span>
              </div>
            </>
          ) : (
            <>
              <div 
                className="context-menu-item"
                onClick={() => {
                  toggleFavorite(contextMenuNoteId)
                  setShowContextMenu(false)
                }}
              >
                <i className={notes.find(n => n.id === contextMenuNoteId)?.favorite ? 'fas fa-star' : 'far fa-star'}></i>
                <span>{notes.find(n => n.id === contextMenuNoteId)?.favorite ? '즐겨찾기 해제' : '즐겨찾기'}</span>
              </div>
              <div 
                className="context-menu-item"
                onClick={() => {
                  duplicateNote(contextMenuNoteId)
                  setShowContextMenu(false)
                }}
              >
                <i className="fas fa-copy"></i>
                <span>복제</span>
              </div>
              <div className="context-menu-divider"></div>
              <div style={{ padding: '8px 12px', fontSize: 12, color: 'var(--text-secondary)' }}>
                폴더로 이동
              </div>
              <div 
                className="context-menu-item"
                onClick={() => {
                  moveToFolder(contextMenuNoteId, null)
                  setShowContextMenu(false)
                }}
              >
                <i className="fas fa-folder"></i>
                <span>폴더 없음</span>
              </div>
              {folders.map(folder => (
                <div 
                  key={folder.id}
                  className="context-menu-item"
                  onClick={() => {
                    moveToFolder(contextMenuNoteId, folder.id)
                    setShowContextMenu(false)
                  }}
                >
                  <i className="fas fa-folder"></i>
                  <span>{folder.name}</span>
                </div>
              ))}
              <div className="context-menu-divider"></div>
              <div 
                className="context-menu-item danger"
                onClick={() => {
                  deleteNote(contextMenuNoteId)
                  setShowContextMenu(false)
                }}
              >
                <i className="fas fa-trash"></i>
                <span>삭제</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* 폴더 생성 모달 */}
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
            <h3 style={{ marginBottom: 16 }}>새 폴더</h3>
            <input
              type="text"
              placeholder="폴더 이름"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createFolder()}
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
                onClick={createFolder}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #A855F7 0%, #3B82F6 100%)',
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
