import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { DEFAULT_NAMES, drawWorkshop, drawResident } from './workshop-art'
import { WORKSHOP_ART, WORKSHOP_SPRITE_ANCHORS, WORKSHOP_WALK_ANCHORS, WORKSHOP_WORK_ACTIVITIES, WORKSHOP_DECOR_BOUNDS } from './workshop.generated'
import { STATION_SIZE, createWorkshopLayout, createResidents, syncResidents, stepResidents, settleResidents, residentActivity, type Resident, type Presence } from './workshop-world'

export const WORKSHOP_CSS = `
.whg-map{--whg-map-panel:linear-gradient(180deg,rgba(7,30,45,.96),rgba(3,17,31,.98));--whg-map-brass:#d7b66c;--whg-map-line:rgba(215,182,108,.48);--whg-map-accent:#8fd8ef;--whg-map-text:#e8f1f5;--whg-map-muted:#a9c0cc;--whg-map-running:#6fd3a4;--whg-map-waiting:#f2b95c;--whg-map-idle:#8fa6b3;position:relative;display:flex;flex-direction:column;flex:1;width:100%;height:100%;min-width:0;min-height:0;overflow:hidden;box-sizing:border-box;background:#061a28;color:var(--whg-map-text);font:13px/1.5 system-ui,"Microsoft YaHei",sans-serif;user-select:none}
.whg-map *{box-sizing:border-box}.whg-map button{font:inherit;cursor:pointer}.whg-map button:focus-visible,.whg-map-viewport:focus-visible{outline:2px solid var(--whg-map-accent);outline-offset:-3px}.whg-map button:disabled{cursor:not-allowed}
.whg-map-head{display:flex;align-items:center;gap:14px;flex:none;min-width:0;padding:8px 16px;border-bottom:1px solid var(--whg-map-line);background:var(--whg-map-panel);z-index:1}
.whg-map-heading{flex:none;margin:0;font:600 18px/1.3 "Yu Mincho","Songti SC","SimSun",serif;letter-spacing:2px;color:var(--whg-map-brass)}.whg-map-summary{flex:1;min-width:0;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--whg-map-muted);font-size:12.5px}
.whg-map-head-actions{display:flex;align-items:center;gap:6px;margin-left:auto;flex:none}.whg-map-control{min-height:32px;padding:4px 10px;border:1px solid var(--whg-map-line);border-radius:6px;background:rgba(3,17,31,.45);color:var(--whg-map-brass);white-space:nowrap}.whg-map-control:hover:not(:disabled),.whg-map-control:focus-visible{background:rgba(215,182,108,.12);border-color:var(--whg-map-brass);color:#f2d89d}.whg-map-control[aria-pressed=true]{border-color:var(--whg-map-brass);background:rgba(215,182,108,.18)}.whg-map-control:disabled{border-style:dashed}.whg-map .whg-map-zoom-step{min-width:32px;padding:4px 8px;font-size:18px;line-height:1}
.whg-map-content{display:grid;grid-template-columns:minmax(0,1fr) 248px;min-height:0;min-width:0;flex:1}.whg-map-viewport{position:relative;display:flex;min-width:0;min-height:0;padding:12px;overflow:auto;overscroll-behavior:contain;scrollbar-color:var(--whg-map-brass) #061a28;background:#061a28}.whg-map-viewport[data-pan=true]{cursor:grab;touch-action:none}.whg-map-viewport[data-dragging=true]{cursor:grabbing}
.whg-map-floor{position:relative;margin:auto;isolation:isolate;flex:none}.whg-map-scene{display:block;width:100%;height:100%;image-rendering:auto}
.whg-map-person{position:absolute;width:72px;height:96px;transform:translate(-50%,-88px) scale(var(--whg-map-scale,1));transform-origin:50% 88px;padding:0;border:0;border-radius:8px;background:transparent;color:var(--whg-map-text);overflow:visible;touch-action:manipulation}.whg-map:not([data-paused=true]) .whg-map-person[data-settled=true]{transition:left .1s linear,top .1s linear}.whg-map-person:hover,.whg-map-person:focus-visible{z-index:2147483647!important}.whg-map-person:focus-visible{outline-offset:-4px}.whg-map-person[data-highlight=true]{outline:2px solid var(--whg-map-brass);outline-offset:3px;box-shadow:0 0 16px rgba(215,182,108,.5)}
.whg-map-person canvas{position:absolute;display:block;width:96px;height:112px;left:50%;top:-12px;transform:translateX(-50%);margin:0;image-rendering:auto;filter:drop-shadow(0 3px 2px rgba(0,8,24,.6))}.whg-map-person:hover canvas,.whg-map-person:focus-visible canvas,.whg-map-person[data-highlight=true] canvas{filter:drop-shadow(0 0 5px var(--whg-map-brass))}
.whg-map-person[data-at-desk=true]{width:144px;height:168px;transform:translate(-50%,-168px) scale(var(--whg-map-scale,1));transform-origin:50% 168px}.whg-map-person[data-at-desk=true] canvas{width:176px;height:192px;top:0}
.whg-map-bubble-anchor,.whg-map-name-anchor{position:absolute;left:50%;width:0;height:0;pointer-events:none}.whg-map-bubble-anchor{bottom:calc(100% + 4px)}.whg-map-person[data-at-desk=true] .whg-map-bubble-anchor{bottom:calc(100% - 30px)}.whg-map-bubble-scale{position:absolute;bottom:0;display:block;width:max-content;transform:translateX(-50%) scale(calc(1 / var(--whg-map-scale,1)));transform-origin:50% 100%}
.whg-map-bubble{display:flex;align-items:center;justify-content:center;gap:6px;border:1px solid var(--whg-map-running);border-radius:999px;padding:6px 9px;background:#071e2d;color:var(--whg-map-running);font-size:12px;font-weight:600;line-height:1.4;white-space:nowrap;box-shadow:0 3px 12px rgba(0,8,24,.55)}.whg-map-bubble-waiting{padding:5px 10px;border-color:var(--whg-map-waiting);background:var(--whg-map-waiting);color:#061a28;animation:whg-map-waiting-pulse 2.4s ease-in-out infinite}.whg-map-bubble-alert{font-size:15px;font-weight:800}.whg-map-bubble-dot{width:4px;height:4px;border-radius:50%;background:currentColor;animation:whg-map-working-dot 1.2s ease-in-out infinite}.whg-map-bubble-dot:nth-child(2){animation-delay:.16s}.whg-map-bubble-dot:nth-child(3){animation-delay:.32s}
.whg-map-name-anchor{top:calc(100% + 8px);visibility:hidden}.whg-map-person[data-at-desk=true] .whg-map-name-anchor{top:calc(100% + 32px)}.whg-map-person:hover .whg-map-name-anchor,.whg-map-person:focus-visible .whg-map-name-anchor{visibility:visible}.whg-map-name{display:block;width:max-content;padding:4px 9px;border:1px solid var(--whg-map-brass);border-radius:999px;background:#071e2d;color:var(--whg-map-text);font-size:12px;line-height:1.5;white-space:nowrap;transform:translateX(-50%) scale(calc(1 / var(--whg-map-scale,1)));transform-origin:50% 0;box-shadow:0 3px 12px rgba(0,8,24,.55)}
.whg-map-roster{display:flex;flex-direction:column;min-height:0;min-width:0;overflow:auto;border-left:1px solid var(--whg-map-line);background:var(--whg-map-panel);padding:18px 12px;scrollbar-color:var(--whg-map-brass) #061a28}.whg-map-roster h2{margin:0 7px 5px;color:var(--whg-map-brass);font-size:15px;font-weight:600;letter-spacing:1px}.whg-map-roster-note{margin:0 7px 14px;color:var(--whg-map-muted);font-size:12.5px;line-height:1.7}.whg-map-resident{display:flex;align-items:center;gap:9px;width:100%;flex:none;min-height:78px;padding:8px 6px;border:1px solid transparent;border-left:3px solid transparent;border-bottom-color:var(--whg-map-line);background:transparent;color:var(--whg-map-text);text-align:left;border-radius:7px}.whg-map-resident[data-status=waiting]{border-left-color:var(--whg-map-waiting);background:rgba(242,185,92,.08)}.whg-map-resident:hover:not(:disabled),.whg-map-resident:focus-visible{border-top-color:var(--whg-map-line);border-right-color:var(--whg-map-line);background:rgba(215,182,108,.14)}.whg-map-resident canvas{width:44px;height:52px;flex:none;image-rendering:auto}.whg-map-resident-meta{flex:1;min-width:0}.whg-map-resident-name{display:block;font-size:14px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.whg-map-resident-status{display:block;margin-top:4px;font-size:12.5px;color:var(--whg-map-muted);line-height:1.5;overflow-wrap:anywhere}.whg-map-resident-arrow{color:var(--whg-map-brass);font-size:14px}
.whg-map-presence-dot{display:inline-block;width:9px;height:9px;margin:0 6px 0 0;border-radius:50%;background:var(--whg-map-idle)}.whg-map-resident[data-status=running] .whg-map-presence-dot{background:var(--whg-map-running)}.whg-map-resident[data-status=waiting] .whg-map-presence-dot{background:var(--whg-map-waiting)}
.whg-map-message{position:absolute;bottom:16px;left:50%;max-width:90%;transform:translateX(-50%);z-index:8;margin:0;padding:11px 17px;border:1px solid var(--whg-map-waiting);background:#071e2d;color:var(--whg-map-waiting);border-radius:7px;font-size:12.5px;box-shadow:0 5px 20px rgba(0,8,24,.55);overflow-wrap:anywhere}.whg-map-disabled{display:grid;place-content:center;justify-items:center;flex:1;min-height:0;overflow:auto;text-align:center;padding:32px;color:var(--whg-map-muted);background:var(--whg-map-panel)}.whg-map-disabled h2{margin:12px 0 8px;color:var(--whg-map-brass);font:600 23px/1.4 "Yu Mincho","Songti SC","SimSun",serif;letter-spacing:2px}.whg-map-disabled p{max-width:380px;margin:6px 0;font-size:13px;line-height:1.9}.whg-map-empty-symbol{display:block;width:62px;height:62px;border:1px solid var(--whg-map-line);border-radius:50%;color:var(--whg-map-accent);background:#071e2d;font:28px/60px serif}.whg-map-loading .whg-map-empty-symbol{animation:whg-map-loading-glow 2s ease-in-out infinite}.whg-map-catalog-note{margin:0 0 10px;padding:9px 10px;border:1px solid var(--whg-map-line);border-radius:6px;background:rgba(242,185,92,.08);color:var(--whg-map-waiting);font-size:12.5px;line-height:1.6}
.whg-map-overlay{position:absolute;inset:0;z-index:20}.whg-map-tab{display:flex;flex:1;min-width:0;min-height:0;height:100%;overflow:hidden}
@keyframes whg-map-loading-glow{50%{box-shadow:0 0 18px rgba(143,216,239,.25)}}
@keyframes whg-map-waiting-pulse{50%{box-shadow:0 0 0 5px rgba(242,185,92,.16),0 0 22px rgba(242,185,92,.4)}}
@keyframes whg-map-working-dot{50%{transform:translateY(-2px)}}
.whg-map[data-paused=true] .whg-map-bubble,.whg-map[data-paused=true] .whg-map-bubble-dot{animation:none}
@media(max-width:900px){.whg-map-content{grid-template-columns:minmax(0,1fr) 200px}.whg-map-roster{padding:16px 8px}.whg-map-head{padding:8px 12px;gap:10px}.whg-map-head-actions{gap:4px}.whg-map-control{padding:4px 8px}}
@media(max-width:640px){.whg-map-content{display:flex;flex-direction:column}.whg-map-viewport{flex:1;min-height:220px}.whg-map-roster{flex:none;max-height:168px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0 5px;border-left:0;border-top:1px solid var(--whg-map-line);padding:5px 8px}.whg-map-roster h2,.whg-map-roster-note{display:none}.whg-map-catalog-note{grid-column:1/-1}.whg-map-resident{min-height:74px;padding:6px 3px;gap:4px;align-items:flex-start}.whg-map-resident canvas{width:28px;height:36px}.whg-map-resident-arrow{display:none}.whg-map-head{flex-wrap:wrap;gap:8px;padding:8px 12px}.whg-map-head-actions{flex:1;justify-content:flex-end;flex-wrap:wrap;gap:5px}.whg-map-summary{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip-path:inset(50%)}.whg-map-disabled{padding:24px}.whg-map-disabled h2{font-size:21px}}
@media(prefers-reduced-motion:reduce){.whg-map-person{transition:none!important}.whg-map-bubble,.whg-map-bubble-dot,.whg-map-loading .whg-map-empty-symbol{animation:none!important}}
`

