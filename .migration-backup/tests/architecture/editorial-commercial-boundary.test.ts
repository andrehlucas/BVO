import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const sourceDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../src/domain',
)
const forbiddenImportFragments = ['/commercial/', 'affiliate-links', '/analytics/', '/components/']

async function listSourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name)

      if (entry.isDirectory()) {
        return listSourceFiles(entryPath)
      }

      return entry.isFile() && /\.tsx?$/.test(entry.name) ? [entryPath] : []
    }),
  )

  return files.flat()
}

describe('editorial-commercial boundary', () => {
  it('keeps commercial, analytics, and UI imports out of the domain layer', async () => {
    const sourceFiles = await listSourceFiles(sourceDirectory)
    const forbiddenImports: string[] = []

    for (const sourceFile of sourceFiles) {
      const source = await readFile(sourceFile, 'utf8')
      const imports = source.matchAll(/(?:import|export)\s+(?:[^'";]+?\s+from\s+)?['"]([^'"]+)['"]/g)

      for (const importedModule of imports) {
        const moduleSpecifier = importedModule[1]!

        if (forbiddenImportFragments.some((fragment) => moduleSpecifier.includes(fragment))) {
          forbiddenImports.push(`${path.relative(sourceDirectory, sourceFile)}: ${moduleSpecifier}`)
        }
      }
    }

    expect(forbiddenImports).toEqual([])
  })
})
