// Client-side procedural art generator: pure canvas drawing, no AI calls and
// no cost. Every category below draws directly from a seeded RNG so the same
// seed always reproduces the same picture.

export const ART_CATEGORIES = [
  'shapes',
  'comic',
  'person',
  'superhero',
  'animal',
  'cartoonCharacter',
  'redHairedWoman',
  'ninja',
  'angel',
] as const

export type ArtCategory = (typeof ART_CATEGORIES)[number]

const SIZE = 256
const DEG = Math.PI / 180

type Rng = () => number
type Pt = [number, number]

function mulberry32(seed: number): Rng {
  let a = seed >>> 0
  return function rng() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function randInt(rng: Rng, lo: number, hi: number): number {
  return Math.floor(rng() * (hi - lo + 1)) + lo
}
function randFloat(rng: Rng, lo: number, hi: number): number {
  return rng() * (hi - lo) + lo
}
function pick<T>(rng: Rng, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}
function sortedPair(a: number, b: number): [number, number] {
  return a <= b ? [a, b] : [b, a]
}
function rgb(rng: Rng, lo = 30, hi = 255): string {
  return `rgb(${randInt(rng, lo, hi)}, ${randInt(rng, lo, hi)}, ${randInt(rng, lo, hi)})`
}
function rgbaByte(rng: Rng, alphaByte: number, lo = 30, hi = 255): string {
  return `rgba(${randInt(rng, lo, hi)}, ${randInt(rng, lo, hi)}, ${randInt(rng, lo, hi)}, ${(alphaByte / 255).toFixed(3)})`
}

function ellipseFill(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, fill: string) {
  const cx = (x0 + x1) / 2
  const cy = (y0 + y1) / 2
  const rx = Math.max(Math.abs(x1 - x0) / 2, 0.01)
  const ry = Math.max(Math.abs(y1 - y0) / 2, 0.01)
  ctx.beginPath()
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
  ctx.fillStyle = fill
  ctx.fill()
}
function ellipseStroke(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  stroke: string,
  width: number,
) {
  const cx = (x0 + x1) / 2
  const cy = (y0 + y1) / 2
  const rx = Math.max(Math.abs(x1 - x0) / 2, 0.01)
  const ry = Math.max(Math.abs(y1 - y0) / 2, 0.01)
  ctx.beginPath()
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
  ctx.strokeStyle = stroke
  ctx.lineWidth = width
  ctx.stroke()
}
function rectFill(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, fill: string) {
  const [xa, xb] = sortedPair(x0, x1)
  const [ya, yb] = sortedPair(y0, y1)
  ctx.fillStyle = fill
  ctx.fillRect(xa, ya, xb - xa, yb - ya)
}
function roundedRectFill(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  radius: number,
  fill: string,
) {
  const [x, x2] = sortedPair(x0, x1)
  const [y, y2] = sortedPair(y0, y1)
  const w = x2 - x
  const h = y2 - y
  const r = Math.max(Math.min(radius, w / 2, h / 2), 0)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
  ctx.fillStyle = fill
  ctx.fill()
}
function polygonFill(ctx: CanvasRenderingContext2D, pts: Pt[], fill: string) {
  ctx.beginPath()
  ctx.moveTo(pts[0][0], pts[0][1])
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1])
  ctx.closePath()
  ctx.fillStyle = fill
  ctx.fill()
}
function lineStroke(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  stroke: string,
  width: number,
) {
  ctx.beginPath()
  ctx.moveTo(x0, y0)
  ctx.lineTo(x1, y1)
  ctx.strokeStyle = stroke
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.stroke()
}
function arcStroke(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  startDeg: number,
  endDeg: number,
  stroke: string,
  width: number,
) {
  const cx = (x0 + x1) / 2
  const cy = (y0 + y1) / 2
  const rx = Math.abs(x1 - x0) / 2
  const ry = Math.abs(y1 - y0) / 2
  ctx.beginPath()
  ctx.ellipse(cx, cy, rx, ry, 0, startDeg * DEG, endDeg * DEG)
  ctx.strokeStyle = stroke
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.stroke()
}
function pieSliceFill(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  startDeg: number,
  endDeg: number,
  fill: string,
) {
  const cx = (x0 + x1) / 2
  const cy = (y0 + y1) / 2
  const rx = Math.abs(x1 - x0) / 2
  const ry = Math.abs(y1 - y0) / 2
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.ellipse(cx, cy, rx, ry, 0, startDeg * DEG, endDeg * DEG)
  ctx.closePath()
  ctx.fillStyle = fill
  ctx.fill()
}