type WorkshopImages = { publicAtlas: HTMLImageElement; officeImage: HTMLImageElement; walkAtlas: HTMLImageElement; walkAnchors: Array<Array<{ x: number; y: number }>>; roomAtlas: HTMLImageElement; residentAtlas: HTMLImageElement; workstationAtlas: HTMLImageElement; decorAtlas: HTMLImageElement; decorBounds: Array<{ x: number; y: number; width: number; height: number }>; residentAnchors: Array<Array<{ x: number; y: number }>> }
let workshopImages: Promise<WorkshopImages> | null = null

function loadWorkshopImages(): Promise<WorkshopImages> {
  if (workshopImages) return workshopImages
  const load = (key: string) => new Promise<HTMLImageElement>((resolve, reject) => {
    const source = (WORKSHOP_ART as Record<string, string>)[key]
    if (!source) { reject(new Error('工坊素材尚未准备好')); return }
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('工坊素材加载失败'))
    image.src = source
  })
  workshopImages = Promise.all([load('workshop-map-atlas'), load('workshop-resident-atlas'), load('workshop-workstation-atlas'),
    load('workshop-room-atlas'), load('workshop-decor-atlas'), load('workshop-office-atlas'), load('workshop-walk-atlas')])
    .then(([publicAtlas, residentAtlas, workstationAtlas, roomAtlas, decorAtlas, officeImage, walkAtlas]) => ({ publicAtlas, officeImage, walkAtlas, walkAnchors: WORKSHOP_WALK_ANCHORS, residentAtlas, workstationAtlas, roomAtlas, decorAtlas, decorBounds: WORKSHOP_DECOR_BOUNDS, residentAnchors: WORKSHOP_SPRITE_ANCHORS }))
    .catch((error) => { workshopImages = null; throw error })
  return workshopImages
}

