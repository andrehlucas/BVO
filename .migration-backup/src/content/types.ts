export const editorialKinds = ['guides', 'providers', 'cities'] as const

export type EditorialKind = (typeof editorialKinds)[number]
export type EditorialStatus = 'draft' | 'reviewed'

export interface EditorialPage {
  title: string
  description: string
  slug: string
  publishedAt: string
  reviewedAt: string
  reviewer: string
  status: EditorialStatus
  html: string
}