// ---------- shapes ----------
function drawShapes(ctx: CanvasRenderingContext2D, rng: Rng) {
  rectFill(ctx, 0, 0, SIZE, SIZE, rgb(rng))
  const n = randInt(rng, 4, 10)
  for (let i = 0; i < n; i++) {
    const kind = pick(rng, ['circle', 'rect', 'triangle', 'line'] as const)
    const color = rgbaByte(rng, randInt(rng, 120, 255))
    if (kind === 'circle') {
      const x = randInt(rng, 0, SIZE)
      const y = randInt(rng, 0, SIZE)
      const r = randInt(rng, 10, 100)
      ellipseFill(ctx, x - r, y - r, x + r, y + r, color)
    } else if (kind === 'rect') {
      rectFill(ctx, randInt(rng, 0, SIZE), randInt(rng, 0, SIZE), randInt(rng, 0, SIZE), randInt(rng, 0, SIZE), color)
    } else if (kind === 'triangle') {
      const pts: Pt[] = [0, 0, 0].map(() => [randInt(rng, 0, SIZE), randInt(rng, 0, SIZE)])
      polygonFill(ctx, pts, color)
    } else {
      lineStroke(
        ctx,
        randInt(rng, 0, SIZE),
        randInt(rng, 0, SIZE),
        randInt(rng, 0, SIZE),
        randInt(rng, 0, SIZE),
        color,
        randInt(rng, 2, 10),
      )
    }
  }
}

// ---------- comic ----------
function addHalftone(ctx: CanvasRenderingContext2D, rng: Rng, gap = 10, maxR = 3) {
  for (let y = 0; y < SIZE; y += gap) {
    for (let x = 0; x < SIZE; x += gap) {
      const r = randFloat(rng, 0.5, maxR)
      ellipseFill(ctx, x - r, y - r, x + r, y + r, 'rgba(0, 0, 0, 0.235)')
    }
  }
}

function drawComic(ctx: CanvasRenderingContext2D, rng: Rng) {
  rectFill(ctx, 0, 0, SIZE, SIZE, rgb(rng, 60, 255))
  const outline = 'rgb(10, 10, 10)'
  const n = randInt(rng, 4, 8)
  for (let i = 0; i < n; i++) {
    const kind = pick(rng, ['circle', 'rect', 'triangle', 'burst'] as const)
    const color = rgb(rng, 60, 255)
    const width = randInt(rng, 3, 6)
    if (kind === 'circle') {
      const x = randInt(rng, 0, SIZE)
      const y = randInt(rng, 0, SIZE)
      const r = randInt(rng, 20, 90)
      ellipseFill(ctx, x - r, y - r, x + r, y + r, color)
      ellipseStroke(ctx, x - r, y - r, x + r, y + r, outline, width)
    } else if (kind === 'rect') {
      const x0 = randInt(rng, 0, SIZE)
      const x1 = randInt(rng, 0, SIZE)
      const y0 = randInt(rng, 0, SIZE)
      const y1 = randInt(rng, 0, SIZE)
      rectFill(ctx, x0, y0, x1, y1, color)
      const [xa, xb] = sortedPair(x0, x1)
      const [ya, yb] = sortedPair(y0, y1)
      ctx.strokeStyle = outline
      ctx.lineWidth = width
      ctx.strokeRect(xa, ya, xb - xa, yb - ya)
    } else if (kind === 'triangle') {
      const pts: Pt[] = [0, 0, 0].map(() => [randInt(rng, 0, SIZE), randInt(rng, 0, SIZE)])
      polygonFill(ctx, pts, color)
      polygonStroke(ctx, pts, outline, width)
    } else {
      const cx = randInt(rng, 60, SIZE - 60)
      const cy = randInt(rng, 60, SIZE - 60)
      const spikes = randInt(rng, 8, 14)
      const outer = randInt(rng, 40, 70)
      const inner = randInt(rng, 15, 30)
      const pts: Pt[] = []
      for (let k = 0; k < spikes * 2; k++) {
        const ang = (k * Math.PI) / spikes
        const r = k % 2 === 0 ? outer : inner
        pts.push([cx + r * Math.cos(ang), cy + r * Math.sin(ang)])
      }
      polygonFill(ctx, pts, color)
      polygonStroke(ctx, pts, outline, width)
    }
  }
  addHalftone(ctx, rng)
}

function polygonStroke(ctx: CanvasRenderingContext2D, pts: Pt[], stroke: string, width: number) {
  ctx.beginPath()
  ctx.moveTo(pts[0][0], pts[0][1])
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1])
  ctx.closePath()
  ctx.strokeStyle = stroke
  ctx.lineWidth = width
  ctx.stroke()
}

