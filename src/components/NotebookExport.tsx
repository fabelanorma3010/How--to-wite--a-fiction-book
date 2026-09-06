'use client'

import { useState } from 'react'
import { exportNotebook, type NotebookFormat } from '../lib/notebookExport'

interface NotebookExportProps {
  text: string
  className?: string
}

export default function NotebookExport({ text, className = '' }: NotebookExportProps) {
  const [busy, setBusy] = useState<NotebookFormat | null>(null)
  const [failed, setFailed] = useState<NotebookFormat | null>(null)

  async function run(format: NotebookFormat) {
    setFailed(null)
    setBusy(format)
    try {
      await exportNotebook(text, format)
    } catch {
      setFailed(format)
    } finally {
      setBusy(null)
    }
  }

  const disabled = !text.trim() || busy !== null

  function label(format: NotebookFormat, fallback: string) {
    if (busy === format) return 'Exporting…'
    if (failed === format) return 'Try again'
    return fallback
  }

  return (
    <>
      <button
        type="button"
        onClick={() => run('pdf')}
        disabled={disabled}
        title="Save your notebook as a PDF"
        className={className}
      >
        {label('pdf', '⬇ PDF')}
      </button>
      <button
        type="button"
        onClick={() => run('docx')}
        disabled={disabled}
        title="Download your notebook as a Word document"
        className={className}
      >
        {label('docx', '⬇ Word')}
      </button>
    </>
  )
}
