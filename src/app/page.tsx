// src/app/page.tsx
import Link from 'next/link'
import Carousel from '@/components/Carousel'
import type { NamedBoi } from '@/components/Carousel'
import type { Selections } from '@/lib/data'

async function getRecentBois(): Promise<NamedBoi[]> {
  try {
    const { adminDb } = await import('@/lib/firebase-admin')
    const snapshot = await adminDb
      .collection('bois')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get()

    return snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name as string,
      selections: doc.data().selections as Selections,
    }))
  } catch (err) {
    console.error('Failed to fetch bois:', err)
    return []
  }
}

export const revalidate = 60 // ISR: refresh every 60 seconds

export default async function HomePage() {
  const bois = await getRecentBois()

  return (
    <main className="home-page-layout">
      <div id="view-home" className="view active">
        <div className="hero">
          <h1 className="store-name">🐾 GoodBoiMax.com</h1>
          <p className="tagline">Premium Parts for Premium Bois™</p>
          <p className="sub-tagline">Ethically sourced. Sustainably fluffy. 100% Good.</p>
          <Link href="/build" className="btn-primary">Build Your Boi →</Link>
        </div>
      </div>
      <Carousel bois={bois} />
    </main>
  )
}
