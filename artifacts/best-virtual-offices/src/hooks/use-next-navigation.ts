import { useLocation, useSearch } from 'wouter'
import { useMemo } from 'react'

export function usePathname() {
  const [location] = useLocation()
  return location
}

export function useRouter() {
  const [, setLocation] = useLocation()
  return useMemo(() => ({
    push: (url: string, options?: any) => setLocation(url),
    replace: (url: string, options?: any) => setLocation(url, { replace: true }),
    prefetch: () => {}
  }), [setLocation])
}

export function useSearchParams() {
  const search = useSearch()
  return useMemo(() => {
    return new URLSearchParams(search || '')
  }, [search])
}

export function notFound() {
  throw new Error("NOT_FOUND") // Catch this in ErrorBoundary or render <NotFound />
}
