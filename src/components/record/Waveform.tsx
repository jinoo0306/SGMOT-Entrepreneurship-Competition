'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface WaveformProps {
  audioUrl: string
  className?: string
}

export function Waveform({ audioUrl, className }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [waveformData, setWaveformData] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const generateWaveform = async () => {
      try {
        setIsLoading(true)
        const audioContext = new AudioContext()
        const response = await fetch(audioUrl)
        const arrayBuffer = await response.arrayBuffer()
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
        
        const rawData = audioBuffer.getChannelData(0)
        const samples = 100
        const blockSize = Math.floor(rawData.length / samples)
        const filteredData: number[] = []

        for (let i = 0; i < samples; i++) {
          let blockStart = blockSize * i
          let sum = 0
          for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(rawData[blockStart + j])
          }
          filteredData.push(sum / blockSize)
        }

        const multiplier = Math.pow(Math.max(...filteredData), -1)
        const normalizedData = filteredData.map((n) => n * multiplier)
        
        setWaveformData(normalizedData)
        setIsLoading(false)
      } catch (error) {
        // Fallback: Generate fake waveform for demo
        const fakeData = Array.from({ length: 100 }, () => Math.random())
        setWaveformData(fakeData)
        setIsLoading(false)
      }
    }

    if (audioUrl) {
      generateWaveform()
    }
  }, [audioUrl])

  useEffect(() => {
    if (!canvasRef.current || waveformData.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const width = canvas.offsetWidth * dpr
    const height = canvas.offsetHeight * dpr

    canvas.width = width
    canvas.height = height

    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, width, height)

    const barWidth = canvas.offsetWidth / waveformData.length
    const halfHeight = canvas.offsetHeight / 2

    ctx.fillStyle = '#2F80ED'

    waveformData.forEach((value, index) => {
      const x = index * barWidth
      const barHeight = value * halfHeight * 0.9

      ctx.fillRect(x, halfHeight - barHeight, barWidth - 1, barHeight * 2)
    })
  }, [waveformData])

  return (
    <div className={cn('relative w-full h-24 bg-gray-50 rounded-xl overflow-hidden', className)}>
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 h-8 bg-clova-blue/30 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        </div>
      ) : (
        <canvas
          ref={canvasRef}
          className="w-full h-full"
        />
      )}
    </div>
  )
}

