// src/components/Carousel.tsx
'use client'
import { useRef } from 'react'
import DogSvg from './DogSvg'
import type { Selections } from '@/lib/data'

export interface NamedBoi {
  id: string
  name: string
  selections: Selections
}

interface CarouselProps {
  bois: NamedBoi[]
}

export default function Carousel({ bois }: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)

  function scroll(dir: 'prev' | 'next') {
    if (!trackRef.current) return
    const amount = 244 // card width (220) + gap (24)
    trackRef.current.scrollBy({ left: dir === 'next' ? amount : -amount, behavior: 'smooth' })
  }

  if (bois.length === 0) return null

  return (
    <section className="carousel-section">
      <h2 className="carousel-title">🐾 Recently Named Bois</h2>
      <div className="carousel-wrapper">
        <button className="carousel-btn carousel-btn-prev" onClick={() => scroll('prev')} aria-label="Previous">‹</button>
        <div className="carousel-track" ref={trackRef}>
          {bois.map(boi => (
            <div key={boi.id} className="carousel-card">
              <DogSvg selections={boi.selections} />
              <span className="carousel-card-name">{boi.name}</span>
            </div>
          ))}
        </div>
        <button className="carousel-btn carousel-btn-next" onClick={() => scroll('next')} aria-label="Next">›</button>
      </div>
    </section>
  )
}
