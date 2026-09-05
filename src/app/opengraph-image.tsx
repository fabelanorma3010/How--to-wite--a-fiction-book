import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Storyburst — How to Write & Publish a Fiction Book'

// Same 4 book types + emoji as src/data/bookTypes.ts, scattered like a hand of
// comic panels for the site-wide default social-share card. Next.js wires this
// up as og:image / twitter:image for every route under this segment that
// doesn't define its own opengraph-image.
const panels = [
  { emoji: '💥', rotate: -9, top: 34, left: 792, bg: '#fef3c7', border: '#f59e0b' },
  { emoji: '🌸', rotate: 7, top: 158, left: 958, bg: '#fce7f3', border: '#e879f9' },
  { emoji: '🎈', rotate: -5, top: 322, left: 806, bg: '#dbeafe', border: '#38bdf8' },
  { emoji: '🧸', rotate: 8, top: 428, left: 972, bg: '#ede9fe', border: '#a78bfa' },
]

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          background: '#fdf4ff',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -150,
            left: -110,
            width: 440,
            height: 440,
            borderRadius: 9999,
            display: 'flex',
            background: 'radial-gradient(circle, rgba(56,189,248,0.5), transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -180,
            right: 240,
            width: 480,
            height: 480,
            borderRadius: 9999,
            display: 'flex',
            background: 'radial-gradient(circle, rgba(251,191,36,0.4), transparent 70%)',
          }}
        />

        {panels.map((p, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: p.top,
              left: p.left,
              width: 140,
              height: 140,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 66,
              background: p.bg,
              border: `5px solid ${p.border}`,
              borderRadius: 22,
              boxShadow: '0 18px 32px rgba(30,27,75,0.28)',
              transform: `rotate(${p.rotate}deg)`,
            }}
          >
            {p.emoji}
          </div>
        ))}

        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 0 0 96px',
            width: 700,
            height: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 26 }}>📖</span>
            <span style={{ display: 'flex', fontSize: 24, fontWeight: 800, color: '#1e1b4b' }}>
              Storyburst
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              marginTop: 20,
              padding: '9px 20px',
              borderRadius: 9999,
              background: 'rgba(255,255,255,0.7)',
              border: '2px solid rgba(232,121,249,0.5)',
              color: '#701a75',
              fontSize: 19,
              fontWeight: 700,
              transform: 'rotate(-2deg)',
              alignSelf: 'flex-start',
            }}
          >
            ✨ Your creative launchpad for illustrated storytelling
          </div>

          <div
            style={{
              display: 'flex',
              marginTop: 26,
              fontSize: 44,
              fontWeight: 900,
              lineHeight: 1.15,
              color: '#1e1b4b',
            }}
          >
            How to Write &amp; Publish
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 2,
              fontSize: 44,
              fontWeight: 900,
              lineHeight: 1.15,
              color: '#c026d3',
            }}
          >
            a Fiction Book
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginTop: 22,
              fontSize: 21,
              fontWeight: 600,
              lineHeight: 1.45,
              color: '#463f6b',
            }}
          >
            <span style={{ display: 'flex' }}>Comics, manga, cartoons, and children&apos;s books —</span>
            <span style={{ display: 'flex' }}>get genre tips, punch up your script with a fun</span>
            <span style={{ display: 'flex' }}>action-text generator, spark illustration ideas,</span>
            <span style={{ display: 'flex' }}>and follow a clear path to publishing your finished</span>
            <span style={{ display: 'flex' }}>book.</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
