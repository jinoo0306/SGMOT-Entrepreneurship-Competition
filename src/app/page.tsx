'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function HomePage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    } else if (status === 'unauthenticated') {
      router.push('/signin')
    }
  }, [status, router])

  // 로딩 중 화면
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      background: 'linear-gradient(135deg, #A855F7 0%, #3B82F6 100%)'
    }}>
      <div style={{ textAlign: 'center' }}>
        <i className="fas fa-music" style={{ fontSize: 48, color: 'white', marginBottom: 16, display: 'block' }}></i>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'white', marginBottom: 8 }}>Melodious</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)' }}>로딩 중...</p>
      </div>
    </div>
  )
}