// ---------- cartoon person ----------
function drawPerson(ctx: CanvasRenderingContext2D, rng: Rng) {
  rectFill(ctx, 0, 0, SIZE, SIZE, rgb(rng))
  const cx = SIZE / 2 + randInt(rng, -15, 15)
  const skin = rgb(rng)
  const shirt = rgb(rng)
  const pants = rgb(rng)
  const hair = rgb(rng)
  const hipY = 195
  const torsoW = randInt(rng, 50, 70)
  const torsoH = randInt(rng, 60, 80)
  const shoulderY = hipY - torsoH

  for (const side of [-1, 1]) {
    const angle = randFloat(rng, -0.35, 0.35)
    const x1 = cx + side * randInt(rng, 10, 20)
    const y1 = hipY
    lineStroke(ctx, x1, y1, x1 + 60 * Math.sin(angle) * side, y1 + 60 * Math.cos(angle), pants, 14)
  }
  for (const side of [-1, 1]) {
    const angle = randFloat(rng, 0.15, 1.3)
    const x1 = cx + side * (torsoW / 2)
    const y1 = shoulderY + 10
    lineStroke(ctx, x1, y1, x1 + side * 60 * Math.sin(angle), y1 + 60 * Math.cos(angle), skin, 12)
  }
  roundedRectFill(ctx, cx - torsoW / 2, shoulderY, cx + torsoW / 2, hipY, 16, shirt)

  const headR = randInt(rng, 26, 38)
  const headCy = shoulderY - headR - 4
  ellipseFill(ctx, cx - headR, headCy - headR, cx + headR, headCy + headR, skin)

  const style = pick(rng, ['cap', 'round', 'spiky', 'bald'] as const)
  if (style === 'cap') {
    pieSliceFill(ctx, cx - headR, headCy - headR, cx + headR, headCy + headR, 180, 360, hair)
  } else if (style === 'round') {
    ellipseFill(ctx, cx - headR - 4, headCy - headR - 8, cx + headR + 4, headCy + headR * 0.2, hair)
    ellipseFill(ctx, cx - headR, headCy - headR, cx + headR, headCy + headR, skin)
  } else if (style === 'spiky') {
    for (let i = 0; i < 6; i++) {
      const sx = cx - headR + i * Math.floor((2 * headR) / 5)
      polygonFill(
        ctx,
        [
          [sx, headCy - headR],
          [sx + 8, headCy - headR - randInt(rng, 10, 22)],
          [sx + 16, headCy - headR],
        ],
        hair,
      )
    }
  }

  const eyeOff = headR * 0.4
  const eyeY = headCy - headR * 0.05
  for (const side of [-1, 1]) {
    const ex = cx + side * eyeOff
    ellipseFill(ctx, ex - 3, eyeY - 3, ex + 3, eyeY + 3, 'rgb(20, 20, 20)')
  }
  const mw = headR * 0.5
  arcStroke(ctx, cx - mw, headCy + headR * 0.1, cx + mw, headCy + headR * 0.7, 15, 165, 'rgb(20, 20, 20)', 3)
}

// ---------- superhero ----------
function drawEmblem(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  kind: 'star' | 'bolt' | 'diamond' | 'ring',
  color: string,
  size: number,
) {
  if (kind === 'star') {
    const pts: Pt[] = []
    for (let i = 0; i < 10; i++) {
      const ang = (i * Math.PI) / 5 - Math.PI / 2
      const r = i % 2 === 0 ? size : size * 0.4
      pts.push([cx + r * Math.cos(ang), cy + r * Math.sin(ang)])
    }
    polygonFill(ctx, pts, color)
  } else if (kind === 'bolt') {
    polygonFill(
      ctx,
      [
        [cx - size * 0.2, cy - size],
        [cx + size * 0.3, cy - size],
        [cx - size * 0.1, cy],
        [cx + size * 0.25, cy],
        [cx - size * 0.3, cy + size],
        [cx + size * 0.05, cy + size * 0.1],
        [cx - size * 0.35, cy + size * 0.1],
      ],
      color,
    )
  } else if (kind === 'diamond') {
    polygonFill(
      ctx,
      [
        [cx, cy - size],
        [cx + size, cy],
        [cx, cy + size],
        [cx - size, cy],
      ],
      color,
    )
  } else {
    ellipseFill(ctx, cx - size, cy - size, cx + size, cy + size, color)
  }
}

