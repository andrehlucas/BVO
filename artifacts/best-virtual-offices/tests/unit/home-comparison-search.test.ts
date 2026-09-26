import { expect, it } from 'vitest'
import { comparisonDestination } from '../../src/components/home/home-comparison-search'
import { cityComparisonHref } from '../../src/pages/florida'

it('keeps service and contract criteria when quick compare starts with all Florida cities', () => {
  expect(comparisonDestination({ city: 'all', need: 'full-office', monthToMonth: 'yes' }))
    .toBe('/florida?need=full-office&monthToMonth=yes')
})

it('keeps criteria when a Florida hub visitor chooses a city', () => {
  expect(cityComparisonHref('miami', new URLSearchParams('need=receptionist-phone&monthToMonth=yes')))
    .toBe('/cities/miami?need=receptionist-phone&monthToMonth=yes')
})
