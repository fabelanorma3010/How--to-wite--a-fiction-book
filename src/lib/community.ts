import type { BookTypeId } from '../data/bookTypes'

export const MAX_CONTENT_LENGTH = 2000

export interface CommunityPost {
  id: string
  authorId: string
  authorName: string
  bookType: BookTypeId
  title: string | null
  content: string
  createdAt: string
}

export const MAX_COMMENT_LENGTH = 500

export interface PostComment {
  id: string
  postId: string
  authorId: string
  authorName: string
  body: string
  createdAt: string
}

export const REPORT_REASONS = ['spam', 'harassment', 'inappropriate', 'other'] as const
export type ReportReason = (typeof REPORT_REASONS)[number]
