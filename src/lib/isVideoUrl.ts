const VIDEO_EXTENSION = /\.(mp4|webm|mov)(\?|#|$)/i

/** Whether a stored page/panel/book-file URL points at a video rather than an image or document. */
export function isVideoUrl(url: string | null | undefined): boolean {
  return Boolean(url && VIDEO_EXTENSION.test(url))
}
