export interface PublishStepCopy {
  title: string
  description: string
  /** Optional deeper how-to points shown as a sub-list under the description. */
  details?: string[]
}

/**
 * The step text lives in messages/<locale>.json under `PublishSteps.steps` (an
 * array of 10). Only the emoji per step is structural and stays here.
 */
export const PUBLISH_STEP_EMOJIS = ['✍️', '🔍', '🎨', '📕', '🛤️', '🔢', '📐', '🚀', '📣', '⭐'] as const

export const PUBLISH_STEP_COUNT = PUBLISH_STEP_EMOJIS.length
