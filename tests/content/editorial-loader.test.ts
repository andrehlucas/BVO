import { beforeEach, describe, expect, it, vi } from 'vitest'

const fileSystem = vi.hoisted(() => ({
  readFile: vi.fn(),
  readdir: vi.fn(),
}))

vi.mock('node:fs/promises', () => ({
  ...fileSystem,
  default: fileSystem,
}))

import { loadEditorialPage } from '@/content/load-editorial-page'

function markdown(frontmatter: Record<string, string>, body = '## Editorial body\n\nUseful **detail**.') {
  return [
    '---',
    ...Object.entries(frontmatter).map(([key, value]) => `${key}: ${JSON.stringify(value)}`),
    '---',
    body,
  ].join('\n')
}

const validFrontmatter = {
  title: 'What is a virtual office?',
  description: 'A plain-language guide to virtual offices.',
  slug: 'what-is-a-virtual-office',
  publishedAt: '2026-08-19',
  reviewedAt: '2026-08-19',
  reviewer: 'Editorial team',
  status: 'published',
}

function setFiles(files: Record<string, string>) {
  fileSystem.readdir.mockResolvedValue(
    Object.keys(files).map((name) => ({ name, isFile: () => true })),
  )
  fileSystem.readFile.mockImplementation(async (filePath: string) => {
    const name = filePath.split('/').at(-1)
    const content = name ? files[name] : undefined

    if (!content) {
      throw new Error(`Missing fixture for ${filePath}`)
    }

    return content
  })
}

describe('loadEditorialPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads validated frontmatter and renders repository Markdown', async () => {
    setFiles({
      'what-is-a-virtual-office.md': markdown(validFrontmatter),
    })

    await expect(loadEditorialPage('guides', 'what-is-a-virtual-office')).resolves.toMatchObject({
      ...validFrontmatter,
      html: expect.stringContaining('<strong>detail</strong>'),
    })
  })

  it('rejects editorial pages without every required frontmatter field', async () => {
    const frontmatterWithoutDescription = Object.fromEntries(
      Object.entries(validFrontmatter).filter(([key]) => key !== 'description'),
    )
    setFiles({
      'what-is-a-virtual-office.md': markdown(frontmatterWithoutDescription),
    })

    await expect(loadEditorialPage('guides', 'what-is-a-virtual-office')).rejects.toThrow(
      /description/i,
    )
  })

  it('rejects invalid publication or review dates', async () => {
    setFiles({
      'what-is-a-virtual-office.md': markdown({
        ...validFrontmatter,
        reviewedAt: 'not-a-date',
      }),
    })

    await expect(loadEditorialPage('guides', 'what-is-a-virtual-office')).rejects.toThrow(
      /reviewedAt/i,
    )
  })

  it('rejects duplicate slugs before returning an editorial page', async () => {
    setFiles({
      'first.md': markdown(validFrontmatter),
      'second.md': markdown(validFrontmatter),
    })

    await expect(loadEditorialPage('guides', 'what-is-a-virtual-office')).rejects.toThrow(
      /duplicate slug/i,
    )
  })

  it('rejects bodies that contain script tags', async () => {
    setFiles({
      'what-is-a-virtual-office.md': markdown(validFrontmatter, '<script>alert("unsafe")</script>'),
    })

    await expect(loadEditorialPage('guides', 'what-is-a-virtual-office')).rejects.toThrow(
      /script/i,
    )
  })

  it('does not turn an invalid kind into a filesystem path', async () => {
    await expect(
      loadEditorialPage('../../private' as never, 'what-is-a-virtual-office'),
    ).rejects.toThrow(/invalid option/i)

    expect(fileSystem.readdir).not.toHaveBeenCalled()
  })
})
