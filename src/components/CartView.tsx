// src/components/CartView.tsx
'use client'
import { PRODUCTS, CATEGORY_ORDER, STEPS } from '@/lib/data'
import type { Selections } from '@/lib/data'

interface CartViewProps {
  selections: Selections
  onCheckout: () => void
  onBack: () => void
}

export default function CartView({ selections, onCheckout, onBack }: CartViewProps) {
  let total = 0
  const items = CATEGORY_ORDER.map(cat => {
    const id = selections[cat]
    const product = id ? PRODUCTS.find(p => p.id === id) : null
    if (product) total += product.price
    return { cat, product }
  })

  return (
    <div id="view-cart" className="view active">
      <div className="cart-container">
        <h2>🛒 Your Boi Parts</h2>
        <div className="cart-items">
          {items.map(({ cat, product }) =>
            product ? (
              <div key={cat} className="cart-item">
                <div className="cart-item-emoji">{product.emoji}</div>
                <div className="cart-item-info">
                  <div className="cart-item-name">{product.name}</div>
                  <div className="cart-item-desc">{product.description}</div>
                </div>
                <div className="cart-item-price">${product.price.toFixed(2)}</div>
              </div>
            ) : (
              <div key={cat} className="cart-empty-slot">
                No {STEPS[CATEGORY_ORDER.indexOf(cat)].id} selected — living dangerously.
              </div>
            )
          )}
        </div>
        <div className="cart-total">
          Total: <span style={{ color: 'var(--peach)' }}>${total.toFixed(2)}</span>
        </div>
        <button className="btn-primary" onClick={onCheckout}>Complete Purchase 💳</button>
        <button className="btn-secondary" onClick={onBack}>← Keep Shopping</button>
      </div>
    </div>
  )
}
