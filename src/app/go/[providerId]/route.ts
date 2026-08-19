import { NextResponse } from 'next/server'
import { resolveOutboundUrl } from '@/commercial/resolve-outbound-url'
import { loadCatalog } from '@/domain/catalog/load-catalog'

const allowedContextParameters = new Set(['city', 'track', 'plan', 'position', 'context'])

interface RouteContext {
  params: Promise<{ providerId: string }>
}

export async function GET(request: Request, { params }: RouteContext): Promise<Response> {
  const requestUrl = new URL(request.url)

  if ([...requestUrl.searchParams.keys()].some((key) => !allowedContextParameters.has(key))) {
    return new NextResponse(null, { status: 400 })
  }

  const { providerId } = await params
  const provider = loadCatalog().providers.find((catalogProvider) => catalogProvider.id === providerId)

  if (provider === undefined) {
    return new NextResponse(null, { status: 404 })
  }

  const response = NextResponse.redirect(resolveOutboundUrl(provider.id, provider.websiteUrl), 302)
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return response
}
