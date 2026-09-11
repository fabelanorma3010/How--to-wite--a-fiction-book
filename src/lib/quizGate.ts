const AGE_GATE_STORAGE_KEY = 'storyburst:quiz-age-gate'

export interface StoredAgeGate {
  age: number
  parentApproved: boolean
  completed: boolean
}

// Remembers quiz progress per browser: the age-gate answer (so it's only
// asked once) and whether the quiz itself has been finished (so the rest
// of the tools can require it before granting access).
export function loadStoredAgeGate(): StoredAgeGate | null {
  try {
    const raw = window.localStorage.getItem(AGE_GATE_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (typeof parsed?.age !== 'number') return null
    return {
      age: parsed.age,
      parentApproved: Boolean(parsed.parentApproved),
      completed: Boolean(parsed.completed),
    }
  } catch {
    return null
  }
}

export function saveStoredAgeGate(next: StoredAgeGate | null) {
  try {
    if (next) window.localStorage.setItem(AGE_GATE_STORAGE_KEY, JSON.stringify(next))
    else window.localStorage.removeItem(AGE_GATE_STORAGE_KEY)
  } catch {
    // Private browsing / storage full — the gate just re-asks next visit.
  }
}
