import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface Folder {
  id: string
  name: string
  _count?: { notes: number }
}

export function useFolders() {
  return useQuery({
    queryKey: ['folders'],
    queryFn: async () => {
      const res = await fetch('/api/folders')
      if (!res.ok) throw new Error('Failed to fetch folders')
      return res.json() as Promise<Folder[]>
    },
  })
}

export function useCreateFolder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { name: string }) => {
      const res = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create folder')
      return res.json() as Promise<Folder>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] })
    },
  })
}

export function useDeleteFolder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/folders/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete folder')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] })
    },
  })
}

