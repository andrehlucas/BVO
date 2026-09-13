import React from 'react'

export default function Image({
  src,
  alt,
  width,
  height,
  fill,
  sizes,
  priority,
  className,
  ...props
}: {
  src: string
  alt: string
  width?: number | string
  height?: number | string
  fill?: boolean
  sizes?: string
  priority?: boolean
  className?: string
}) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      className={`${fill ? 'absolute inset-0 w-full h-full object-cover ' : ''}${className || ''}`}
      {...props}
    />
  )
}
