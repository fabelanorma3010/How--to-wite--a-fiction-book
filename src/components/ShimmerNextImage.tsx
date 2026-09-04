'use client'

import { useState } from 'react'
import Image, { type ImageProps } from 'next/image'

/**
 * next/image with the same shimmer-while-loading treatment as
 * src/components/library/ShimmerImage.tsx (reusing its `noir-shimmer` utility
 * from globals.css — a generic shimmer animation despite the name, already
 * used site-wide). For remote images (Supabase Storage avatars/covers, the
 * public profile page) where next/image has no blurDataURL to fall back to.
 */
export default function ShimmerNextImage({ className, ...props }: ImageProps) {
  const [loaded, setLoaded] = useState(false)

  return (
    <>
      {!loaded && <div aria-hidden="true" className="noir-shimmer absolute inset-0" />}
      <Image
        {...props}
        className={`${className ?? ''} transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
      />
    </>
  )
}
