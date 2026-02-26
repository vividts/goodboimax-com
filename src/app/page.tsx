// src/app/page.tsx (temporary placeholder — will be replaced in Task 10)
import Link from 'next/link'

export default function HomePage() {
  return (
    <div id="view-home" className="view active">
      <div className="hero">
        <h1 className="store-name">🐾 GoodBoiMax.com</h1>
        <p className="tagline">Premium Parts for Premium Bois™</p>
        <p className="sub-tagline">Ethically sourced. Sustainably fluffy. 100% Good.</p>
        <Link href="/build" className="btn-primary">Build Your Boi →</Link>
      </div>
    </div>
  )
}
