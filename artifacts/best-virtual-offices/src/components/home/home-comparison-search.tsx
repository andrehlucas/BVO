'use client'

import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'

interface CityOption {
  slug: string
  name: string
}

interface SelectOption {
  label: string
  value: string
}

interface HomeSelectProps {
  defaultValue: string
  label: string
  name: string
  options: SelectOption[]
}

function HomeSelect({ defaultValue, label, name, options }: HomeSelectProps) {
  const id = useId()
  const fieldRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const initialIndex = Math.max(0, options.findIndex((option) => option.value === defaultValue))
  const [selectedIndex, setSelectedIndex] = useState(initialIndex)
  const [activeIndex, setActiveIndex] = useState(initialIndex)
  const [open, setOpen] = useState(false)
  const selected = options[selectedIndex] ?? options[0] ?? { label: '', value: '' }

  useEffect(() => {
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (!fieldRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsidePress)
    return () => document.removeEventListener('pointerdown', closeOnOutsidePress)
  }, [])

  const openList = () => {
    setActiveIndex(selectedIndex)
    setOpen(true)
  }

  const choose = (index: number) => {
    setSelectedIndex(index)
    setActiveIndex(index)
    setOpen(false)
    triggerRef.current?.focus()
  }

  const move = (direction: 1 | -1) => {
    setActiveIndex((current) => (current + direction + options.length) % options.length)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open) openList()
      else move(event.key === 'ArrowDown' ? 1 : -1)
      return
    }
    if (event.key === 'Home' && open) {
      event.preventDefault()
      setActiveIndex(0)
      return
    }
    if (event.key === 'End' && open) {
      event.preventDefault()
      setActiveIndex(options.length - 1)
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (open) choose(activeIndex)
      else openList()
      return
    }
    if (event.key === 'Escape' && open) {
      event.preventDefault()
      setOpen(false)
      return
    }
    if (event.key === 'Tab') {
      setOpen(false)
      return
    }
    if (event.key.length === 1 && /[a-z0-9]/i.test(event.key)) {
      const match = options.findIndex((option) => option.label.toLowerCase().startsWith(event.key.toLowerCase()))
      if (match >= 0) {
        event.preventDefault()
        setActiveIndex(match)
        setOpen(true)
      }
    }
  }

  return (
    <div className={`home-search-field${open ? ' is-open' : ''}`} ref={fieldRef}>
      <input name={name} type="hidden" value={selected.value} />
      <span className="home-search-label" id={`${id}-label`}>{label}</span>
      <button
        aria-activedescendant={open ? `${id}-option-${activeIndex}` : undefined}
        aria-controls={`${id}-listbox`}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-labelledby={`${id}-label ${id}-value`}
        className="home-search-trigger"
        onClick={() => open ? setOpen(false) : openList()}
        onKeyDown={handleKeyDown}
        ref={triggerRef}
        role="combobox"
        type="button"
      >
        <span className="home-search-value" id={`${id}-value`}>{selected.label}</span>
        <span aria-hidden="true" className="home-search-chevron" />
      </button>
      {open && (
        <div aria-labelledby={`${id}-label`} className="home-search-listbox" id={`${id}-listbox`} role="listbox">
          {options.map((option, index) => (
            <button
              aria-selected={index === selectedIndex}
              className="home-search-option"
              data-active={index === activeIndex}
              id={`${id}-option-${index}`}
              key={option.value}
              onClick={() => choose(index)}
              onMouseEnter={() => setActiveIndex(index)}
              role="option"
              tabIndex={-1}
              type="button"
            >
              <span>{option.label}</span>
              <span aria-hidden="true" className="home-search-option-check">✓</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
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
      <HomeSelect
        defaultValue="all"
        label="City"
        name="city"
        options={[{ label: 'All Florida cities', value: 'all' }, ...cities.map((city) => ({ label: city.name, value: city.slug }))]}
      />
      <HomeSelect
        defaultValue="address-mail"
        label="Service needed"
        name="need"
        options={[
          { label: 'Address & mail', value: 'address-mail' },
          { label: 'Live receptionist & phone', value: 'receptionist-phone' },
          { label: 'Full virtual office', value: 'full-office' },
        ]}
      />
      <HomeSelect
        defaultValue="no"
        label="Plan flexibility"
        name="monthToMonth"
        options={[
          { label: 'Any contract', value: 'no' },
          { label: 'Month-to-month only', value: 'yes' },
        ]}
      />
      <button aria-label="Compare selected options" className="home-search-submit" type="submit"><span aria-hidden="true" /></button>
    </form>
  )
}
