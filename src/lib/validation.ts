// src/lib/validation.ts
import leoProfanity from 'leo-profanity'

const URL_PATTERN = /https?:\/\/|www\.|\.(com|net|org|io|co)(\s|$)/i
const PHONE_PATTERN = /(\+?[\d\s\-().]{9,})/
const WHATSAPP_PATTERN = /whatsapp|wa\.me/i
const ALLOWED_CHARS = /^[a-zA-Z0-9 ]+$/

export function validateBoiName(name: string): string | null {
  const trimmed = name.trim()

  if (trimmed.length < 2) return 'Name must be at least 2 characters'
  if (trimmed.length > 30) return 'Name must be 30 characters or fewer'
  if (!ALLOWED_CHARS.test(trimmed)) return 'Letters, numbers, and spaces only'
  if (URL_PATTERN.test(trimmed)) return 'No URLs allowed'
  if (PHONE_PATTERN.test(trimmed)) return 'No phone numbers allowed'
  if (WHATSAPP_PATTERN.test(trimmed)) return 'Nice try'
  if (leoProfanity.check(trimmed)) return 'Keep it family-friendly, please'

  return null
}
