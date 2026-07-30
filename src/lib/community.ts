import type { BookTypeId } from '../data/bookTypes'

export const MAX_CONTENT_LENGTH = 500
export const MAX_NAME_LENGTH = 60

export interface CommunityPost {
  id: number
  name: string
  bookType: BookTypeId
  content: string
  createdAt: string
}
