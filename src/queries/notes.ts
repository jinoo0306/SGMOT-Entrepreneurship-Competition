import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface Note {
  id: string
  title: string
  content: string
  summary?: string | null
  isFavorite: boolean
  folderId?: string | null
  folder?: { id: string; name: string } | null
  tags: { tag: { id: string; name: string; color: string } }[]
  shared: boolean
  sharedSlug?: string | null
  audioUrl?: string | null
  duration?: number | null
  createdAt: string
  updatedAt: string
}

interface NotesParams {
  q?: string
  tag?: string
  folder?: string
  favorite?: boolean
  sort?: 'newest' | 'oldest' | 'title'
  page?: number
  limit?: number
}

export function useNotes(params: NotesParams = {}) {
  return useQuery({
    queryKey: ['notes', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      if (params.q) searchParams.set('q', params.q)
      if (params.tag) searchParams.set('tag', params.tag)
      if (params.folder) searchParams.set('folder', params.folder)
      if (params.favorite) searchParams.set('favorite', 'true')
      if (params.sort) searchParams.set('sort', params.sort)
      if (params.page) searchParams.set('page', params.page.toString())
      if (params.limit) searchParams.set('limit', params.limit.toString())

      const res = await fetch(`/api/notes?${searchParams}`)
      if (!res.ok) throw new Error('Failed to fetch notes')
      return res.json() as Promise<{ notes: Note[]; total: number }>
    },
  })
}

export function useNote(id: string | null) {
  return useQuery({
    queryKey: ['note', id],
    queryFn: async () => {
      if (!id) return null
      const res = await fetch(`/api/notes/${id}`)
      if (!res.ok) throw new Error('Failed to fetch note')
      return res.json() as Promise<Note>
    },
    enabled: !!id,
  })
}

export function useCreateNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { title: string; content?: string; audioUrl?: string; folderId?: string }) => {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create note')
      return res.json() as Promise<Note>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })
}

export function useUpdateNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; title?: string; content?: string; isFavorite?: boolean; folderId?: string | null; tagIds?: string[] }) => {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update note')
      return res.json() as Promise<Note>
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      queryClient.invalidateQueries({ queryKey: ['note', data.id] })
    },
  })
}

export function useDeleteNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete note')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })
}

export function useShareNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/notes/${id}/share`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Failed to share note')
      return res.json() as Promise<{ sharedSlug: string }>
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['note', id] })
    },
  })
}

