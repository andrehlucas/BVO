'use client'

import type { FormEvent } from 'react'

interface CityOption {
  slug: string
  name: string
}

export function HomeComparisonSearch({ cities }: { cities: CityOption[] }) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const city = String(form.get('city') ?? 'all')
    const need = String(form.get('need') ?? 'address-mail')
    const monthToMonth = String(form.get('monthToMonth') ?? 'no')
    const params = new URLSearchParams({ need })
    if (monthToMonth === 'yes') params.set('monthToMonth', 'yes')
    window.location.assign(city === 'all' ? '/florida' : `/cities/${city}?${params.toString()}`)
  }

  return (
    <form className="home-search" onSubmit={submit}>
      <label>
        <span className="home-search-label">City</span>
        <span className="home-search-control">
          <select defaultValue="all" name="city">
            <option value="all">All Florida cities</option>
            {cities.map((city) => <option key={city.slug} value={city.slug}>{city.name}</option>)}
          </select>
          <span aria-hidden="true" className="home-search-chevron">⌄</span>
        </span>
      </label>
      <label>
        <span className="home-search-label">Service needed</span>
        <span className="home-search-control">
          <select defaultValue="address-mail" name="need">
            <option value="address-mail">Address &amp; mail</option>
            <option value="receptionist-phone">Live receptionist &amp; phone</option>
            <option value="full-office">Full virtual office</option>
          </select>
          <span aria-hidden="true" className="home-search-chevron">⌄</span>
        </span>
      </label>
      <label>
        <span className="home-search-label">Plan flexibility</span>
        <span className="home-search-control">
          <select defaultValue="no" name="monthToMonth">
            <option value="no">Any contract</option>
            <option value="yes">Month-to-month only</option>
          </select>
          <span aria-hidden="true" className="home-search-chevron">⌄</span>
        </span>
      </label>
      <button aria-label="Compare selected options" type="submit"><span aria-hidden="true" /></button>
    </form>
  )
}
