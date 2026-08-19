import { loadCatalog } from '../src/domain/catalog/load-catalog'

try {
  loadCatalog()
  console.log('Content validation passed.')
} catch (error) {
  console.error(error)
  process.exitCode = 1
}