function drawSuperhero(ctx: CanvasRenderingContext2D, rng: Rng) {
  rectFill(ctx, 0, 0, SIZE, SIZE, rgb(rng, 150, 230))
  const cx = SIZE / 2
  const suit = rgb(rng)
  const accent = rgb(rng, 180)
  const skin = rgb(rng, 120, 220)
  const hipY = 200
  const torsoW = randInt(rng, 55, 70)
  const torsoH = randInt(rng, 65, 80)
  const shoulderY = hipY - torsoH

  const flutter = randInt(rng, -35, 35)
  polygonFill(
    ctx,
    [
      [cx - torsoW / 2 - 6, shoulderY + 5],
      [cx + torsoW / 2 + 6, shoulderY + 5],
      [cx + torsoW / 2 + 14 + flutter, hipY + 55],
      [cx + flutter / 2, hipY + 70],
      [cx - torsoW / 2 - 14 + flutter, hipY + 55],
    ],
    accent,
  )

  for (const side of [-1, 1]) {
    const angle = side * randFloat(rng, 0.3, 0.55)
    const x1 = cx + side * randInt(rng, 8, 16)
    const y1 = hipY
    lineStroke(ctx, x1, y1, x1 + 60 * Math.sin(angle), y1 + 60 * Math.cos(angle), suit, 15)
  }

  roundedRectFill(ctx, cx - torsoW / 2, shoulderY, cx + torsoW / 2, hipY, 14, suit)
  drawEmblem(ctx, cx, shoulderY + torsoH * 0.4, pick(rng, ['star', 'bolt', 'diamond', 'ring'] as const), accent, randInt(rng, 14, 20))

  const upSide = pick(rng, [-1, 1])
  for (const side of [-1, 1]) {
    const angle = side === upSide ? Math.PI - randFloat(rng, 0.05, 0.25) : side * randFloat(rng, 1.1, 1.4)
    const x1 = cx + side * (torsoW / 2)
    const y1 = shoulderY + 10
    const x2 = x1 + 60 * Math.sin(angle)
    const y2 = y1 + 60 * Math.cos(angle)
    lineStroke(ctx, x1, y1, x2, y2, suit, 13)
    ellipseFill(ctx, x2 - 8, y2 - 8, x2 + 8, y2 + 8, skin)
  }

  const headR = randInt(rng, 26, 36)
  const headCy = shoulderY - headR - 4
  ellipseFill(ctx, cx - headR, headCy - headR, cx + headR, headCy + headR, skin)
  const eyeY = headCy - headR * 0.05
  roundedRectFill(ctx, cx - headR + 3, eyeY - 7, cx + headR - 3, eyeY + 7, 6, accent)
  for (const side of [-1, 1]) {
    const ex = cx + side * headR * 0.4
    ellipseFill(ctx, ex - 3, eyeY - 3, ex + 3, eyeY + 3, 'rgb(255, 255, 255)')
  }
  arcStroke(ctx, cx - 12, headCy + headR * 0.15, cx + 12, headCy + headR * 0.7, 15, 165, 'rgb(20, 20, 20)', 3)
}

// ---------- animal ----------
function drawAnimal(ctx: CanvasRenderingContext2D, rng: Rng) {
  rectFill(ctx, 0, 0, SIZE, SIZE, rgb(rng, 170, 240))
  const cx = SIZE / 2
  const bodyCy = 170
  const fur = rgb(rng, 60, 230)
  const belly = rgb(rng, 180, 255)
  const accent = rgb(rng, 40, 200)
  const bodyW = randInt(rng, 70, 95)
  const bodyH = randInt(rng, 50, 65)

  const tailStyle = pick(rng, ['straight', 'curly', 'bushy'] as const)
  const tx = cx - bodyW / 2 - 5
  const ty = bodyCy
  if (tailStyle === 'straight') {
    lineStroke(ctx, tx, ty, tx - 30, ty - randInt(rng, 10, 30), fur, 10)
  } else if (tailStyle === 'curly') {
    arcStroke(ctx, tx - 45, ty - 45, tx + 5, ty + 5, 0, 270, fur, 9)
  } else {
    polygonFill(
      ctx,
      [
        [tx, ty - 10],
        [tx - 35, ty - 30],
        [tx - 20, ty + 15],
      ],
      fur,
    )
  }

  for (const lx of [-bodyW / 3, -bodyW / 6 + 4, bodyW / 6 - 4, bodyW / 3]) {
    roundedRectFill(ctx, cx + lx - 7, bodyCy + bodyH / 2 - 5, cx + lx + 7, bodyCy + bodyH / 2 + 28, 5, fur)
  }

  ellipseFill(ctx, cx - bodyW / 2, bodyCy - bodyH / 2, cx + bodyW / 2, bodyCy + bodyH / 2, fur)
  ellipseFill(ctx, cx - bodyW / 3, bodyCy - bodyH / 4, cx + bodyW / 3, bodyCy + bodyH / 2, belly)

  const headR = randInt(rng, 34, 46)
  const headCy = bodyCy - bodyH / 2 - headR + 14
  const earStyle = pick(rng, ['round', 'pointy', 'floppy'] as const)
  for (const side of [-1, 1]) {
    const ex = cx + side * headR * 0.7
    const ey = headCy - headR * 0.7
    if (earStyle === 'round') {
      ellipseFill(ctx, ex - 14, ey - 14, ex + 14, ey + 14, fur)
    } else if (earStyle === 'pointy') {
      polygonFill(
        ctx,
        [
          [ex - 12, ey + 14],
          [ex, ey - 22],
          [ex + 12, ey + 14],
        ],
        fur,
      )
    } else {
      ellipseFill(ctx, ex - 10, ey - 4, ex + 10, ey + 34, fur)
    }
  }
  ellipseFill(ctx, cx - headR, headCy - headR, cx + headR, headCy + headR, fur)

  const eyeY = headCy - headR * 0.05
  for (const side of [-1, 1]) {
    const ex = cx + side * headR * 0.38
    ellipseFill(ctx, ex - 6, eyeY - 6, ex + 6, eyeY + 6, 'rgb(255, 255, 255)')
    ellipseFill(ctx, ex - 3, eyeY - 3, ex + 3, eyeY + 3, 'rgb(20, 20, 20)')
  }
  const noseY = eyeY + headR * 0.35
  polygonFill(
    ctx,
    [
      [cx - 6, noseY],
      [cx + 6, noseY],
      [cx, noseY + 8],
    ],
    accent,
  )
  for (const side of [-1, 1]) {
    for (const w of [-1, 0, 1]) {
      lineStroke(ctx, cx + side * 8, noseY + 4 + w * 4, cx + side * 30, noseY + w * 6, 'rgb(90, 90, 90)', 1)
    }
  }
}

