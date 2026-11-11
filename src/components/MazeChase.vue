<script setup>
// Self-playing maze-chase in the page background (DESIGN.md §5.5).
// A box-shaped "chomper" eats pellets while "glitch" critters hunt it.
// Everything is AI-driven and loops forever: clear the maze → new maze; get caught → respawn.
import { onMounted, onBeforeUnmount, ref } from 'vue'

const TILE = 24 // px per maze tile (3×3 background cells)
const CELL = 8 // background pixel-grid cell, same as the old Game of Life
const INSET = 1
const PX = 4 // sprite pixel size (6×6 sprites fill a tile)
const WALL_ALPHA = 0.2 // walls fainter than pellets and actors

const SPEED = { chomper: 7, hunter: 6, scared: 3.5 } // tiles per second
const POWER_SECONDS = 6
const DANGER_RADIUS = 2 // chomper avoids tiles this close to a hunter
const HUNTER_COUNT = 4
const RELEASE_STAGGER = 1.5 // seconds between hunters leaving home
const PAUSE = { dying: 1.2, clear: 1.4, start: 0.6 }

// 6×6 bitmaps, facing right. '#' = filled.
const CHOMPER = [
  ['######', '##.###', '######', '######', '######', '######'], // closed
  ['######', '##.###', '####..', '......', '####..', '######'], // open
]
const HUNTER = [
  ['..##..', '.####.', '##..##', '######', '.#..#.', '#.##.#'],
  ['..##..', '.####.', '##..##', '######', '.#..#.', '.#..#.'],
]
const SCARED = [
  ['######', '#....#', '#.##.#', '#....#', '#.##.#', '######'],
  ['......', '.####.', '.#..#.', '.####.', '.#..#.', '......'],
]

const DIRS = [
  { dx: 1, dy: 0 },
  { dx: -1, dy: 0 },
  { dx: 0, dy: 1 },
  { dx: 0, dy: -1 },
]

// ---------- maze ----------

function generateMaze(cols, rows) {
  const wall = Array.from({ length: rows }, () => new Uint8Array(cols).fill(1))
  const stack = [[1, 1]]
  wall[1][1] = 0
  while (stack.length) {
    const [x, y] = stack[stack.length - 1]
    const options = DIRS.map((d) => [x + d.dx * 2, y + d.dy * 2, d]).filter(
      ([nx, ny]) => nx > 0 && ny > 0 && nx < cols - 1 && ny < rows - 1 && wall[ny][nx],
    )
    if (!options.length) {
      stack.pop()
      continue
    }
    const [nx, ny, d] = options[(Math.random() * options.length) | 0]
    wall[y + d.dy][x + d.dx] = 0
    wall[ny][nx] = 0
    stack.push([nx, ny])
  }
  // Braid: knock out most dead ends so there are loops to escape through.
  for (let y = 1; y < rows - 1; y++)
    for (let x = 1; x < cols - 1; x++) {
      if (wall[y][x]) continue
      const walls = DIRS.filter((d) => wall[y + d.dy][x + d.dx])
      if (walls.length < 3 || Math.random() > 0.75) continue
      const breakable = walls.filter((d) => {
        const bx = x + d.dx
        const by = y + d.dy
        return bx > 0 && by > 0 && bx < cols - 1 && by < rows - 1 && !wall[y + d.dy * 2]?.[x + d.dx * 2]
      })
      if (breakable.length) {
        const d = breakable[(Math.random() * breakable.length) | 0]
        wall[y + d.dy][x + d.dx] = 0
      }
    }
  return wall
}

// ---------- game ----------

class Game {
  constructor(ctx, width, height) {
    this.ctx = ctx
    this.width = width
    this.height = height
    this.cols = Math.max(7, Math.floor(width / TILE) | 1) // odd
    this.rows = Math.max(7, Math.floor(height / TILE) | 1)
    if (this.cols * TILE > width) this.cols -= 2
    if (this.rows * TILE > height) this.rows -= 2
    this.ox = Math.floor((width - this.cols * TILE) / 2)
    this.oy = Math.floor((height - this.rows * TILE) / 2)
    this.time = 0
    this.newLevel()
  }

  open(x, y) {
    return x >= 0 && y >= 0 && x < this.cols && y < this.rows && !this.wall[y][x]
  }

  nearestOpen(tx, ty) {
    let best = null
    let bestD = Infinity
    for (let y = 0; y < this.rows; y++)
      for (let x = 0; x < this.cols; x++)
        if (this.open(x, y)) {
          const d = Math.abs(x - tx) + Math.abs(y - ty)
          if (d < bestD) (bestD = d), (best = { x, y })
        }
    return best
  }

