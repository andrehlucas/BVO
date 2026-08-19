export const editorialKinds = ['guides', 'providers', 'cities'] as const

export type EditorialKind = (typeof editorialKinds)[number]

export interface EditorialPage {
  title: string
  description: string
  slug: string
  publishedAt: string
  reviewedAt: string
  reviewer: string
  status: string
  html: string
}
