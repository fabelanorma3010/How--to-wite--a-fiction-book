'use client'

import { useEffect, useRef, useState } from 'react'

interface ShimmerImageProps {
  src: string
  alt: string
  imgClassName?: string
  wrapperClassName?: string
}

export default function ShimmerImage({
  src,
  alt,
  imgClassName = 'h-full w-full object-cover',
  wrapperClassName = 'relative h-full w-full',
}: ShimmerImageProps) {
  const [loaded, setLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    // On a server-rendered page the browser can start (and for a cached or
    // tiny image, even finish) loading before React hydrates and attaches
    // onLoad below — `complete` catches that already-settled state.
    if (imgRef.current?.complete) {
      setLoaded(true)
    }
  }, [])

  return (
    <div className={wrapperClassName}>
      {!loaded && <div aria-hidden="true" className="noir-shimmer absolute inset-0" />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        style={loaded ? undefined : { opacity: 0 }}
        className={`${imgClassName} transition-opacity duration-500`}
      />
    </div>
  )
}