// ---------- cartoon character (chibi) ----------
function drawCartoonCharacter(ctx: CanvasRenderingContext2D, rng: Rng) {
  rectFill(ctx, 0, 0, SIZE, SIZE, rgb(rng, 170, 250))
  const cx = SIZE / 2
  const skin = rgb(rng, 120, 255)
  const outfit = rgb(rng)
  const hair = rgb(rng)
  const accent = rgb(rng, 200)

  const headR = randInt(rng, 58, 74)
  const headCy = 105
  const bodyTop = headCy + headR - 12
  const bodyW = randInt(rng, 55, 70)
  const bodyH = randInt(rng, 45, 58)

  for (const side of [-1, 1]) {
    const ax = cx + side * (bodyW / 2)
    const ay = bodyTop + 12
    lineStroke(ctx, ax, ay, ax + side * 18, ay + 22, skin, 11)
  }
  for (const side of [-1, 1]) {
    const lx = cx + side * (bodyW / 4)
    lineStroke(ctx, lx, bodyTop + bodyH, lx, bodyTop + bodyH + 26, outfit, 13)
  }

  roundedRectFill(ctx, cx - bodyW / 2, bodyTop, cx + bodyW / 2, bodyTop + bodyH, 18, outfit)
  if (rng() < 0.4) {
    polygonFill(
      ctx,
      [
        [cx - 12, bodyTop - 2],
        [cx, bodyTop + 8],
        [cx - 12, bodyTop + 18],
      ],
      accent,
    )
    polygonFill(
      ctx,
      [
        [cx + 12, bodyTop - 2],
        [cx, bodyTop + 8],
        [cx + 12, bodyTop + 18],
      ],
      accent,
    )
  }

  ellipseFill(ctx, cx - headR, headCy - headR, cx + headR, headCy + headR, skin)

  for (const side of [-1, 1]) {
    const bx = cx + side * headR * 0.55
    const by = headCy + headR * 0.25
    ellipseFill(ctx, bx - 12, by - 8, bx + 12, by + 8, 'rgba(255, 90, 120, 0.35)')
  }

  const eyeOff = headR * 0.42
  const eyeY = headCy - headR * 0.05
  const eyeR = randInt(rng, 14, 20)
  for (const side of [-1, 1]) {
    const ex = cx + side * eyeOff
    ellipseFill(ctx, ex - eyeR, eyeY - eyeR, ex + eyeR, eyeY + eyeR, 'rgb(255, 255, 255)')
    const pr = eyeR * 0.6
    const px = ex + side * 2
    const py = eyeY + 2
    ellipseFill(ctx, px - pr, py - pr, px + pr, py + pr, 'rgb(25, 20, 20)')
    ellipseFill(ctx, px - pr * 0.4 + 3, py - pr * 0.6, px + pr * 0.2 + 3, py - pr * 0.1, 'rgb(255, 255, 255)')
  }

  const mood = pick(rng, ['happy', 'surprised', 'sly'] as const)
  const browY = eyeY - eyeR - 10
  for (const side of [-1, 1]) {
    const ex = cx + side * eyeOff
    const tilt = mood === 'sly' ? (side === 1 ? 6 : -6) : 0
    lineStroke(ctx, ex - 12, browY + tilt, ex + 12, browY - tilt, 'rgb(60, 40, 30)', 4)
  }

  const mouthY = headCy + headR * 0.45
  const mstyle = pick(rng, ['smile', 'grin', 'o', 'smirk'] as const)
  if (mstyle === 'smile') {
    arcStroke(ctx, cx - 22, mouthY - 16, cx + 22, mouthY + 16, 20, 160, 'rgb(90, 30, 30)', 4)
  } else if (mstyle === 'grin') {
    pieSliceFill(ctx, cx - 24, mouthY - 10, cx + 24, mouthY + 22, 20, 160, 'rgb(120, 30, 40)')
    pieSliceFill(ctx, cx - 12, mouthY - 2, cx + 12, mouthY + 14, 20, 160, 'rgb(255, 90, 110)')
  } else if (mstyle === 'o') {
    ellipseFill(ctx, cx - 12, mouthY - 12, cx + 12, mouthY + 12, 'rgb(120, 30, 40)')
  } else {
    lineStroke(ctx, cx - 15, mouthY + 6, cx + 18, mouthY - 4, 'rgb(90, 30, 30)', 4)
  }

  const hairStyle = pick(rng, ['spiky', 'pigtails', 'mohawk', 'swoop'] as const)
  if (hairStyle === 'spiky') {
    const n = 7
    for (let i = 0; i < n; i++) {
      const sx = cx - headR + i * ((2 * headR) / (n - 1))
      const h = randInt(rng, 18, 38)
      polygonFill(
        ctx,
        [
          [sx - 10, headCy - headR + 8],
          [sx, headCy - headR - h],
          [sx + 10, headCy - headR + 8],
        ],
        hair,
      )
    }
  } else if (hairStyle === 'pigtails') {
    for (const side of [-1, 1]) {
      const hx = cx + side * headR * 0.95
      ellipseFill(ctx, hx - 16, headCy - 16, hx + 16, headCy + 16, hair)
    }
    pieSliceFill(ctx, cx - headR, headCy - headR, cx + headR, headCy + headR, 180, 360, hair)
  } else if (hairStyle === 'mohawk') {
    polygonFill(
      ctx,
      [
        [cx - 10, headCy - headR + 10],
        [cx, headCy - headR - 45],
        [cx + 10, headCy - headR + 10],
      ],
      hair,
    )
  } else {
    pieSliceFill(ctx, cx - headR, headCy - headR - 10, cx + headR, headCy + headR * 0.3, 200, 340, hair)
  }

  if (rng() < 0.3) {
    for (const side of [-1, 1]) {
      const ex = cx + side * eyeOff
      ellipseStroke(ctx, ex - eyeR - 5, eyeY - eyeR - 5, ex + eyeR + 5, eyeY + eyeR + 5, 'rgb(20, 20, 20)', 4)
    }
    lineStroke(ctx, cx - 6, eyeY, cx + 6, eyeY, 'rgb(20, 20, 20)', 4)
  }
}

