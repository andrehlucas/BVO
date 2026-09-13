import { readdir, readFile } from 'node:fs/promises'
import type { Dirent } from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkHtml from 'remark-html'
import { z } from 'zod'
import { editorialKinds } from './types'
import type { EditorialKind, EditorialPage } from './types'

const editorialKindSchema = z.enum(editorialKinds)
const dateSchema = z.preprocess(
  (value) => value instanceof Date ? value.toISOString().slice(0, 10) : value,
  z.iso.date(),
)
const editorialFrontmatterSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  publishedAt: dateSchema,
  reviewedAt: dateSchema,
  reviewer: z.string().trim().min(1),
  status: z.enum(['draft', 'reviewed']),
}).strict()

const editorialDirectories: Record<EditorialKind, string> = {
  guides: 'guides',
  providers: 'providers',
  cities: 'cities',
}
const editorialRoot = path.resolve(process.cwd(), 'content/editorial')

export class EditorialPageNotFoundError extends Error {}

function directoryFor(kind: EditorialKind): string {
  return path.join(editorialRoot, editorialDirectories[kind])
}

function hasScriptTag(markdown: string): boolean {
  return /<\s*script\b/i.test(markdown)
}

async function renderMarkdown(markdown: string): Promise<string> {
  // Raw HTML is not passed through by remark-html's safe default. The output is
  // therefore generated solely from Markdown syntax, rather than trusted input HTML.
  return String(await remark().use(remarkHtml, { allowDangerousHtml: false }).process(markdown))
}

async function readPages(kind: EditorialKind): Promise<EditorialPage[]> {
  const directory = directoryFor(kind)
  let entries: Dirent<string>[]

  try {
    entries = await readdir(directory, { withFileTypes: true })
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return []
    }

    throw error
  }

  const markdownFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name)
    .sort()

  const pages = await Promise.all(markdownFiles.map(async (fileName) => {
    const source = await readFile(path.join(directory, fileName), 'utf8')
    const parsed = matter(source)

    if (hasScriptTag(parsed.content)) {
      throw new Error(`Editorial page ${fileName} contains a script tag`)
    }

    const metadata = editorialFrontmatterSchema.parse(parsed.data)

    return {
      ...metadata,
      html: await renderMarkdown(parsed.content),
    }
  }))

  const seenSlugs = new Set<string>()
  for (const page of pages) {
    if (seenSlugs.has(page.slug)) {
      throw new Error(`Duplicate slug in ${kind} editorial content: ${page.slug}`)
    }
    seenSlugs.add(page.slug)
  }

  return pages
}

export async function listEditorialPages(kind: EditorialKind): Promise<EditorialPage[]> {
  const pages = await readPages(editorialKindSchema.parse(kind))
  return pages.filter((page) => page.status === 'reviewed')
}

export async function loadEditorialPage(kind: EditorialKind, slug: string): Promise<EditorialPage> {
  const pages = await listEditorialPages(editorialKindSchema.parse(kind))
  const page = pages.find((candidate) => candidate.slug === slug)

  if (!page) {
    throw new EditorialPageNotFoundError(`Editorial ${kind} page not found for slug: ${slug}`)
  }

  return page
}
