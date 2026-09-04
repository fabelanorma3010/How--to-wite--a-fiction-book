import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Storyburst — How to Write & Publish a Fiction Book'

// Site-wide default social-share card. Next.js wires this up as og:image /
// twitter:image for every route under this segment that doesn't define its
// own opengraph-image.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px 96px',
          background: '#fdf4ff',
          backgroundImage:
            'radial-gradient(circle at 8% 12%, rgba(56,189,248,0.35), transparent 42%), radial-gradient(circle at 96% 88%, rgba(251,191,36,0.35), transparent 42%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            fontSize: 40,
            fontWeight: 800,
            color: '#1e1b4b',
          }}
        >
          <span>📖</span>
          <span>Storyburst</span>
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 36,
            fontSize: 60,
            fontWeight: 800,
            lineHeight: 1.15,
            color: '#1e1b4b',
            maxWidth: 920,
          }}
        >
          How to write &amp; publish a fiction book
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 28,
            fontSize: 28,
            fontWeight: 500,
            color: '#5b5680',
            maxWidth: 820,
          }}
        >
          A free quiz, story generators, an auto-saving notebook, and a step-by-step publishing
          guide for comics, manga, cartoons, and children's books.
        </div>
      </div>
    ),
    { ...size },
  )
}
