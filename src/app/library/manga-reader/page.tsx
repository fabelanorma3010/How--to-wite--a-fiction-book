'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const panels = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCW8u3LHptbQoPDqcDLiXAMf-M-ODP40MEkQO33zdZj-_JulD2EZ0juQnA69qWZ0phkL_im5kjkmkeCQ5n0qxLdCk96w_RUmM9r6VUTwOrIHW2Dbz1MhbNEyfhX71hbVpcl_05cydYf7UxuCIF-HaKFfA2WJVt-1gMegLOGtlhXTV0B5_yD7zrmHwL03qkMCX0B2NTObvk344A-Ywq0Z7f7JmNx4pNTj3gCvY-Nz1FUnic63cU6ElPOtQ',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBbQKox2vav_y4Ywv5Ghu_5zmg1zTn4avUjU45cDlC82H0sntw8RNLuI75U2STp13fRHt-iA5IAhQuoTSNf5cdfTmTeASLW7uyniQqdFf6bTHnl6Mz5t6hFswEXMmPoXFq7kL16MfFLVzOBSAB9ocr2LiiNcuMOUhX2hIdpGgPtzvAx37ohNns0jpHkOm5Pc6okfXcxDdwwHCn5jJUGDXDR9d2e871qG2yizEfxmCnlregASM617gDcXg',
]

const bgOptions = ['#000000', '#131313', '#1e1e1e']

