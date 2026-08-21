const cities = ['orlando', 'tampa', 'fort-lauderdale', 'miami', 'boca-raton'] as const
const tracks = ['address-mail', 'receptionist-phone', 'full-office'] as const
const productProviders = ['regus', 'opus-virtual-offices', 'alliance-virtual-offices', 'davinci-virtual'] as const
const guideSlugs = [
  'what-is-a-virtual-office',
  'business-address-vs-virtual-office',
  'mail-handling-vs-live-receptionist',
  'hidden-fees-in-virtual-office-plans',
  'how-to-choose-a-virtual-office-in-florida',
  'virtual-office-checklist-for-freelancers-and-small-businesses',
] as const
const homepageJourneys = [
  ...cities.map((city) => `city:${city}` as const),
  ...productProviders.map((provider) => `provider:${provider}` as const),
  'guide:what-is-a-virtual-office',
  'guide:hidden-fees-in-virtual-office-plans',
  'guide:mail-handling-vs-live-receptionist',
  'methodology',
  'affiliate-disclosure',
] as const

export type ProductCity = typeof cities[number]
export type ProductTrack = typeof tracks[number]
export type ProductProvider = typeof productProviders[number]
export type HomepageJourney = typeof homepageJourneys[number]
export type ProductEventName =
  | 'city_page_viewed'
  | 'need_selected'
  | 'ranking_viewed'
  | 'comparison_opened'
  | 'provider_location_viewed'
  | 'affiliate_link_clicked'
  | 'methodology_viewed'
  | 'guide_to_city_clicked'
  | 'homepage_navigation_clicked'

type CityProperties = { city: ProductCity }
type CityJourneyProperties = { city: ProductCity; journey: string }
type ProviderLocationProperties = { city: ProductCity; provider: ProductProvider }
type AffiliateProperties = { provider: ProductProvider; journey: string }
type HomepageNavigationProperties = { journey: HomepageJourney }

export type ProductEvent =
  | { name: 'city_page_viewed'; properties: CityProperties }
  | { name: 'need_selected'; properties: CityJourneyProperties }
  | { name: 'ranking_viewed'; properties: CityJourneyProperties }
  | { name: 'comparison_opened'; properties: CityJourneyProperties }
  | { name: 'provider_location_viewed'; properties: CityJourneyProperties | ProviderLocationProperties }
  | { name: 'affiliate_link_clicked'; properties: AffiliateProperties }
  | { name: 'methodology_viewed'; properties: CityJourneyProperties }
  | { name: 'guide_to_city_clicked'; properties: CityJourneyProperties }
  | { name: 'homepage_navigation_clicked'; properties: HomepageNavigationProperties }

const eventNames = new Set<ProductEventName>([
  'city_page_viewed',
  'need_selected',
  'ranking_viewed',
  'comparison_opened',
  'provider_location_viewed',
  'affiliate_link_clicked',
  'methodology_viewed',
  'guide_to_city_clicked',
  'homepage_navigation_clicked',
])
const citySet = new Set<string>(cities)
const trackSet = new Set<string>(tracks)
const productProviderSet = new Set<string>(productProviders)
const guideSlugSet = new Set<string>(guideSlugs)
const homepageJourneySet = new Set<string>(homepageJourneys)
const prohibitedKeys = new Set(['email', 'name', 'phone', 'userId', 'address', 'query'])

export function isProductCity(value: string | null): value is ProductCity {
  return value !== null && citySet.has(value)
}

export function isProductTrack(value: string | null): value is ProductTrack {
  return value !== null && trackSet.has(value)
}

export function isProductProvider(value: string | null): value is ProductProvider {
  return value !== null && productProviderSet.has(value)
}

export function isProductPosition(value: string | null): boolean {
  return value !== null && /^[1-9][0-9]{0,2}$/.test(value)
}

function isQualifiedJourney(value: string): boolean {
  const [city, track, position, ...rest] = value.split('|')
  return rest.length === 0
    && city !== undefined
    && track !== undefined
    && position !== undefined
    && citySet.has(city)
    && trackSet.has(track)
    && /^[1-9][0-9]{0,2}$/.test(position)
}

function isAllowedJourney(name: ProductEventName, value: string): boolean {
  if (name === 'affiliate_link_clicked') return value === 'unqualified' || isQualifiedJourney(value)
  if (name === 'guide_to_city_clicked') return guideSlugSet.has(value)
  return trackSet.has(value)
}

function invalid(message: string): never {
  throw new TypeError(`Invalid product analytics event: ${message}`)
}

/**
 * Runtime validation is intentionally stricter than the TypeScript union. Events can
 * cross a client/server boundary, so every value is rechecked before delivery.
 */
export function validateProductEvent(input: unknown): ProductEvent {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) invalid('event must be an object')
  const event = input as { name?: unknown; properties?: unknown }
  if (typeof event.name !== 'string' || !eventNames.has(event.name as ProductEventName)) invalid('unapproved event name')
  if (event.properties === null || typeof event.properties !== 'object' || Array.isArray(event.properties)) invalid('properties must be an object')

  const name = event.name as ProductEventName
  const properties = event.properties as Record<string, unknown>
  const keys = Object.keys(properties)
  if (keys.length === 0 || keys.length > 2) invalid('events may contain one or two properties')
  if (keys.some((key) => prohibitedKeys.has(key))) invalid('prohibited property key')
  if (keys.some((key) => key !== 'city' && key !== 'provider' && key !== 'journey')) invalid('unapproved property key')
  if (keys.some((key) => typeof properties[key] !== 'string' || (properties[key] as string).length > 255)) invalid('properties must be short strings')

  if (name === 'homepage_navigation_clicked') {
    if (keys.length !== 1 || keys[0] !== 'journey' || !homepageJourneySet.has(properties.journey as string)) {
      invalid('homepage navigation requires one approved journey')
    }
  } else if (name === 'city_page_viewed') {
    if (keys.length !== 1 || !citySet.has(properties.city as string)) invalid('city page views require an approved city')
  } else if (name === 'affiliate_link_clicked') {
    if (keys.length !== 2 || !isProductProvider(properties.provider as string) || !isAllowedJourney(name, properties.journey as string)) {
      invalid('affiliate clicks require a product provider and approved journey')
    }
  } else if (name === 'provider_location_viewed' && keys.length === 2 && citySet.has(properties.city as string) && isProductProvider(properties.provider as string)) {
    // A location panel may refer to a specific catalog provider. No user input supplies this value.
  } else {
    if (keys.length !== 2 || !citySet.has(properties.city as string) || !isAllowedJourney(name, properties.journey as string)) {
      invalid(`${name} requires an approved city and journey`)
    }
  }

  return { name, properties } as ProductEvent
}

export function affiliateClickEvent(provider: string, city: string | null, track: string | null, position: string | null): ProductEvent {
  const journey = isProductCity(city) && isProductTrack(track) && isProductPosition(position)
    ? `${city}|${track}|${position}`
    : 'unqualified'
  return validateProductEvent({ name: 'affiliate_link_clicked', properties: { provider, journey } })
}