  newLevel() {
    this.wall = generateMaze(this.cols, this.rows)
    this.home = this.nearestOpen(this.cols >> 1, this.rows >> 1)
    this.spawn = this.nearestOpen(this.cols >> 1, this.rows - 2)

    this.pellets = new Set()
    for (let y = 0; y < this.rows; y++)
      for (let x = 0; x < this.cols; x++) if (this.open(x, y)) this.pellets.add(y * this.cols + x)
    this.power = new Set(
      [
        [1, 1],
        [this.cols - 2, 1],
        [1, this.rows - 2],
        [this.cols - 2, this.rows - 2],
      ].map(([x, y]) => {
        const p = this.nearestOpen(x, y)
        return p.y * this.cols + p.x
      }),
    )
    this.pellets.delete(this.spawn.y * this.cols + this.spawn.x)
    this.pellets.delete(this.home.y * this.cols + this.home.x)

    this.renderWalls()
    this.resetActors()
  }

  resetActors() {
    const actor = (p, kind, i = 0) => ({ kind, i, x: p.x, y: p.y, tx: p.x, ty: p.y, t: 1, dir: DIRS[0] })
    this.chomper = actor(this.spawn, 'chomper')
    this.hunters = Array.from({ length: HUNTER_COUNT }, (_, i) => ({
      ...actor(this.home, 'hunter', i),
      release: this.time + PAUSE.start + i * RELEASE_STAGGER,
      aggression: 0.55 + i * 0.1,
      eaten: false,
    }))
    this.powerUntil = 0
    this.pauseUntil = this.time + PAUSE.start
    this.state = 'play'
  }

  // Multi-source BFS distance map over open tiles.
  bfs(sources) {
    const dist = new Int32Array(this.cols * this.rows).fill(-1)
    const queue = []
    for (const s of sources) {
      dist[s] = 0
      queue.push(s)
    }
    for (let head = 0; head < queue.length; head++) {
      const i = queue[head]
      const x = i % this.cols
      const y = (i / this.cols) | 0
      for (const d of DIRS) {
        const nx = x + d.dx
        const ny = y + d.dy
        const n = ny * this.cols + nx
        if (this.open(nx, ny) && dist[n] < 0) {
          dist[n] = dist[i] + 1
          queue.push(n)
        }
      }
    }
    return dist
  }

  idx(a) {
    return a.ty * this.cols + a.tx
  }

  choices(a) {
    const all = DIRS.filter((d) => this.open(a.tx + d.dx, a.ty + d.dy))
    const forward = all.filter((d) => !(d.dx === -a.dir.dx && d.dy === -a.dir.dy))
    return { all, forward: forward.length ? forward : all }
  }

  powered() {
    return this.time < this.powerUntil
  }

  steerChomper(a) {
    const { all } = this.choices(a)
    const threats = this.hunters.filter((h) => !h.eaten && this.time >= h.release)
    const scared = this.powered()
    const danger = scared ? null : this.bfs(threats.map((h) => this.idx(h)))
    const goal = scared && threats.length
      ? this.bfs(threats.map((h) => this.idx(h)))
      : this.bfs([...this.pellets, ...this.power])

    let best = null
    let bestScore = Infinity
    for (const d of all) {
      const n = (a.ty + d.dy) * this.cols + (a.tx + d.dx)
      const g = goal[n] < 0 ? 999 : goal[n]
      const hd = danger ? (danger[n] < 0 ? 999 : danger[n]) : 999
      const reverse = d.dx === -a.dir.dx && d.dy === -a.dir.dy ? 0.5 : 0
      const score = (hd <= DANGER_RADIUS ? 1000 - hd * 100 : 0) + g + reverse + Math.random() * 0.3
      if (score < bestScore) (bestScore = score), (best = d)
    }
    return best
  }

  steerHunter(h, chomperDist) {
    if (h.eaten) {
      // Rush home, then become a hunter again.
      const home = this.bfs([this.home.y * this.cols + this.home.x])
      if (h.tx === this.home.x && h.ty === this.home.y) h.eaten = false
      else return this.choices(h).all.reduce((b, d) => (home[this.n(h, d)] < home[this.n(h, b)] ? d : b))
    }
    const { forward } = this.choices(h)
    if (Math.random() > h.aggression) return forward[(Math.random() * forward.length) | 0]
    const sign = this.powered() ? -1 : 1
    return forward.reduce((b, d) => (sign * chomperDist[this.n(h, d)] < sign * chomperDist[this.n(h, b)] ? d : b))
  }

  n(a, d) {
    return (a.ty + d.dy) * this.cols + (a.tx + d.dx)
  }

  advance(a, speed, dt, steer) {
    a.t += speed * dt
    while (a.t >= 1) {
      a.t -= 1
      a.x = a.tx
      a.y = a.ty
      const d = steer(a)
      if (!d) {
        a.t = 1
        return
      }
      a.dir = d
      a.tx = a.x + d.dx
      a.ty = a.y + d.dy
    }
  }