// ---------- shared humanoid skeleton (woman / angel) ----------
const SKIN_TONES = [
  'rgb(255, 224, 189)',
  'rgb(240, 200, 160)',
  'rgb(198, 143, 100)',
  'rgb(141, 92, 60)',
  'rgb(255, 205, 148)',
]
const RED_HAIR = 'rgb(178, 58, 40)'

function baseBody(
  ctx: CanvasRenderingContext2D,
  rng: Rng,
  cx: number,
  skin: string,
  hipY: number,
  torsoW: number,
  torsoH: number,
): number {
  const shoulderY = hipY - torsoH
  for (const side of [-1, 1]) {
    const angle = side * randFloat(rng, 0.1, 0.3)
    const x1 = cx + side * 10
    const y1 = hipY
    lineStroke(ctx, x1, y1, x1 + 50 * Math.sin(angle), y1 + 50 * Math.cos(angle), skin, 13)
  }
  for (const side of [-1, 1]) {
    const angle = side * randFloat(rng, 0.25, 0.6)
    const x1 = cx + side * (torsoW / 2)
    const y1 = shoulderY + 12
    lineStroke(ctx, x1, y1, x1 + side * 60 * Math.sin(angle), y1 + 60 * Math.cos(angle), skin, 11)
  }
  return shoulderY
}

function simpleFace(
  ctx: CanvasRenderingContext2D,
  cx: number,
  headCy: number,
  headR: number,
  mood: 'soft' | 'gentle',
) {
  const eyeOff = headR * 0.4
  const eyeY = headCy - headR * 0.02
  for (const side of [-1, 1]) {
    const ex = cx + side * eyeOff
    if (mood === 'gentle') {
      arcStroke(ctx, ex - 6, eyeY - 4, ex + 6, eyeY + 6, 10, 170, 'rgb(30, 20, 20)', 2)
    } else {
      ellipseFill(ctx, ex - 4, eyeY - 4, ex + 4, eyeY + 4, 'rgb(25, 20, 20)')
    }
  }
  const mw = headR * 0.4
  arcStroke(ctx, cx - mw, headCy + headR * 0.25, cx + mw, headCy + headR * 0.75, 15, 165, 'rgb(120, 40, 40)', 3)
}

