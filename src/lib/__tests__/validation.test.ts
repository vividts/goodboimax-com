// src/lib/__tests__/validation.test.ts
import { validateBoiName } from '../validation'

describe('validateBoiName', () => {
  it('accepts valid names', () => {
    expect(validateBoiName('Sir Woofington')).toBeNull()
    expect(validateBoiName('Max')).toBeNull()
    expect(validateBoiName('Mr Biscuit 2')).toBeNull()
  })

  it('rejects names shorter than 2 characters', () => {
    expect(validateBoiName('A')).toMatch(/2/)
  })

  it('rejects names longer than 30 characters', () => {
    expect(validateBoiName('A'.repeat(31))).toMatch(/30/)
  })

  it('rejects names with special characters', () => {
    expect(validateBoiName('Sir Woofington!')).toBeTruthy()
    expect(validateBoiName('boi@gmail.com')).toBeTruthy()
  })

  it('rejects URLs', () => {
    expect(validateBoiName('www.scam.com')).toBeTruthy()
    expect(validateBoiName('http://bad.com')).toBeTruthy()
    expect(validateBoiName('check this out .com')).toBeTruthy()
  })

  it('rejects phone numbers', () => {
    expect(validateBoiName('555 867 5309')).toBeTruthy()
    expect(validateBoiName('call 447911123456')).toBeTruthy()
  })

  it('rejects WhatsApp patterns', () => {
    expect(validateBoiName('whatsapp me')).toBeTruthy()
    expect(validateBoiName('wa.me link')).toBeTruthy()
  })
})