  pos(a) {
    return { x: a.x + (a.tx - a.x) * a.t, y: a.y + (a.ty - a.y) * a.t }
  }

  update(dt) {
    this.time += dt
    if (this.time < this.pauseUntil) return
    if (this.state === 'dying') this.resetActors()
    if (this.state === 'clear') this.newLevel()
    if (this.time < this.pauseUntil) return

    const c = this.chomper
    this.advance(c, SPEED.chomper, dt, (a) => this.steerChomper(a))
    const here = this.idx(c)
    if (c.t < 0.5) {
      const at = c.y * this.cols + c.x
      this.pellets.delete(at)
      if (this.power.delete(at)) this.powerUntil = this.time + POWER_SECONDS
    }

    const chomperDist = this.bfs([here])
    for (const h of this.hunters) {
      if (this.time < h.release) continue
      const speed = h.eaten ? SPEED.chomper * 1.5 : this.powered() ? SPEED.scared : SPEED.hunter
      this.advance(h, speed, dt, (a) => this.steerHunter(a, chomperDist))
    }

    const cp = this.pos(c)
    for (const h of this.hunters) {
      if (h.eaten || this.time < h.release) continue
      const hp = this.pos(h)
      if (Math.abs(hp.x - cp.x) + Math.abs(hp.y - cp.y) > 0.6) continue
      if (this.powered()) h.eaten = true
      else {
        this.state = 'dying'
        this.pauseUntil = this.time + PAUSE.dying
        return
      }
    }

    if (!this.pellets.size && !this.power.size) {
      this.state = 'clear'
      this.pauseUntil = this.time + PAUSE.clear
    }
  }

  // Walls are static per level: draw once to an offscreen canvas.
  renderWalls() {
    const dpr = window.devicePixelRatio || 1
    const off = document.createElement('canvas')
    off.width = this.width * dpr
    off.height = this.height * dpr
    const g = off.getContext('2d')
    g.scale(dpr, dpr)
    g.fillStyle = 'black'
    const per = TILE / CELL
    for (let y = 0; y < this.rows; y++)
      for (let x = 0; x < this.cols; x++) {
        if (!this.wall[y][x]) continue
        for (let cy = 0; cy < per; cy++)
          for (let cx = 0; cx < per; cx++)
            g.fillRect(this.ox + x * TILE + cx * CELL + INSET, this.oy + y * TILE + cy * CELL + INSET, CELL - INSET * 2, CELL - INSET * 2)
      }
    this.wallLayer = off
  }

  sprite(bitmap, px, py, dir = DIRS[0]) {
    const { ctx } = this
    for (let r = 0; r < 6; r++)
      for (let col = 0; col < 6; col++) {
        // Rotate the right-facing bitmap to the travel direction.
        let sx = col
        let sy = r
        if (dir.dx === -1) sx = 5 - col
        else if (dir.dy === 1) (sx = r), (sy = col)
        else if (dir.dy === -1) (sx = 5 - r), (sy = col)
        if (bitmap[sy][sx] === '#') ctx.fillRect(px + col * PX + 0.5, py + r * PX + 0.5, PX - 1, PX - 1)
      }
  }

  draw() {
    const { ctx } = this
    ctx.clearRect(0, 0, this.width, this.height)

    const blink = Math.floor(this.time * 6) % 2
    ctx.globalAlpha = this.state === 'clear' && blink ? WALL_ALPHA / 2 : WALL_ALPHA
    ctx.drawImage(this.wallLayer, 0, 0, this.width, this.height)
    ctx.globalAlpha = 1
    ctx.fillStyle = 'black'

    const center = (i, size) => {
      const x = i % this.cols
      const y = (i / this.cols) | 0
      return [this.ox + x * TILE + (TILE - size) / 2, this.oy + y * TILE + (TILE - size) / 2]
    }
    for (const i of this.pellets) ctx.fillRect(...center(i, 4), 4, 4)
    if (blink || !this.powered()) for (const i of this.power) ctx.fillRect(...center(i, 10), 10, 10)

    const frame = Math.floor(this.time * 8) % 2
    for (const h of this.hunters) {
      const p = this.pos(h)
      const x = this.ox + p.x * TILE
      const y = this.oy + p.y * TILE
      if (h.eaten) {
        // Just the eyes, heading home.
        ctx.fillRect(x + 2 * PX, y + 2 * PX, PX, PX)
        ctx.fillRect(x + 4 * PX, y + 2 * PX, PX, PX)
      } else if (this.powered()) {
        const ending = this.powerUntil - this.time < 1.5
        this.sprite(SCARED[ending ? blink : 0], x, y)
      } else this.sprite(HUNTER[frame], x, y)
    }

    const c = this.chomper
    const p = this.pos(c)
    const cx = this.ox + p.x * TILE
    const cy = this.oy + p.y * TILE
    if (this.state === 'dying') {
      // Shrink away.
      const k = Math.max(0, (this.pauseUntil - this.time) / PAUSE.dying)
      const s = TILE * k
      ctx.fillRect(cx + (TILE - s) / 2, cy + (TILE - s) / 2, s, s)
    } else this.sprite(CHOMPER[frame], cx, cy, c.dir)
  }
}