function PixelAvatar(props: { resident: Resident; frame: number; images: WorkshopImages; small?: boolean }): React.ReactElement {
  const ref = useRef<HTMLCanvasElement | null>(null)
  const { resident, frame } = props
  const atDesk = !props.small && resident.status !== 'idle' && resident.route.length === 0 && resident.node === 'work-' + resident.id
  const width = atDesk ? STATION_SIZE + 32 : 96, height = atDesk ? STATION_SIZE + 48 : 112
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const atlas = atDesk ? props.images.workstationAtlas : props.images.residentAtlas
    const cellWidth = (atlas.naturalWidth || atlas.width) / 6
    const scale = cellWidth / (atDesk ? STATION_SIZE : 96)
    const backingWidth = Math.round(width * scale), backingHeight = Math.round(height * scale)
    // Keep one source pixel per backing pixel; CSS handles the display scaling.
    // Resizing clears the canvas state, so only resize when the atlas/mode needs it.
    if (canvas.width !== backingWidth) canvas.width = backingWidth
    if (canvas.height !== backingHeight) canvas.height = backingHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(scale, 0, 0, scale, 0, 0)
    ctx.clearRect(0, 0, width, height)
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    drawResident(ctx, resident.id, atDesk ? STATION_SIZE / 2 + 16 : 48, atDesk ? STATION_SIZE + 24 : 100, frame, resident.status, !props.small && resident.route.length > 0, props.images, atDesk, resident.facing)
  }, [resident.id, resident.status, resident.route.length > 0, resident.facing, frame, props.small, props.images, atDesk])
  return React.createElement('canvas', { ref, 'aria-hidden': true })
}

