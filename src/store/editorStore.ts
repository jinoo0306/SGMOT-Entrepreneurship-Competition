import { create } from 'zustand'

interface EditorState {
  currentNoteId: string | null
  titleDraft: string
  contentDraft: string
  isDirty: boolean
  lastSavedAt: Date | null
  isSaving: boolean

  // Actions
  setCurrentNote: (id: string | null, title: string, content: string) => void
  setTitleDraft: (title: string) => void
  setContentDraft: (content: string) => void
  setIsDirty: (dirty: boolean) => void
  setIsSaving: (saving: boolean) => void
  markSaved: () => void
  resetEditor: () => void
}

export const useEditorStore = create<EditorState>()((set) => ({
  currentNoteId: null,
  titleDraft: '',
  contentDraft: '',
  isDirty: false,
  lastSavedAt: null,
  isSaving: false,

  setCurrentNote: (id, title, content) =>
    set({
      currentNoteId: id,
      titleDraft: title,
      contentDraft: content,
      isDirty: false,
    }),

  setTitleDraft: (title) =>
    set((state) => ({
      titleDraft: title,
      isDirty: title !== state.titleDraft || state.isDirty,
    })),

  setContentDraft: (content) =>
    set((state) => ({
      contentDraft: content,
      isDirty: content !== state.contentDraft || state.isDirty,
    })),

  setIsDirty: (dirty) => set({ isDirty: dirty }),
  setIsSaving: (saving) => set({ isSaving: saving }),

  markSaved: () =>
    set({
      isDirty: false,
      lastSavedAt: new Date(),
      isSaving: false,
    }),

  resetEditor: () =>
    set({
      currentNoteId: null,
      titleDraft: '',
      contentDraft: '',
      isDirty: false,
      lastSavedAt: null,
      isSaving: false,
    }),
}))

