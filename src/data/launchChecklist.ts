export interface LaunchPhaseCopy {
  phase: string
  when: string
  items: string[]
}

/**
 * The phase and item text lives in messages/<locale>.json under
 * `LaunchChecklist.phases` (an array of 3). Only the emoji per phase is
 * structural and stays here.
 */
export const LAUNCH_PHASE_EMOJIS = ['🗓️', '🚀', '📈'] as const

export const LAUNCH_PHASE_COUNT = LAUNCH_PHASE_EMOJIS.length
