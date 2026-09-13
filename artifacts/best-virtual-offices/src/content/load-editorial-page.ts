import { z } from 'zod'
import { editorialKinds } from './types'
import type { EditorialKind, EditorialPage, EditorialStatus } from './types'
import editorialData from './editorial.json'

export class EditorialPageNotFoundError extends Error {}

export function listEditorialPages(kind: EditorialKind): EditorialPage[] {
  return (editorialData[kind] || []).filter((page) => page.status === 'reviewed') as EditorialPage[]
}

export function loadEditorialPage(kind: EditorialKind, slug: string): EditorialPage {
  const pages = editorialData[kind] || []
  const page = pages.find((candidate) => candidate.slug === slug && candidate.status === 'reviewed')

  if (!page) {
    throw new EditorialPageNotFoundError(`Editorial ${kind} page not found for slug: ${slug}`)
  }

  return page as EditorialPage
}
