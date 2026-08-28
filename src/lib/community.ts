import type { BookTypeId } from '../data/bookTypes'

export const MAX_CONTENT_LENGTH = 500

export interface CommunityPost {
  id: string
  name: string
  bookType: BookTypeId
  content: string
  createdAt: string
}