// ---------- woman with red hair, white dress ----------
function drawRedHairedWoman(ctx: CanvasRenderingContext2D, rng: Rng) {
  rectFill(ctx, 0, 0, SIZE, SIZE, rgb(rng, 170, 240))
  const cx = SIZE / 2
  const skin = pick(rng, SKIN_TONES)
  const dress = `rgb(${randInt(rng, 235, 255)}, ${randInt(rng, 235, 255)}, ${randInt(rng, 240, 255)})`
  const accent = rgb(rng, 150, 230)

  const hipY = 202
  const torsoW = 58
  const torsoH = 70
  const hemY = hipY + 62
  const hemW = torsoW + 55
  const shoulderY = hipY - torsoH

  polygonFill(
    ctx,
    [
      [cx - torsoW / 2, shoulderY],
      [cx + torsoW / 2, shoulderY],
      [cx + hemW / 2, hemY],
      [cx - hemW / 2, hemY],
    ],
    dress,
  )
  lineStroke(ctx, cx - torsoW / 2, hipY - 8, cx + torsoW / 2, hipY - 8, accent, 4)

  baseBody(ctx, rng, cx, skin, hipY, torsoW, torsoH)
  rectFill(ctx, cx - torsoW / 2, shoulderY, cx + torsoW / 2, hipY, dress)

  const headR = randInt(rng, 28, 36)
  const headCy = shoulderY - headR - 4
  ellipseFill(ctx, cx - headR - 5, headCy - headR - 10, cx + headR + 5, headCy + headR * 0.3, RED_HAIR)
  const strandW = headR * 0.5
  for (const side of [-1, 1]) {
    const sx = cx + side * headR * 0.95
    ellipseFill(ctx, sx - strandW / 2, headCy, sx + strandW / 2, headCy + headR * 2.2, RED_HAIR)
  }
  ellipseFill(ctx, cx - headR, headCy - headR, cx + headR, headCy + headR, skin)

  simpleFace(ctx, cx, headCy, headR, 'soft')
}

// ---------- ninja ----------
function drawNinja(ctx: CanvasRenderingContext2D, rng: Rng) {
  rectFill(ctx, 0, 0, SIZE, SIZE, rgb(rng, 60, 160))
  const cx = SIZE / 2
  const suit = pick(rng, ['rgb(25, 25, 30)', 'rgb(35, 30, 45)', 'rgb(20, 35, 30)'])
  const band = rgb(rng, 150, 230)

  const hipY = 200
  const torsoW = 58
  const torsoH = 72
  const shoulderY = hipY - torsoH

  for (const side of [-1, 1]) {
    const angle = side * randFloat(rng, 0.3, 0.5)
    const x1 = cx + side * 12
    const y1 = hipY
    lineStroke(ctx, x1, y1, x1 + 55 * Math.sin(angle), y1 + 55 * Math.cos(angle), suit, 15)
  }

  roundedRectFill(ctx, cx - torsoW / 2, shoulderY, cx + torsoW / 2, hipY, 10, suit)
  lineStroke(ctx, cx - torsoW / 2, hipY - 10, cx + torsoW / 2, hipY - 10, band, 5)

  const weapon = pick(rng, ['star', 'sword'] as const)
  const actionSide = pick(rng, [-1, 1])
  for (const side of [-1, 1]) {
    const angle = side === actionSide ? Math.PI - 0.2 : side * 1.15
    const x1 = cx + side * (torsoW / 2)
    const y1 = shoulderY + 10
    const x2 = x1 + side * 58 * Math.sin(angle)
    const y2 = y1 + 58 * Math.cos(angle)
    lineStroke(ctx, x1, y1, x2, y2, suit, 12)
    if (side === actionSide) {
      if (weapon === 'star') {
        const pts: Pt[] = []
        for (let i = 0; i < 8; i++) {
          const a = (i * Math.PI) / 4
          const r = i % 2 === 0 ? 14 : 6
          pts.push([x2 + r * Math.cos(a), y2 + r * Math.sin(a)])
        }
        polygonFill(ctx, pts, 'rgb(210, 210, 220)')
      } else {
        lineStroke(ctx, x2, y2, x2 + side * 10, y2 - 45, 'rgb(210, 210, 220)', 5)
      }
    }
  }

  const headR = randInt(rng, 26, 34)
  const headCy = shoulderY - headR - 4
  ellipseFill(ctx, cx - headR, headCy - headR, cx + headR, headCy + headR, suit)
  const eyeY = headCy - headR * 0.05
  rectFill(ctx, cx - headR + 4, eyeY - 8, cx + headR - 4, eyeY + 8, 'rgb(230, 220, 200)')
  for (const side of [-1, 1]) {
    const ex = cx + side * headR * 0.35
    ellipseFill(ctx, ex - 3, eyeY - 3, ex + 3, eyeY + 3, 'rgb(20, 20, 20)')
  }
  rectFill(ctx, cx - headR - 2, eyeY - 16, cx + headR + 2, eyeY - 8, band)
  const tailSide = pick(rng, [-1, 1])
  const tx = cx + tailSide * (headR + 2)
  polygonFill(
    ctx,
    [
      [tx, eyeY - 15],
      [tx + tailSide * 20, eyeY - 5],
      [tx, eyeY - 9],
    ],
    band,
  )
  polygonFill(
    ctx,
    [
      [tx, eyeY - 8],
      [tx + tailSide * 24, eyeY + 6],
      [tx, eyeY - 2],
    ],
    band,
  )
}

