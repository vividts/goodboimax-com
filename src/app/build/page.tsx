// src/app/build/page.tsx
'use client'
import { useState } from 'react'
import type { Selections } from '@/lib/data'
import { PRODUCTS } from '@/lib/data'
import WizardView from '@/components/WizardView'
import CartView from '@/components/CartView'
import CongratsView from '@/components/CongratsView'
import { useRouter } from 'next/navigation'

const EMPTY_SELECTIONS: Selections = {
  ears: null, tail: null, eyes: null, toofs: null, legs: null, coat: null
}

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export default function BuildPage() {
  const [step, setStep] = useState<Step>(1)
  const [selections, setSelections] = useState<Selections>({ ...EMPTY_SELECTIONS })
  const router = useRouter()

  function selectProduct(productId: string) {
    const product = PRODUCTS.find(p => p.id === productId)
    if (!product) return
    setSelections(prev => ({ ...prev, [product.category]: productId }))
  }

  function navigateNext() {
    if (step >= 1 && step <= 5) setStep((step + 1) as Step)
    else if (step === 6) setStep(7)
  }

  function navigateBack() {
    if (step === 1) router.push('/')
    else if (step > 1) setStep((step - 1) as Step)
  }

  function reset() {
    setSelections({ ...EMPTY_SELECTIONS })
    router.push('/')
  }

  if (step >= 1 && step <= 6) {
    return (
      <WizardView
        step={step}
        selections={selections}
        onSelect={selectProduct}
        onNext={navigateNext}
        onBack={navigateBack}
      />
    )
  }

  if (step === 7) {
    return (
      <CartView
        selections={selections}
        onCheckout={() => setStep(8)}
        onBack={() => setStep(6)}
      />
    )
  }

  return <CongratsView selections={selections} onReset={reset} />
}
