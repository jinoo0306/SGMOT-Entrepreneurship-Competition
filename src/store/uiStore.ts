import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
}

interface UIState {
  // Sidebar
  sidebarCollapsed: boolean
  sidebarOpen: boolean
  
  // Search
  searchQuery: string
  
  // Theme
  theme: 'light' | 'dark'
  
  // Toast
  toastQueue: Toast[]
  
  // Recording
  isRecording: boolean
  recordingTime: number
  
  // Filter
  activeFilter: 'all' | 'favorites' | 'recording' | 'trash'
  activeFolder: string | null
  
  // Modals
  showFolderModal: boolean
  showSettingsModal: boolean
  showNotifications: boolean

  // Actions
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setSidebarOpen: (open: boolean) => void
  setSearchQuery: (query: string) => void
  setTheme: (theme: 'light' | 'dark') => void
  addToast: (message: string, type: Toast['type']) => void
  removeToast: (id: string) => void
  setIsRecording: (isRecording: boolean) => void
  setRecordingTime: (time: number) => void
  setActiveFilter: (filter: 'all' | 'favorites' | 'recording' | 'trash') => void
  setActiveFolder: (folderId: string | null) => void
  setShowFolderModal: (show: boolean) => void
  setShowSettingsModal: (show: boolean) => void
  setShowNotifications: (show: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      sidebarOpen: false,
      searchQuery: '',
      theme: 'light',
      toastQueue: [],
      isRecording: false,
      recordingTime: 0,
      activeFilter: 'all',
      activeFolder: null,
      showFolderModal: false,
      showSettingsModal: false,
      showNotifications: false,

      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setTheme: (theme) => set({ theme }),
      addToast: (message, type) =>
        set((state) => ({
          toastQueue: [
            ...state.toastQueue,
            { id: Date.now().toString(), message, type },
          ],
        })),
      removeToast: (id) =>
        set((state) => ({
          toastQueue: state.toastQueue.filter((t) => t.id !== id),
        })),
      setIsRecording: (isRecording) => set({ isRecording }),
      setRecordingTime: (time) => set({ recordingTime: time }),
      setActiveFilter: (filter) => set({ activeFilter: filter, activeFolder: null }),
      setActiveFolder: (folderId) => set({ activeFolder: folderId, activeFilter: 'all' }),
      setShowFolderModal: (show) => set({ showFolderModal: show }),
      setShowSettingsModal: (show) => set({ showSettingsModal: show }),
      setShowNotifications: (show) => set({ showNotifications: show }),
    }),
    {
      name: 'clova-note-ui-storage',
      partialize: (state) => ({ 
        theme: state.theme, 
        sidebarCollapsed: state.sidebarCollapsed 
      }),
    }
  )
)
