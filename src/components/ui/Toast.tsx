'use client'

import { useEffect } from 'react'
import { useUIStore } from '@/store/uiStore'

export function ToastContainer() {
  const { toastQueue, removeToast } = useUIStore()

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      zIndex: 3000,
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }}>
      {toastQueue.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )
}

interface ToastProps {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  onClose: () => void
}

function Toast({ id, message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'fa-check-circle'
      case 'error':
        return 'fa-times-circle'
      case 'warning':
        return 'fa-exclamation-triangle'
      default:
        return 'fa-info-circle'
    }
  }

  const getColor = () => {
    switch (type) {
      case 'success':
        return '#00C73C'
      case 'error':
        return '#dc3545'
      case 'warning':
        return '#ffc107'
      default:
        return '#0066cc'
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 20px',
        background: 'white',
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        borderLeft: `4px solid ${getColor()}`,
        animation: 'slideIn 0.3s ease-out',
        minWidth: 280,
        maxWidth: 400
      }}
    >
      <i 
        className={`fas ${getIcon()}`} 
        style={{ color: getColor(), fontSize: 18 }}
      ></i>
      <span style={{ flex: 1, fontSize: 14, color: 'var(--text-primary)' }}>
        {message}
      </span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 4,
          color: 'var(--text-secondary)',
          fontSize: 14
        }}
      >
        <i className="fas fa-times"></i>
      </button>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
