import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import styles from './glass-surface.module.css'

type GlassSurfaceElement = 'aside' | 'div' | 'header' | 'nav' | 'section'

interface GlassSurfaceProps extends ComponentPropsWithoutRef<'div'> {
  as?: GlassSurfaceElement
  children: ReactNode
  interactive?: boolean
}

export function GlassSurface({ as: Component = 'div', children, className, interactive = false, ...props }: GlassSurfaceProps) {
  const classes = [styles.surface, 'glass-surface', 'glass-surface--solid-fallback', interactive ? styles.interactive : undefined, className]
    .filter(Boolean)
    .join(' ')

  return <Component className={classes} {...props}>{children}</Component>
}
