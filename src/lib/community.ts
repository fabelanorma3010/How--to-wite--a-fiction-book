import type { BookTypeId } from '../data/bookTypes'

export const MAX_CONTENT_LENGTH = 2000

export interface CommunityPost {
  id: string
  authorName: string
  bookType: BookTypeId
  title: string | null
  content: string
  createdAt: string
}