// ---------- component ----------

// Cursor spotlight: a second canvas mirrors the maze at higher opacity, masked to a soft
// circle around the pointer, so the maze shows through more strongly where you hover.
const SPOT = {
  radius: 140, // px, where the fade reaches zero
  ease: 0.18, // 0..1 per frame; lower = lazier trail
}

const canvas = ref(null)
const spot = ref(null)
const spotVisible = ref(false)
let spotCtx = null
let pointer = null // { x, y, tx, ty } once the mouse has moved
let game = null
let raf = 0
let last = 0
let running = false
let observer = null
let resizeTimer = 0

function build() {
  const el = canvas.value
  const ctx = el.getContext('2d')
  if (!ctx) return
  const rect = el.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  el.width = rect.width * dpr
  el.height = rect.height * dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  spot.value.width = el.width
  spot.value.height = el.height
  spotCtx = spot.value.getContext('2d')
  game = new Game(ctx, rect.width, rect.height)
  render()
}

function render() {
  game.draw()
  if (!spotVisible.value || !spotCtx) return
  spotCtx.clearRect(0, 0, spot.value.width, spot.value.height)
  spotCtx.drawImage(canvas.value, 0, 0)
}

function moveSpot(ease) {
  if (!pointer) return
  pointer.x += (pointer.tx - pointer.x) * ease
  pointer.y += (pointer.ty - pointer.y) * ease
  spot.value.style.setProperty('--mx', `${pointer.x}px`)
  spot.value.style.setProperty('--my', `${pointer.y}px`)
}

function loop(now) {
  const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)) // clamp: rAF time can precede start; long gaps after tab switches
  last = now
  game.update(dt)
  render()
  moveSpot(SPOT.ease)
  raf = requestAnimationFrame(loop)
}

function start() {
  if (running || !game) return
  running = true
  last = performance.now()
  raf = requestAnimationFrame(loop)
}
function stop() {
  running = false
  cancelAnimationFrame(raf)
}

function onPointerMove(e) {
  if (!pointer) pointer = { x: e.clientX, y: e.clientY }
  pointer.tx = e.clientX
  pointer.ty = e.clientY
  if (!spotVisible.value) {
    spotVisible.value = true
    render()
  }
  if (!running) {
    // Static maze (reduced motion / hidden tab): follow the cursor directly.
    moveSpot(1)
  }
}
const onPointerLeave = () => (spotVisible.value = false)

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const onVisibility = () => (document.visibilityState === 'visible' && !reducedMotion() ? start() : stop())
const hasCursor = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches

onMounted(() => {
  build()
  observer = new ResizeObserver(() => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      const wasRunning = running
      stop()
      build()
      if (wasRunning) start()
    }, 200)
  })
  observer.observe(canvas.value)
  if (!reducedMotion()) start()
  document.addEventListener('visibilitychange', onVisibility)
  if (hasCursor()) {
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onPointerLeave)
  }
})

onBeforeUnmount(() => {
  stop()
  clearTimeout(resizeTimer)
  observer?.disconnect()
  document.removeEventListener('visibilitychange', onVisibility)
  window.removeEventListener('pointermove', onPointerMove)
  document.documentElement.removeEventListener('pointerleave', onPointerLeave)
})
</script>

<template>
  <div class="-z-30 animate-gol print:hidden" aria-hidden="true">
    <canvas
      ref="canvas"
      class="fixed top-0 left-0 w-screen h-screen opacity-[0.06] dark:opacity-[0.09] dark:invert pointer-events-none select-none -z-30"
    />
    <canvas
      ref="spot"
      class="spot fixed top-0 left-0 w-screen h-screen dark:invert pointer-events-none select-none -z-30 transition-opacity duration-300"
      :class="spotVisible ? 'opacity-75' : 'opacity-0'"
      :style="{ '--r': `${SPOT.radius}px` }"
    />
  </div>
</template>

<style scoped>
.spot {
  --mx: -9999px;
  --my: -9999px;
  -webkit-mask-image: radial-gradient(circle var(--r) at var(--mx) var(--my), #000 30%, transparent 100%);
  mask-image: radial-gradient(circle var(--r) at var(--mx) var(--my), #000 30%, transparent 100%);
}
</style>