export default function MangaReaderPage() {
  const [uiVisible, setUiVisible] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [direction, setDirection] = useState<'vertical' | 'ltr'>('vertical')
  const [brightness, setBrightness] = useState(50)
  const [bg, setBg] = useState(bgOptions[0])
  const canvasRef = useRef<HTMLDivElement>(null)

  function handleCanvasClick(e: React.MouseEvent) {
    if (!canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    if (x > rect.width * 0.2 && x < rect.width * 0.8) {
      setUiVisible((v) => !v)
      setSettingsOpen(false)
    }
  }

  return (
    <div className="relative flex h-screen w-screen select-none flex-col overflow-hidden text-noir-on-surface">
      <div
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="hide-scrollbar absolute inset-0 flex cursor-pointer flex-col items-start justify-start overflow-y-auto"
        style={{ backgroundColor: bg, filter: `brightness(${0.5 + brightness / 100})` }}
      >
        <div className="mx-auto flex w-full max-w-screen-md flex-col items-center">
          {panels.map((src, i) => (
            <Image
              key={i}
              className="mb-[8px] w-full select-none object-contain pointer-events-none"
              alt={`Page ${i + 1}`}
              src={src}
              width={800}
              height={1200}
              sizes="768px"
              // This reader scrolls its own overflow-y-auto div rather than the
              // document, which native lazy-loading doesn't reliably observe —
              // and there are only 2 demo panels, so eager-loading both is cheap.
              priority
            />
          ))}
        </div>
      </div>

      <header
        className={`fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-noir-surface/80 backdrop-blur-xl transition-all duration-300 ${
          uiVisible ? '' : '-translate-y-full'
        }`}
      >
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-[16px]">
          <Link
            href="/library/book"
            className="flex items-center justify-center rounded-full p-2 text-noir-on-surface-variant transition-colors hover:bg-white/5 hover:text-noir-primary"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div className="pointer-events-none flex flex-col items-center justify-center">
            <span className="font-noir-mono text-[12px] uppercase tracking-widest text-noir-on-surface-variant">
              Chapter 42
            </span>
            <h1 className="max-w-[200px] truncate font-noir-display text-[16px] font-semibold text-noir-primary-container md:max-w-md">
              Echoes in the Void
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setSettingsOpen((v) => !v)
              }}
              className="flex items-center justify-center rounded-full p-2 text-noir-on-surface-variant transition-colors hover:bg-white/5 hover:text-noir-primary"
            >
              <span className="material-symbols-outlined">tune</span>
            </button>
            <button
              type="button"
              className="flex items-center justify-center rounded-full p-2 text-noir-on-surface-variant transition-colors hover:bg-white/5 hover:text-noir-primary"
            >
              <span className="material-symbols-outlined">bookmark_add</span>
            </button>
          </div>
        </div>
      </header>

      {settingsOpen && (
        <div className="fixed right-[16px] top-16 z-40 flex w-72 flex-col gap-[24px] rounded-[0.75rem] border border-white/10 bg-noir-surface-container-high p-[24px] shadow-2xl">
          <div className="flex flex-col gap-[8px]">
            <span className="font-noir-mono text-[12px] uppercase tracking-wide text-noir-on-surface-variant">
              Brightness
            </span>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-sm text-noir-on-surface-variant">brightness_low</span>
              <input
                type="range"
                min={0}
                max={100}
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="h-1 w-full cursor-pointer appearance-none rounded-full bg-noir-surface-container-highest accent-noir-primary-container"
              />
              <span className="material-symbols-outlined text-sm text-noir-on-surface-variant">brightness_high</span>
            </div>
          </div>

          <div className="flex flex-col gap-[8px]">
            <span className="font-noir-mono text-[12px] uppercase tracking-wide text-noir-on-surface-variant">
              Direction
            </span>
            <div className="flex rounded-[0.5rem] bg-noir-surface-container-highest p-1">
              <button
                type="button"
                onClick={() => setDirection('vertical')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-[0.375rem] py-2 text-sm transition-colors ${
                  direction === 'vertical'
                    ? 'border border-white/5 bg-noir-surface-container-low text-noir-primary-container'
                    : 'text-noir-on-surface-variant hover:text-noir-primary-container'
                }`}
              >
                <span className="material-symbols-outlined text-sm">arrow_downward</span>
                Vertical
              </button>
              <button
                type="button"
                onClick={() => setDirection('ltr')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-[0.375rem] py-2 text-sm transition-colors ${
                  direction === 'ltr'
                    ? 'border border-white/5 bg-noir-surface-container-low text-noir-primary-container'
                    : 'text-noir-on-surface-variant hover:text-noir-primary-container'
                }`}
              >
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                Left to Right
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-[8px]">
            <span className="font-noir-mono text-[12px] uppercase tracking-wide text-noir-on-surface-variant">
              Background
            </span>
            <div className="flex gap-3">
              {bgOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setBg(color)}
                  style={{ backgroundColor: color }}
                  className={`h-8 w-8 rounded-full border transition-colors ${
                    bg === color
                      ? 'border-2 border-noir-primary-container ring-2 ring-noir-primary-container/20'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div
        className={`fixed bottom-0 left-0 z-50 w-full border-t border-white/10 bg-noir-surface/90 p-[8px] px-[16px] backdrop-blur-xl transition-all duration-300 ${
          uiVisible ? '' : 'translate-y-full opacity-0'
        }`}
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <span className="font-noir-mono text-[12px] text-noir-on-surface-variant">Page 14</span>
            <span className="font-noir-mono text-[12px] text-noir-on-surface-variant">42</span>
          </div>
          <div className="group relative flex h-6 w-full cursor-pointer items-center">
            <div className="absolute h-1 w-full overflow-hidden rounded-full bg-noir-surface-container-highest">
              <div className="absolute left-0 top-0 h-full w-[33%] rounded-full bg-noir-secondary-container" />
            </div>
            <div className="absolute left-[33%] -ml-2 h-4 w-4 scale-75 rounded-full bg-noir-primary-container shadow-[0_0_10px_rgba(255,215,0,0.5)] transition-transform group-hover:scale-100" />
          </div>
          <div className="mt-1 flex items-center justify-between">
            <button type="button" className="flex items-center gap-2 p-2 text-noir-on-surface-variant transition-colors hover:text-noir-primary">
              <span className="material-symbols-outlined text-sm">skip_previous</span>
              <span className="hidden font-noir-mono text-[12px] md:inline">Prev Chapter</span>
            </button>
            <button type="button" className="flex items-center gap-2 p-2 text-noir-on-surface-variant transition-colors hover:text-noir-primary">
              <span className="hidden font-noir-mono text-[12px] md:inline">Next Chapter</span>
              <span className="material-symbols-outlined text-sm">skip_next</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