export function WorkshopMap(props: {
  request: (action: string, args?: any) => Promise<any>
  sessionId?: string
  onEnterCharacter: (id: string) => Promise<void>
  onClose?: () => void
}): React.ReactElement {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const sceneRef = useRef<HTMLCanvasElement | null>(null)
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const floorRef = useRef<HTMLDivElement | null>(null)
  const requestRef = useRef(props.request)
  requestRef.current = props.request
  const layoutRef = useRef(createWorkshopLayout([]))
  const [layout, setLayout] = useState(layoutRef.current)
  const world = useRef<Resident[]>([])
  const [people, setPeople] = useState<Resident[]>([])
  const [images, setImages] = useState<WorkshopImages | null>(null)
  const [imageError, setImageError] = useState('')
  const [imageLoadAttempt, setImageLoadAttempt] = useState(0)
  const [catalogReady, setCatalogReady] = useState(false)
  const [catalogError, setCatalogError] = useState('')
  const [frame, setFrame] = useState(0)
  const [visible, setVisible] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion:reduce)').matches)
  const [paused, setPaused] = useState(false)
  const [zoom, setZoom] = useState<'fit' | number>('fit')
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 })
  const zoomAnchor = useRef<{ worldX: number; worldY: number; viewportX: number; viewportY: number } | null>(null)
  const pan = useRef<{ pointerId: number; x: number; y: number; left: number; top: number; dragging: boolean } | null>(null)
  const [dragging, setDragging] = useState(false)
  const [hoveredResident, setHoveredResident] = useState('')
  const [focusedResident, setFocusedResident] = useState('')
  const placements = useRef<{ layout: typeof layout; positions: Map<string, { x: number; y: number; atDesk: boolean }> }>({ layout, positions: new Map() })
  const [updatedAt, setUpdatedAt] = useState(0)
  const [enabled, setEnabled] = useState(true)
  const [syncError, setSyncError] = useState(false)
  const [entering, setEntering] = useState('')
  const enteringRef = useRef(false)
  const [error, setError] = useState('')
  const mounted = useRef(true)
  const hasSnapshot = useRef(false)
  const canExplore = people.length > 0 && !!images
  const fitScale = viewportSize.width && viewportSize.height
    ? Math.min(Math.max(1, viewportSize.width - 24) / layout.width, Math.max(1, viewportSize.height - 24) / layout.height) : 1
  const scale = zoom === 'fit' ? fitScale : Math.max(fitScale, Math.min(2, zoom))
  const canPan = scale > fitScale + .001
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])

  function zoomBy(factor: number, clientX?: number, clientY?: number): void {
    if (Math.max(fitScale, Math.min(2, scale * factor)) === scale) return
    const viewport = viewportRef.current, floor = floorRef.current
    if (viewport && floor) {
      const bounds = viewport.getBoundingClientRect(), floorBounds = floor.getBoundingClientRect()
      const x = clientX ?? bounds.left + viewport.clientLeft + viewport.clientWidth / 2
      const y = clientY ?? bounds.top + viewport.clientTop + viewport.clientHeight / 2
      zoomAnchor.current = {
        worldX: (x - floorBounds.left) / scale, worldY: (y - floorBounds.top) / scale,
        viewportX: x - bounds.left - viewport.clientLeft, viewportY: y - bounds.top - viewport.clientTop,
      }
    }
    setZoom((current) => Math.max(fitScale, Math.min(2, (current === 'fit' ? fitScale : Math.max(fitScale, Math.min(2, current))) * factor)))
  }

  function startPan(event: React.PointerEvent<HTMLDivElement>): void {
    if (!canPan || !event.isPrimary || event.button !== 0 || (event.target as Element).closest('.whg-map-person')) return
    const viewport = event.currentTarget
    pan.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop, dragging: false }
    viewport.setPointerCapture(event.pointerId)
  }

  function movePan(event: React.PointerEvent<HTMLDivElement>): void {
    const current = pan.current
    if (!current || current.pointerId !== event.pointerId) return
    const dx = event.clientX - current.x, dy = event.clientY - current.y
    if (!current.dragging && Math.hypot(dx, dy) <= 4) return
    if (!current.dragging) { current.dragging = true; setDragging(true) }
    event.preventDefault()
    event.currentTarget.scrollLeft = current.left - dx
    event.currentTarget.scrollTop = current.top - dy
  }

  function endPan(event: React.PointerEvent<HTMLDivElement>): void {
    if (pan.current?.pointerId !== event.pointerId) return
    pan.current = null
    setDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }

  useEffect(() => {
    let alive = true
    setImageError('')
    loadWorkshopImages().then((loaded) => { if (alive) setImages(loaded) })
      .catch((error: any) => { if (alive) setImageError(String(error?.message || '工坊素材加载失败')) })
    return () => { alive = false }
  }, [imageLoadAttempt])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion:reduce)')
    const update = () => setReducedMotion(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    let intersecting = true
    const sync = () => setVisible(intersecting && document.visibilityState !== 'hidden')
    const observer = new IntersectionObserver((entries) => { intersecting = entries.some((entry) => entry.isIntersecting); sync() })
    if (rootRef.current) observer.observe(rootRef.current)
    document.addEventListener('visibilitychange', sync)
    sync()
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', sync) }
  }, [])

  useEffect(() => {
    const ctx = sceneRef.current?.getContext('2d')
    if (ctx && images) {
      ctx.setTransform(2, 0, 0, 2, 0, 0)
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      drawWorkshop(ctx, layout, images)
    }
  }, [enabled, layout, images, catalogReady, people.length])

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return undefined
    const sync = () => setViewportSize((size) => size.width === viewport.clientWidth && size.height === viewport.clientHeight
      ? size : { width: viewport.clientWidth, height: viewport.clientHeight })
    sync()
    const observer = new ResizeObserver(sync)
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [layout.width, layout.height, canExplore, enabled])

  useLayoutEffect(() => {
    const viewport = viewportRef.current, floor = floorRef.current
    if (!viewport || !floor) { zoomAnchor.current = null; return }
    if (zoom === 'fit') {
      viewport.scrollLeft = 0; viewport.scrollTop = 0
    } else if (zoomAnchor.current) {
      const anchor = zoomAnchor.current
      viewport.scrollLeft = floor.offsetLeft + anchor.worldX * scale - anchor.viewportX
      viewport.scrollTop = floor.offsetTop + anchor.worldY * scale - anchor.viewportY
    }
    zoomAnchor.current = null
  }, [scale, zoom, layout, canExplore, enabled])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return undefined
    const wheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return
      event.preventDefault()
      if (event.deltaY) zoomBy(event.deltaY < 0 ? 1.25 : 1 / 1.25, event.clientX, event.clientY)
    }
    viewport.addEventListener('wheel', wheel, { passive: false })
    return () => viewport.removeEventListener('wheel', wheel)
  }, [canExplore, enabled, fitScale, scale])

  useEffect(() => {
    if (canPan && enabled && canExplore && visible) return
    const viewport = viewportRef.current, pointerId = pan.current?.pointerId
    pan.current = null
    setDragging(false)
    if (viewport && pointerId !== undefined && viewport.hasPointerCapture(pointerId)) viewport.releasePointerCapture(pointerId)
  }, [canPan, enabled, canExplore, visible])

  useEffect(() => {
    placements.current = { layout, positions: new Map(enabled && canExplore ? people.map((resident) => [resident.id, {
      x: resident.x, y: resident.y, atDesk: resident.status !== 'idle' && resident.route.length === 0 && resident.node === 'work-' + resident.id,
    }]) : []) }
  }, [people, layout, enabled, canExplore])

  useEffect(() => {
    if (!visible) return undefined
    let alive = true
    let timer: ReturnType<typeof setTimeout>
    const refresh = async () => {
      try {
        const result = await requestRef.current('map-state')
        if (!alive) return
        if (!result || !Array.isArray(result.characters)) throw new Error('地图状态暂不可用')
        setEnabled(result.enabled !== false)
        setCatalogReady(result.catalogReady === true)
        setCatalogError(typeof result.catalogError === 'string' ? result.catalogError.slice(0, 180) : '')
        const now = performance.now()
        if (Array.isArray(result.availableCharacters)) {
          const known = new Set<string>()
          const available = result.availableCharacters.filter((item: any) => {
            if (!item || typeof item.id !== 'string' || !Object.prototype.hasOwnProperty.call(DEFAULT_NAMES, item.id) || known.has(item.id)) return false
            known.add(item.id)
            return true
          })
          // A catalog refresh can fail after a successful connection. Keep the
          // known residents until the server has an authoritative replacement.
          const nextLayout = createWorkshopLayout(available.map((item: any) => item.id))
          if ((result.catalogReady === true || available.length > 0) && nextLayout.ids.join('|') !== layoutRef.current.ids.join('|')) {
            const names = { ...DEFAULT_NAMES, ...Object.fromEntries(available.map((item: any) => [item.id, item.name || DEFAULT_NAMES[item.id]])) }
            layoutRef.current = nextLayout
            setLayout(nextLayout)
            world.current = createResidents(names, now, nextLayout)
            hasSnapshot.current = false
          }
        }
        syncResidents(world.current, result.characters as Presence[], now, layoutRef.current)
        if (!hasSnapshot.current || reducedMotion || paused) settleResidents(world.current, layoutRef.current)
        hasSnapshot.current = true
        setPeople(world.current.map((resident) => ({ ...resident })))
        setUpdatedAt(Number(result.updatedAt) || Date.now())
        setSyncError(false)
      } catch {
        if (alive) setSyncError(true)
      } finally {
        if (alive) timer = setTimeout(refresh, 2500)
      }
    }
    void refresh()
    return () => { alive = false; clearTimeout(timer) }
  }, [visible, props.sessionId, reducedMotion, paused])

  useEffect(() => {
    if (!visible || !enabled || !images || !people.length || paused || reducedMotion) return undefined
    let animation = 0, last = performance.now(), published = 0
    const tick = (now: number) => {
      stepResidents(world.current, (now - last) / 1000, now, updatedAt > 0 && !syncError, layoutRef.current)
      last = now
      if (now - published >= 100) {
        setPeople(world.current.map((resident) => ({ ...resident })))
        setFrame(Math.floor(now / 30))
        published = now
      }
      animation = requestAnimationFrame(tick)
    }
    animation = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animation)
  }, [visible, enabled, images, people.length, paused, reducedMotion, updatedAt > 0, syncError])

  async function enter(resident: Resident): Promise<void> {
    if (enteringRef.current) return
    enteringRef.current = true
    setEntering(resident.id); setError('')
    try { await props.onEnterCharacter(resident.id) }
    catch (err: any) { if (mounted.current) setError('进入对话失败：' + String(err?.message || err)) }
    finally { enteringRef.current = false; if (mounted.current) setEntering('') }
  }

  const working = people.filter((person) => person.status !== 'idle').length
  const statusText = (resident: Resident) => !updatedAt ? '等待状态同步' : syncError ? '状态同步中断'
    : resident.status === 'running' && resident.route.length === 0 && resident.node === 'work-' + resident.id
      ? (WORKSHOP_WORK_ACTIVITIES[resident.id] || '工作') + '中' : residentActivity(resident)
  const rosterStatus = (resident: Resident) => {
    // The activity already names the state; only a waiting resident who is still walking needs it spelled out.
    const detail = statusText(resident)
    return resident.status === 'waiting' && !detail.includes('确认') ? '等你确认 · ' + detail : detail
  }
  const statusOrder = (resident: Resident) => resident.status === 'waiting' ? 0 : resident.status === 'running' ? 1 : 2
  const roster = people.map((resident, index) => ({ resident, index }))
    .sort((a, b) => statusOrder(a.resident) - statusOrder(b.resident) || a.index - b.index)
  const syncStatus = syncError ? '状态同步中断，正在重试' : updatedAt
    ? '已同步 ' + new Date(updatedAt).toLocaleTimeString('zh-CN', { hour12: false }) : '连接工坊中…'
  const summary = `${working} 位在工位忙碌 · ${people.length - working} 位自由活动 · ${syncStatus}`
  const loadingCatalog = !catalogReady && !people.length && !catalogError && !syncError
  const emptyTitle = imageError ? '工坊图景还没准备好'
    : !people.length ? loadingCatalog ? '正在获取接入模型' : catalogError || syncError ? '暂时没有连上模型目录' : '为她留一间房吧'
      : '正在布置深海工坊'
  const emptyMessage = imageError ? imageError
    : !people.length ? loadingCatalog ? '接入哪些模型，庄园里就会住进哪些模型娘。'
      : catalogError || syncError ? '模型目录读取失败，正在重试。连接恢复后，房间和角色会自动出现。'
        : '在 Harness 中配置并启用模型后，回来看看。她的宿舍和工位会一起准备好。'
      : '阳光、海风，还有等你一起度过的日常。'
  return React.createElement('div', { ref: rootRef, className: 'whg-map', 'data-paused': paused || reducedMotion || !visible, 'aria-label': '深海工坊地图' },
    React.createElement('header', { className: 'whg-map-head' },
      React.createElement('h1', { className: 'whg-map-heading' }, '深海工坊'),
      React.createElement('p', { className: 'whg-map-summary', role: 'status', title: summary }, summary),
      React.createElement('div', { className: 'whg-map-head-actions' },
        React.createElement('button', { className: 'whg-map-control whg-map-zoom-step', type: 'button', disabled: !enabled || !canExplore || scale <= fitScale, onClick: () => zoomBy(1 / 1.25), 'aria-label': '缩小地图', title: '缩小地图' }, '−'),
        React.createElement('button', { className: 'whg-map-control', type: 'button', 'aria-pressed': zoom === 'fit', disabled: !enabled || !canExplore, onClick: () => { zoomAnchor.current = null; setZoom('fit') }, 'aria-label': '适应视口', title: '显示完整地图' }, '适应'),
        React.createElement('button', { className: 'whg-map-control whg-map-zoom-step', type: 'button', disabled: !enabled || !canExplore || scale >= Math.max(fitScale, 2), onClick: () => zoomBy(1.25), 'aria-label': '放大地图', title: '放大地图' }, '＋'),
        React.createElement('button', { className: 'whg-map-control', type: 'button', 'aria-pressed': paused || reducedMotion, disabled: reducedMotion || !enabled || !canExplore, onClick: () => setPaused(!paused), title: reducedMotion ? '已跟随系统减少动态效果' : '仅暂停地图动画，工作状态继续同步' }, reducedMotion ? '静态显示' : paused ? '继续散步' : '暂停散步'),
        props.onClose ? React.createElement('button', { className: 'whg-map-control', type: 'button', onClick: props.onClose }, '返回 Galgame') : null,
      ),
    ),
    !enabled
      ? React.createElement('div', { className: 'whg-map-disabled' }, React.createElement('h2', null, '深海工坊正在休息'), React.createElement('p', null, '在“设置 → 插件 → 鲸鱼娘”中开启插件后，再来看看她们吧。'))
      : !canExplore
        ? React.createElement('div', { className: 'whg-map-disabled' + (!imageError && (loadingCatalog || people.length > 0) ? ' whg-map-loading' : ''), role: 'status' },
          React.createElement('span', { className: 'whg-map-empty-symbol', 'aria-hidden': true }, '✧'),
          React.createElement('h2', null, emptyTitle),
          React.createElement('p', null, emptyMessage),
          imageError ? React.createElement('button', { className: 'whg-map-control', type: 'button', onClick: () => setImageLoadAttempt((attempt) => attempt + 1) }, '重试加载') : null,
        )
      : React.createElement('div', { className: 'whg-map-content' },
        React.createElement('div', {
          ref: viewportRef, className: 'whg-map-viewport', tabIndex: 0, role: 'region',
          'data-pan': canPan, 'data-dragging': dragging,
          onPointerDown: startPan, onPointerMove: movePan, onPointerUp: endPan, onPointerCancel: endPan, onLostPointerCapture: endPan,
          'aria-label': '像素平面图，可滚动查看；按 Ctrl 或 Command 加滚轮缩放，放大后可拖动；也可从角色名单进入对话',
        },
          React.createElement('div', { ref: floorRef, className: 'whg-map-floor', style: { width: layout.width * scale, height: layout.height * scale, aspectRatio: layout.width + '/' + layout.height, '--whg-map-scale': scale } as React.CSSProperties },
            React.createElement('canvas', { ref: sceneRef, className: 'whg-map-scene', width: layout.width * 2, height: layout.height * 2, role: 'img', 'aria-label': `深海工坊庄园俯视图：${people.length} 间已接入模型的宿舍，工作室、茶水休息室与海底观景室。` }),
            people.map((resident) => {
              const atDesk = resident.status !== 'idle' && resident.route.length === 0 && resident.node === 'work-' + resident.id
              const previous = placements.current.layout === layout ? placements.current.positions.get(resident.id) : undefined
              const settled = !!previous && previous.atDesk === atDesk && Math.hypot(resident.x - previous.x, resident.y - previous.y) <= 96
              const waiting = resident.status === 'waiting' && resident.route.length === 0
              return React.createElement('button', {
                key: resident.id, type: 'button', className: 'whg-map-person', 'data-character': resident.id, 'data-status': resident.status,
                'data-at-desk': atDesk, 'data-settled': settled, 'data-highlight': hoveredResident === resident.id || focusedResident === resident.id,
                style: { left: resident.x / layout.width * 100 + '%', top: resident.y / layout.height * 100 + '%', zIndex: 10 + Math.round(resident.y) },
                disabled: !!entering, onClick: () => void enter(resident),
                'aria-label': '与' + resident.name + '对话，' + statusText(resident),
              },
                React.createElement(PixelAvatar, { resident, frame, images: images! }),
                waiting || resident.status === 'running' && atDesk ? React.createElement('span', { className: 'whg-map-bubble-anchor', 'aria-hidden': true },
                  React.createElement('span', { className: 'whg-map-bubble-scale' },
                    waiting ? React.createElement('span', { className: 'whg-map-bubble whg-map-bubble-waiting' },
                      React.createElement('span', { className: 'whg-map-bubble-alert' }, '!'), '等你确认',
                    ) : React.createElement('span', { className: 'whg-map-bubble' },
                      React.createElement('span', { className: 'whg-map-bubble-dot' }),
                      React.createElement('span', { className: 'whg-map-bubble-dot' }),
                      React.createElement('span', { className: 'whg-map-bubble-dot' }),
                    ),
                  ),
                ) : null,
                React.createElement('span', { className: 'whg-map-name-anchor', 'aria-hidden': true },
                  React.createElement('span', { className: 'whg-map-name' }, resident.name + ' · ' + statusText(resident)),
                ),
              )
            }),
          ),
        ),
        React.createElement('aside', { className: 'whg-map-roster', 'aria-label': '工坊角色名单' },
          React.createElement('h2', null, '工坊里的她们'),
          React.createElement('p', { className: 'whg-map-roster-note' }, '点击像素小人或名单，和她聊一会儿。'),
          catalogError ? React.createElement('p', { className: 'whg-map-catalog-note', role: 'status' }, '模型目录暂时无法更新，先保留已接入的角色。') : null,
          roster.map(({ resident }) => React.createElement('button', {
            key: resident.id, type: 'button', className: 'whg-map-resident', 'data-status': resident.status,
            disabled: !!entering, onClick: () => void enter(resident), 'aria-label': '与' + resident.name + '对话，' + rosterStatus(resident),
            onPointerEnter: () => setHoveredResident(resident.id), onPointerLeave: () => setHoveredResident((current) => current === resident.id ? '' : current),
            onFocus: () => setFocusedResident(resident.id), onBlur: () => setFocusedResident((current) => current === resident.id ? '' : current),
          },
            React.createElement(PixelAvatar, { resident, frame: 0, images: images!, small: true }),
            React.createElement('span', { className: 'whg-map-resident-meta' },
              React.createElement('span', { className: 'whg-map-resident-name' }, resident.name),
              React.createElement('span', { className: 'whg-map-resident-status' }, React.createElement('i', { className: 'whg-map-presence-dot', 'aria-hidden': true }), rosterStatus(resident), resident.activeSessions > 1 ? ' · ' + resident.activeSessions + ' 个任务' : ''),
            ),
            React.createElement('span', { className: 'whg-map-resident-arrow', 'aria-hidden': true }, '↗'),
          )),
        ),
      ),
    error ? React.createElement('p', { className: 'whg-map-message', role: 'alert' }, error) : null,
  )
}
