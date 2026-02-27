// src/components/WizardView.tsx
'use client'
import DogSvg from './DogSvg'
import { STEPS, PRODUCTS, CATEGORY_ORDER } from '@/lib/data'
import type { Selections } from '@/lib/data'

interface WizardViewProps {
  step: number
  selections: Selections
  onSelect: (productId: string) => void
  onNext: () => void
  onBack: () => void
}

export default function WizardView({ step, selections, onSelect, onNext, onBack }: WizardViewProps) {
  const stepIndex = step - 1
  const stepData = STEPS[stepIndex]
  const category = CATEGORY_ORDER[stepIndex]
  const products = PRODUCTS.filter(p => p.category === category)

  return (
    <div id="view-wizard" className="view active">
      <div className="wizard-layout">
        <div className="wizard-main">
          <div className="dog-preview-mobile">
            <DogSvg selections={selections} />
          </div>
          <div className="progress-bar">
            {CATEGORY_ORDER.map((cat, i) => {
              const num = i + 1
              const isDone = selections[cat] !== null
              const isActive = num === step
              const cls = isActive ? 'active' : isDone ? 'completed' : ''
              return (
                <span key={cat}>
                  <div className={`progress-step ${cls}`}>🐾</div>
                  {i < 5 && <div className={`progress-connector ${isDone && !isActive ? 'filled' : ''}`} />}
                </span>
              )
            })}
          </div>

          <div className="step-header">
            <h2>{stepData.title}</h2>
            <p>{stepData.subtitle}</p>
          </div>

          <div className="product-grid">
            {products.map(p => (
              <div
                key={p.id}
                className={`product-card ${selections[category] === p.id ? 'selected' : ''}`}
                onClick={() => onSelect(p.id)}
              >
                <div className="product-emoji">{p.emoji}</div>
                <div className="product-name">{p.name}</div>
                <div className="product-desc">{p.description}</div>
                <div className="product-price">${p.price.toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div className="wizard-nav">
            <button className="btn-secondary" onClick={onBack}>
              {step === 1 ? '← Home' : '← Back'}
            </button>
            <button className="btn-primary" onClick={onNext}>
              {step === 6 ? 'Review Cart →' : 'Next →'}
            </button>
          </div>
        </div>

        <div className="dog-sidebar">
          <div className="dog-preview-label">Your Boi So Far</div>
          <div className="dog-preview">
            <DogSvg selections={selections} />
          </div>
        </div>
      </div>
    </div>
  )
}
