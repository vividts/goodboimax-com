// src/app/api/bois/route.ts
import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { validateBoiName } from '@/lib/validation'
import type { Selections } from '@/lib/data'
import { CATEGORY_ORDER, PRODUCTS } from '@/lib/data'

interface SaveBoiRequest {
  name: string
  selections: Selections
}

function validateSelections(selections: unknown): selections is Selections {
  if (!selections || typeof selections !== 'object') return false
  return CATEGORY_ORDER.every(cat => {
    const val = (selections as Record<string, unknown>)[cat]
    if (val === null) return true
    return typeof val === 'string' && PRODUCTS.some(p => p.id === val)
  })
}

export async function POST(request: Request) {
  let body: SaveBoiRequest

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { name, selections } = body

  // Validate name
  const nameError = validateBoiName(name)
  if (nameError) {
    return NextResponse.json({ error: nameError }, { status: 400 })
  }

  // Validate selections
  if (!validateSelections(selections)) {
    return NextResponse.json({ error: 'Invalid selections' }, { status: 400 })
  }

  // Write to Firestore
  const docRef = await adminDb.collection('bois').add({
    name: name.trim(),
    selections,
    createdAt: new Date(),
  })

  return NextResponse.json({ id: docRef.id, name: name.trim() }, { status: 201 })
}
