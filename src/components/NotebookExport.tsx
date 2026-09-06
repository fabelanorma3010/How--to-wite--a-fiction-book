'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { exportNotebook, type NotebookFormat } from '../lib/notebookExport'

interface NotebookExportProps {
  text: string
  className?: string
}

export default function NotebookExport({ text, className = '' }: NotebookExportProps) {
  const t = useTranslations('NotebookExport')
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
    if (busy === format) return t('exporting')
    if (failed === format) return t('retry')
    return fallback
  }

  return (
    <>
      <button
        type="button"
        onClick={() => run('pdf')}
        disabled={disabled}
        title={t('pdfTitle')}
        className={className}
      >
        {label('pdf', `⬇ ${t('pdf')}`)}
      </button>
      <button
        type="button"
        onClick={() => run('docx')}
        disabled={disabled}
        title={t('docxTitle')}
        className={className}
      >
        {label('docx', `⬇ ${t('word')}`)}
      </button>
    </>
  )
}
