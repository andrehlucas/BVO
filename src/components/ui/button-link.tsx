import Link from 'next/link'
import type { ComponentPropsWithoutRef } from 'react'

interface ButtonLinkProps extends ComponentPropsWithoutRef<'a'> {
  external?: boolean
  href: string
  variant?: 'primary' | 'secondary'
}

export function ButtonLink({ className, external, href, variant = 'primary', ...props }: ButtonLinkProps) {
  const classes = ['button-link', `button-link--${variant}`, className].filter(Boolean).join(' ')
  const isExternal = external ?? /^https?:\/\//.test(href)

  if (isExternal) return <a className={classes} href={href} {...props} />
  return <Link className={classes} href={href} {...props} />
}
