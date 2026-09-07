import type { CSSProperties } from 'react'
import type { BookFormat } from '../lib/books'

export interface BookFormatTheme {
  /** CSS var names, set up in library/layout.tsx via next/font/google. */
  displayFont: string
  bodyFont: string
  ink: string
  soft: string
  pageBg: string
  accent: string
  accentSoft: string
  pageBorder: string
  pageRadius: string
  pageShadow: string
  /** 'dots' (comic halftone) | 'screentone' (manga) | 'engraving' | 'flat' */
  illustTexture: 'dots' | 'screentone' | 'engraving' | 'flat'
  /** How the text under/around the picture is boxed. */
  captionStyle: 'balloon' | 'manga' | 'bubble' | 'big' | 'prose'
  grayscale: boolean
}

const comic: BookFormatTheme = {
  displayFont: 'var(--font-bangers)',
  bodyFont: 'var(--font-comic-neue)',
  ink: '#131313',
  soft: 'rgba(19,19,19,0.62)',
  pageBg: '#fdfcf6',
  accent: '#e0332f',
  accentSoft: '#f6c445',
  pageBorder: '4px solid #131313',
  pageRadius: '4px',
  pageShadow: '6px 6px 0 #131313',
  illustTexture: 'dots',
  captionStyle: 'balloon',
  grayscale: false,
}

const manga: BookFormatTheme = {
  displayFont: 'var(--font-dela-gothic)',
  bodyFont: 'var(--font-noto-jp)',
  ink: '#141414',
  soft: 'rgba(20,20,20,0.55)',
  pageBg: '#ffffff',
  accent: '#141414',
  accentSoft: '#dcdcd6',
  pageBorder: '2.5px solid #141414',
  pageRadius: '2px',
  pageShadow: '4px 4px 0 rgba(20,20,20,0.7)',
  illustTexture: 'screentone',
  captionStyle: 'manga',
  grayscale: true,
}

const cartoon: BookFormatTheme = {
  displayFont: 'var(--font-fredoka)',
  bodyFont: 'var(--font-quicksand)',
  ink: '#2b2b2b',
  soft: 'rgba(43,43,43,0.6)',
  pageBg: '#ffffff',
  accent: '#ff5d73',
  accentSoft: '#ffcd3c',
  pageBorder: '5px solid #2b2b2b',
  pageRadius: '26px',
  pageShadow: '0 10px 0 -2px #ffcd3c, 0 10px 24px rgba(43,43,43,0.25)',
  illustTexture: 'flat',
  captionStyle: 'bubble',
  grayscale: false,
}

const childrens: BookFormatTheme = {
  displayFont: 'var(--font-patrick-hand)',
  bodyFont: 'var(--font-quicksand)',
  ink: '#4a3b34',
  soft: 'rgba(74,59,52,0.6)',
  pageBg: '#fffdf9',
  accent: '#e08a8a',
  accentSoft: '#f6d186',
  pageBorder: '3px dashed #d9b98f',
  pageRadius: '36px',
  pageShadow: '0 10px 26px rgba(74,59,52,0.2)',
  illustTexture: 'flat',
  captionStyle: 'big',
  grayscale: false,
}

const chapterbook: BookFormatTheme = {
  displayFont: 'var(--font-fraunces)',
  bodyFont: 'var(--font-source-serif)',
  ink: '#2a2015',
  soft: 'rgba(42,32,21,0.62)',
  pageBg: '#fffdf7',
  accent: '#1f4d3d',
  accentSoft: '#a6742c',
  pageBorder: 'none',
  pageRadius: '3px',
  pageShadow: '0 1px 1px rgba(42,32,21,0.06), 0 16px 32px -8px rgba(42,32,21,0.28), 6px 0 0 -3px #e7d8b4, 6px 0 0 -2px #fffdf7',
  illustTexture: 'flat',
  captionStyle: 'prose',
  grayscale: false,
}

const THEMES: Record<string, BookFormatTheme> = { comic, manga, cartoon, childrens, chapterbook }

const FALLBACK = chapterbook

export function getBookFormatTheme(bookType: BookFormat | null | undefined): BookFormatTheme {
  return (bookType && THEMES[bookType]) || FALLBACK
}

/** A CSS background pattern standing in for halftone/screentone/engraving print textures. */
export function textureOverlayStyle(texture: BookFormatTheme['illustTexture'], ink: string): CSSProperties {
  if (texture === 'dots') {
    return { backgroundImage: `radial-gradient(circle, ${ink}29 1.6px, transparent 2px)`, backgroundSize: '11px 11px' }
  }
  if (texture === 'screentone') {
    return { backgroundImage: `radial-gradient(circle, ${ink}59 1.3px, transparent 1.6px)`, backgroundSize: '6px 6px' }
  }
  if (texture === 'engraving') {
    return {
      backgroundImage: `repeating-linear-gradient(100deg, ${ink}38 0 0.7px, transparent 0.7px 3px)`,
      mixBlendMode: 'multiply',
    }
  }
  return {}
}
