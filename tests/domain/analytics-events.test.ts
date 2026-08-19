import { describe, expect, it } from 'vitest'
import { validateProductEvent, type ProductEvent } from '@/analytics/events'

describe('ProductEvent', () => {
  it('accepts each approved anonymous product event', () => {
    const events: ProductEvent[] = [
      { name: 'city_page_viewed', properties: { city: 'miami' } },
      { name: 'need_selected', properties: { city: 'miami', journey: 'address-mail' } },
      { name: 'ranking_viewed', properties: { city: 'miami', journey: 'address-mail' } },
      { name: 'comparison_opened', properties: { city: 'miami', journey: 'address-mail' } },
      { name: 'provider_location_viewed', properties: { city: 'miami', provider: 'regus' } },
      { name: 'affiliate_link_clicked', properties: { provider: 'regus', journey: 'miami|address-mail|1' } },
      { name: 'methodology_viewed', properties: { city: 'miami', journey: 'address-mail' } },
      { name: 'guide_to_city_clicked', properties: { city: 'miami', journey: 'what-is-a-virtual-office' } },
    ]

    for (const event of events) expect(validateProductEvent(event)).toEqual(event)
  })

  it.each(['regus', 'opus-virtual-offices', 'alliance-virtual-offices', 'davinci-virtual'])('accepts the approved %s provider identifier', (provider) => {
    expect(validateProductEvent({ name: 'affiliate_link_clicked', properties: { provider, journey: 'unqualified' } })).toEqual({
      name: 'affiliate_link_clicked',
      properties: { provider, journey: 'unqualified' },
    })
  })

  it('rejects arbitrary provider identifiers', () => {
    expect(() => validateProductEvent({
      name: 'affiliate_link_clicked',
      properties: { provider: 'john-smith', journey: 'unqualified' },
    })).toThrow()
  })

  it('rejects an event name or property key outside the allowlist', () => {
    expect(() => validateProductEvent({ name: 'page_viewed', properties: { city: 'miami' } })).toThrow()
    expect(() => validateProductEvent({ name: 'need_selected', properties: { city: 'miami', query: 'address-mail' } })).toThrow()
  })

  it.each(['email', 'name', 'phone', 'userId', 'address', 'query'])('rejects the prohibited %s property', (property) => {
    expect(() => validateProductEvent({
      name: 'need_selected',
      properties: { city: 'miami', [property]: 'personal-data' },
    })).toThrow()
  })

  it('rejects free-form, nested, overlong, and more-than-two property values', () => {
    expect(() => validateProductEvent({
      name: 'need_selected',
      properties: { city: 'miami', journey: 'address-mail', provider: 'example-office' },
    })).toThrow()
    expect(() => validateProductEvent({
      name: 'need_selected',
      properties: { city: 'miami', journey: { selected: 'address-mail' } },
    })).toThrow()
    expect(() => validateProductEvent({
      name: 'need_selected',
      properties: { city: 'miami', journey: 'x'.repeat(256) },
    })).toThrow()
    expect(() => validateProductEvent({
      name: 'need_selected',
      properties: { city: 'miami', journey: 'someone@example.com' },
    })).toThrow()
  })
})
