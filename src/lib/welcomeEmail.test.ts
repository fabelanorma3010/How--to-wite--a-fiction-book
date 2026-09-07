import { describe, expect, it } from 'vitest'
import { isFirstSession } from './welcomeEmail'
import type { User } from '@supabase/supabase-js'

function mockUser(createdAt: string, lastSignInAt: string | null): User {
  return {
    id: 'user-1',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: createdAt,
    last_sign_in_at: lastSignInAt,
  } as User
}

describe('isFirstSession', () => {
  it('is true when created_at and last_sign_in_at are the same instant', () => {
    expect(isFirstSession(mockUser('2026-09-06T10:00:00Z', '2026-09-06T10:00:00Z'))).toBe(true)
  })

  it('is true for a first login a few seconds after account creation', () => {
    expect(isFirstSession(mockUser('2026-09-06T10:00:00Z', '2026-09-06T10:00:05Z'))).toBe(true)
  })

  it('is false for a returning login well after account creation', () => {
    expect(isFirstSession(mockUser('2026-09-01T10:00:00Z', '2026-09-06T10:00:00Z'))).toBe(false)
  })

  it('is true when last_sign_in_at is missing entirely', () => {
    expect(isFirstSession(mockUser('2026-09-06T10:00:00Z', null))).toBe(true)
  })
})
