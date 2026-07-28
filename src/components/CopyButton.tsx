import { useState } from 'react'

interface CopyButtonProps {
  text: string
  disabled?: boolean
}

export default function CopyButton({ text, disabled }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={disabled}
      className="rounded-full border-2 border-ink/15 bg-white/80 px-4 py-2 text-sm font-bold text-ink/70 transition-colors hover:border-ink/30 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
    >
      {copied ? 'Copied! ✅' : 'Copy 📋'}
    </button>
  )
}