// ---------- angel ----------
function drawAngel(ctx: CanvasRenderingContext2D, rng: Rng) {
  rectFill(
    ctx,
    0,
    0,
    SIZE,
    SIZE,
    `rgb(${randInt(rng, 200, 230)}, ${randInt(rng, 210, 235)}, ${randInt(rng, 230, 255)})`,
  )
  const cx = SIZE / 2
  const skin = pick(rng, SKIN_TONES)
  const hair = rgb(rng, 150, 230)
  const robeVal = randInt(rng, 245, 255)
  const robe = `rgb(${robeVal}, ${robeVal}, ${robeVal})`

  const hipY = 205
  const torsoW = 56
  const torsoH = 65
  const hemY = hipY + 55
  const hemW = torsoW + 45
  const shoulderY = hipY - torsoH
  const headR = randInt(rng, 27, 34)
  const headCy = shoulderY - headR - 4

  const wingParts: [number, number, number, number][] = [
    [20, -10, 46, 26],
    [38, 10, 50, 24],
    [48, 32, 44, 22],
    [44, 52, 34, 18],
  ]
  for (const side of [-1, 1]) {
    for (const [dx, dy, w, h] of wingParts) {
      const wx = cx + side * dx
      const wy = shoulderY + dy
      ellipseFill(ctx, wx - w / 2, wy - h / 2, wx + w / 2, wy + h / 2, 'rgb(255, 255, 255)')
    }
  }

  const haloY = headCy - headR - 16
  ellipseFill(ctx, cx - 34, haloY - 14, cx + 34, haloY + 14, 'rgba(255, 235, 150, 0.43)')
  ellipseStroke(ctx, cx - 24, haloY - 8, cx + 24, haloY + 8, 'rgb(230, 180, 60)', 4)

  polygonFill(
    ctx,
    [
      [cx - torsoW / 2, shoulderY],
      [cx + torsoW / 2, shoulderY],
      [cx + hemW / 2, hemY],
      [cx - hemW / 2, hemY],
    ],
    robe,
  )
  baseBody(ctx, rng, cx, skin, hipY, torsoW, torsoH)
  rectFill(ctx, cx - torsoW / 2, shoulderY, cx + torsoW / 2, hipY, robe)

  ellipseFill(ctx, cx - headR, headCy - headR, cx + headR, headCy + headR, skin)
  pieSliceFill(ctx, cx - headR, headCy - headR, cx + headR, headCy + headR, 180, 360, hair)
  simpleFace(ctx, cx, headCy, headR, 'gentle')
}

const DRAWERS: Record<ArtCategory, (ctx: CanvasRenderingContext2D, rng: Rng) => void> = {
  shapes: drawShapes,
  comic: drawComic,
  person: drawPerson,
  superhero: drawSuperhero,
  animal: drawAnimal,
  cartoonCharacter: drawCartoonCharacter,
  redHairedWoman: drawRedHairedWoman,
  ninja: drawNinja,
  angel: drawAngel,
}

/** Draws one generated picture onto `canvas`, fully replacing its contents. */
export function drawArt(canvas: HTMLCanvasElement, category: ArtCategory, seed: number, blurPx: number): void {
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const offscreen = document.createElement('canvas')
  offscreen.width = SIZE
  offscreen.height = SIZE
  const octx = offscreen.getContext('2d')
  if (!octx) return

  DRAWERS[category](octx, mulberry32(seed))

  ctx.clearRect(0, 0, SIZE, SIZE)
  ctx.filter = blurPx > 0 ? `blur(${blurPx}px)` : 'none'
  ctx.drawImage(offscreen, 0, 0)
  ctx.filter = 'none'
}

export function randomSeed(): number {
  return Math.floor(Math.random() * 2 ** 31)
}

export function randomCategory(): ArtCategory {
  return ART_CATEGORIES[Math.floor(Math.random() * ART_CATEGORIES.length)]
}
