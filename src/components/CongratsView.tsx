// src/components/CongratsView.tsx
'use client'
import { useEffect, useRef, useState } from 'react'
import DogSvg from './DogSvg'
import { PRODUCTS } from '@/lib/data'
import { validateBoiName } from '@/lib/validation'
import type { Selections } from '@/lib/data'

interface CongratsViewProps {
  selections: Selections
  onReset: () => void
}

function spawnConfetti(container: HTMLDivElement) {
  container.innerHTML = ''
  const colors = ['#FFB347', '#7EC8A4', '#B39DDB', '#FF7F7F', '#FFD700', '#87CEEB']
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('div')
    piece.className = 'confetti-piece'
    piece.style.left = Math.random() * 100 + 'vw'
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
    piece.style.width = (8 + Math.random() * 10) + 'px'
    piece.style.height = (10 + Math.random() * 12) + 'px'
    piece.style.animationDuration = (2 + Math.random() * 3) + 's'
    piece.style.animationDelay = (Math.random() * 2) + 's'
    container.appendChild(piece)
  }
}

function buildMessage(selections: Selections): string {
  const traits: string[] = []
  if (selections.ears) {
    const p = PRODUCTS.find(p => p.id === selections.ears)
    if (p) traits.push(p.name.toLowerCase().replace(/\s+/g, '-'))
  }
  if (selections.tail) {
    const p = PRODUCTS.find(p => p.id === selections.tail)
    if (p) traits.push(p.name.toLowerCase().replace(/\s+/g, '-'))
  }
  if (selections.coat) {
    const p = PRODUCTS.find(p => p.id === selections.coat)
    if (p) traits.push(p.name.toLowerCase())
  }
  return traits.length > 0 ? `a ${traits.join(', ')} ` : 'a mystery '
}

export default function CongratsView({ selections, onReset }: CongratsViewProps) {
  const confettiRef = useRef<HTMLDivElement>(null)
  const [nameInput, setNameInput] = useState('')
  const [nameError, setNameError] = useState<string | null>(null)
  const [savedName, setSavedName] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (confettiRef.current) spawnConfetti(confettiRef.current)
  }, [])

  async function handleSave() {
    const error = validateBoiName(nameInput)
    if (error) {
      setNameError(error)
      return
    }
    setNameError(null)
    setSaving(true)

    try {
      const res = await fetch('/api/bois', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameInput.trim(), selections }),
      })
      const data = await res.json()
      if (!res.ok) {
        setNameError(data.error ?? 'Something went wrong')
      } else {
        setSavedName(data.name)
      }
    } catch {
      setNameError('Network error. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const traitStr = buildMessage(selections)

  return (
    <div id="view-congrats" className="view active">
      <div className="confetti-container" ref={confettiRef} />
      <div className="congrats-content">
        <div className="congrats-dog">
          <DogSvg selections={selections} />
        </div>
        <h1 id="congrats-headline">🎉 Congrats!</h1>
        <p id="congrats-message">
          You&apos;ve assembled {traitStr}<strong>GOOD BOI</strong>! 🐾<br />
          They are already waiting by the door.
        </p>
        <p className="congrats-fine-print">
          Your Good Boi will arrive within 3–5 business woofs.
        </p>

        {savedName ? (
          <div className="name-input-section">
            <p className="name-saved">✓ Saved!</p>
            <p className="name-display">{savedName}</p>
          </div>
        ) : (
          <div className="name-input-section">
            <div className="name-input-row">
              <input
                className={`name-input ${nameError ? 'error' : ''}`}
                type="text"
                placeholder="Name your boi..."
                value={nameInput}
                maxLength={30}
                onChange={e => { setNameInput(e.target.value); setNameError(null) }}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
              />
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? '...' : 'Save'}
              </button>
            </div>
            {nameError && <p className="name-input-error">{nameError}</p>}
            <button className="btn-skip" onClick={onReset}>Skip</button>
          </div>
        )}

        {savedName && (
          <button className="btn-primary" onClick={onReset}>Adopt Another Boi 🐶</button>
        )}
      </div>
    </div>
  )
}
