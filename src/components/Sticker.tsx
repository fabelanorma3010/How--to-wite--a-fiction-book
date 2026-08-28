interface StickerProps {
  emoji: string
  className?: string
}

export default function Sticker({ emoji, className = '' }: StickerProps) {
  return (
    <span
      aria-hidden="true"
      className={`animate-pop-in pointer-events-none absolute z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink/5 bg-white text-xl shadow-lg sm:h-14 sm:w-14 sm:text-2xl ${className}`}
    >
      {emoji}
    </span>
  )
}
