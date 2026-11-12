import React, { useEffect, useRef, useState } from 'react'
import { DEFAULT_NAMES, drawWorkshop, drawResident } from './workshop-art'
import { WORKSHOP_ART, WORKSHOP_SPRITE_ANCHORS, WORKSHOP_WORK_ACTIVITIES } from './workshop.generated'
import { createWorkshopLayout, createResidents, syncResidents, stepResidents, settleResidents, residentActivity, type Resident, type Presence } from './workshop-world'

export const WORKSHOP_CSS = `
.whg-map{--whg-map-ink:#315661;--whg-map-muted:#718b8b;--whg-map-line:#c9dbd6;--whg-map-paper:#fbfaf3;position:relative;display:flex;flex-direction:column;flex:1;width:100%;height:100%;min-height:0;overflow:hidden;box-sizing:border-box;background:#eff4ee;color:var(--whg-map-ink);font:13px/1.5 system-ui,"Microsoft YaHei",sans-serif;user-select:none}
.whg-map *{box-sizing:border-box}.whg-map button{font:inherit;cursor:pointer}.whg-map button:focus-visible{outline:2px solid #347e94;outline-offset:3px}.whg-map button:disabled{cursor:wait;opacity:.55}
.whg-map-head{display:flex;align-items:center;gap:20px;flex:none;padding:18px 26px 16px;border-bottom:1px solid #d7dfd2;background:var(--whg-map-paper);box-shadow:0 2px 0 #fff9;z-index:1}
.whg-map-heading{margin:0;font:600 26px/1.25 "Yu Mincho","Songti SC","SimSun",serif;letter-spacing:4px;color:#28586b}.whg-map-kicker{margin:0 0 6px;color:#6d9c9b;font:10px/1.4 Consolas,monospace;letter-spacing:2px}.whg-map-sub{margin:7px 0 0;color:#798c83;font-size:12px;letter-spacing:.5px}
.whg-map-head-actions{display:flex;align-items:center;gap:8px;margin-left:auto;flex-wrap:wrap}.whg-map-control{padding:7px 12px;border:1px solid #b8d0ca;border-radius:6px;background:#f5faf5;color:#3f6e76;white-space:nowrap;box-shadow:0 2px 0 #d6e2d94d}.whg-map-control:hover{background:#e5f1e9;border-color:#83ada9}.whg-map-control[aria-pressed=true]{border-color:#75a69a;background:#e1eee3;color:#2b6866}
.whg-map-content{display:grid;grid-template-columns:minmax(0,1fr) 234px;min-height:0;flex:1}.whg-map-viewport{min-height:0;overflow:auto;overscroll-behavior:contain;scrollbar-color:#afc9c0 #edf1e7;display:grid;align-items:center;background:#e9f0e8}
.whg-map-floor{position:relative;width:100%;min-width:1152px;margin:auto;isolation:isolate;flex:none}.whg-map-floor[data-zoom=true]{width:150%;min-width:1728px}.whg-map-scene{display:block;width:100%;height:100%;image-rendering:auto}
.whg-map-person{position:absolute;z-index:2;width:72px;height:96px;transform:translate(-50%,-88px) scale(var(--whg-map-scale,1));transform-origin:50% 88px;padding:0;border:0;background:transparent;color:#315661;overflow:visible;touch-action:manipulation}.whg-map-person:hover,.whg-map-person:focus-visible{z-index:4}.whg-map-person:focus-visible{outline-offset:-4px;border-radius:8px}
.whg-map-person canvas{position:absolute;display:block;width:96px;height:112px;left:50%;top:-12px;transform:translateX(-50%);margin:0;image-rendering:auto;filter:drop-shadow(0 3px 1px #638b7540)}.whg-map-person:hover canvas{filter:drop-shadow(0 0 5px #fffbd7)}
.whg-map-person[data-at-desk="true"]{width:192px;height:216px;transform:translate(-50%,-216px) scale(var(--whg-map-scale,1));transform-origin:50% 216px}.whg-map-person[data-at-desk="true"] canvas{width:224px;height:240px;top:0}.whg-map-person[data-at-desk="true"] .whg-map-name{top:224px}.whg-map-name{position:absolute;top:94px;left:50%;transform:translateX(-50%);border:1px solid #aac7bd;border-radius:5px;padding:2px 8px;background:#fffff5f2;color:#2d5c69;font:600 11px/1.4 system-ui,sans-serif;white-space:nowrap;pointer-events:none;box-shadow:0 2px 3px #406f6c15}.whg-map-person[data-status=running] .whg-map-name{border-color:#77af93;background:#eff9ec}.whg-map-person[data-status=waiting] .whg-map-name{border-color:#ceb789;background:#fff7e6}
.whg-map-roster{display:flex;flex-direction:column;min-height:0;overflow:auto;border-left:1px solid var(--whg-map-line);background:#f9faf1;padding:22px 15px}.whg-map-roster h2{margin:0 8px 5px;color:#3e6c71;font-size:14px;font-weight:600;letter-spacing:2px}.whg-map-roster-note{margin:0 8px 17px;color:#85948b;font-size:11px;line-height:1.7}.whg-map-resident{display:flex;align-items:center;gap:11px;width:100%;min-height:76px;padding:8px 6px;border:1px solid transparent;border-bottom-color:#dee6d9;background:transparent;color:inherit;text-align:left;border-radius:7px}.whg-map-resident:hover{border-color:#b8d0c2;background:#edf4e9}.whg-map-resident canvas{width:44px;height:52px;flex:none;image-rendering:auto}.whg-map-resident-meta{flex:1;min-width:0}.whg-map-resident-name{display:block;font-size:13px;font-weight:650;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.whg-map-resident-status{display:block;margin-top:4px;font-size:11px;color:#7b9089;line-height:1.5}.whg-map-resident-arrow{color:#8ea89e;font-size:14px}
.whg-map-presence-dot{display:inline-block;width:6px;height:6px;margin:0 6px 1px 0;border-radius:2px;background:#a2b6ae}.whg-map-resident[data-status=running] .whg-map-presence-dot{background:#65a98b}.whg-map-resident[data-status=waiting] .whg-map-presence-dot{background:#cca361}
.whg-map-legend{display:flex;gap:12px;flex-wrap:wrap;margin:auto 7px 0;padding-top:24px;color:#83968b;font-size:10px}.whg-map-legend span{display:inline-flex;align-items:center;gap:5px}.whg-map-legend i{width:6px;height:6px;border-radius:2px;display:inline-block;background:#a2b6ae}.whg-map-legend i.running{background:#65a98b}.whg-map-legend i.waiting{background:#cca361}
.whg-map-foot{display:flex;align-items:center;gap:12px;justify-content:space-between;padding:10px 26px;border-top:1px solid #d7dfd2;color:#83958a;background:var(--whg-map-paper);font-size:11px;flex:none}.whg-map-sync{color:#649786;white-space:nowrap}.whg-map-message{position:absolute;bottom:48px;left:50%;max-width:90%;transform:translateX(-50%);z-index:8;margin:0;padding:11px 17px;border:1px solid #ceb98f;background:#fff8e8;color:#866944;border-radius:7px;font-size:12px;box-shadow:0 5px 20px #58766b17}.whg-map-disabled{display:grid;place-content:center;justify-items:center;flex:1;text-align:center;padding:32px;color:#81958a;background:#f4f6ee}.whg-map-disabled h2{margin:12px 0 8px;color:#46767d;font:600 23px/1.4 "Yu Mincho","Songti SC","SimSun",serif;letter-spacing:2px}.whg-map-disabled p{max-width:380px;margin:6px 0;font-size:13px;line-height:1.9}.whg-map-empty-symbol{display:block;width:62px;height:62px;border:1px solid #b9d4c6;border-radius:50%;color:#79a89c;background:#e8f2e8;font:28px/60px serif}.whg-map-loading .whg-map-empty-symbol{animation:whgMapBreathe 2s ease-in-out infinite}.whg-map-catalog-note{padding:10px 16px;border-bottom:1px solid #dedbc1;background:#fff9e8;color:#9b8561;font-size:11px;line-height:1.6}.whg-map-catalog-note button{margin-left:8px;border:0;border-bottom:1px solid #b4a782;padding:0;background:none;color:#7e7663}
.whg-map-overlay{position:absolute;inset:0;z-index:20}.whg-map-tab{display:flex;flex:1;min-width:0;min-height:0;height:100%;overflow:hidden}
@keyframes whgMapBreathe{50%{opacity:.55}}
@media(max-width:900px){.whg-map-content{grid-template-columns:minmax(0,1fr) 190px}.whg-map-roster{padding:18px 9px}.whg-map-head{padding:15px 18px;gap:12px}.whg-map-heading{font-size:23px}.whg-map-sub{font-size:11px}.whg-map-foot{padding:9px 18px;font-size:10px}}
@media(max-width:640px){.whg-map-content{display:flex;flex-direction:column}.whg-map-viewport{flex:1;min-height:220px;display:block}.whg-map-roster{flex:none;max-height:148px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0 5px;border-left:0;border-top:1px solid var(--whg-map-line);padding:5px 9px}.whg-map-roster h2,.whg-map-roster-note,.whg-map-legend{display:none}.whg-map-resident{min-height:62px;padding:4px 1px;gap:3px}.whg-map-resident canvas{width:34px;height:44px}.whg-map-resident-name{font-size:11px}.whg-map-resident-status{font-size:9px}.whg-map-resident-arrow{display:none}.whg-map-head{flex-wrap:wrap;gap:9px;padding:12px}.whg-map-head-actions{gap:5px}.whg-map-control{font-size:11px!important;padding:6px 8px}.whg-map-heading{font-size:21px;letter-spacing:2px}.whg-map-sub{display:none}.whg-map-kicker{font-size:8px;letter-spacing:1px;margin-bottom:4px}.whg-map-foot{align-items:flex-start;padding:8px 11px;font-size:9px;gap:6px}.whg-map-sync{max-width:45%;white-space:normal;text-align:right}.whg-map-disabled{padding:24px}.whg-map-disabled h2{font-size:21px}.whg-map-disabled p{font-size:12px}}
@media(prefers-reduced-motion:reduce){.whg-map-person{scroll-behavior:auto}.whg-map-loading .whg-map-empty-symbol{animation:none}}
`

type WorkshopImages = { atlas: HTMLImageElement; publicAtlas: HTMLImageElement; roomAtlas: HTMLImageElement; residentAtlas: HTMLImageElement; workstationAtlas: HTMLImageElement; atlasColumns: number; atlasRows: number; residentAnchors: Array<Array<{ x: number; y: number }>> }
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
    load('workshop-room-atlas')])
    .then(([atlas, residentAtlas, workstationAtlas, roomAtlas]) => ({ atlas, publicAtlas: atlas, residentAtlas, workstationAtlas, roomAtlas, atlasColumns: 2, atlasRows: 2, residentAnchors: WORKSHOP_SPRITE_ANCHORS }))
    .catch((error) => { workshopImages = null; throw error })
  return workshopImages
}

function PixelAvatar(props: { resident: Resident; frame: number; images: WorkshopImages; small?: boolean }): React.ReactElement {
  const ref = useRef<HTMLCanvasElement | null>(null)
  const { resident, frame } = props
  const atDesk = !props.small && resident.status !== 'idle' && resident.route.length === 0 && resident.node === 'work-' + resident.id
  const width = atDesk ? 224 : 96, height = atDesk ? 240 : 112
  useEffect(() => {
    const ctx = ref.current?.getContext('2d')
    if (!ctx) return
    ctx.setTransform(2, 0, 0, 2, 0, 0)
    ctx.clearRect(0, 0, width, height)
    ctx.imageSmoothingEnabled = false
    drawResident(ctx, resident.id, atDesk ? 112 : 48, atDesk ? 216 : 100, frame, resident.status, !props.small && resident.route.length > 0, props.images, atDesk)
  }, [resident.id, resident.status, resident.route.length > 0, frame, props.small, props.images, atDesk])
  return React.createElement('canvas', { ref, width: width * 2, height: height * 2, 'aria-hidden': true })
}

export function WorkshopMap(props: {
  request: (action: string, args?: any) => Promise<any>
  sessionId?: string
  onEnterCharacter: (id: string) => Promise<void>
  onClose?: () => void
}): React.ReactElement {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const sceneRef = useRef<HTMLCanvasElement | null>(null)
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
  const [zoom, setZoom] = useState(false)
  const [updatedAt, setUpdatedAt] = useState(0)
  const [enabled, setEnabled] = useState(true)
  const [syncError, setSyncError] = useState(false)
  const [entering, setEntering] = useState('')
  const enteringRef = useRef(false)
  const [error, setError] = useState('')
  const mounted = useRef(true)
  const hasSnapshot = useRef(false)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])

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

  useEffect(() => {
    const floor = floorRef.current
    if (!floor) return undefined
    const sync = () => floor.style.setProperty('--whg-map-scale', String(floor.getBoundingClientRect().width / layout.width))
    sync()
    const observer = new ResizeObserver(sync)
    observer.observe(floor)
    return () => observer.disconnect()
  }, [layout.width, images, people.length, enabled])

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
  const loadingCatalog = !catalogReady && !people.length && !catalogError && !syncError
  const canExplore = people.length > 0 && !!images
  const emptyTitle = imageError ? '工坊图景还没准备好'
    : !people.length ? loadingCatalog ? '正在获取接入模型' : catalogError || syncError ? '暂时没有连上模型目录' : '为她留一间房吧'
      : '正在布置深海工坊'
  const emptyMessage = imageError ? imageError
    : !people.length ? loadingCatalog ? '接入哪些模型，庄园里就会住进哪些模型娘。'
      : catalogError || syncError ? '模型目录读取失败，正在重试。连接恢复后，房间和角色会自动出现。'
        : '在 Harness 中配置并启用模型后，回来看看。她的宿舍和工位会一起准备好。'
      : '阳光、海风，还有等你一起度过的日常。'
  return React.createElement('div', { ref: rootRef, className: 'whg-map', 'aria-label': '深海工坊地图' },
    React.createElement('header', { className: 'whg-map-head' },
      React.createElement('div', null,
        React.createElement('p', { className: 'whg-map-kicker' }, 'DEEP SEA WORKSHOP / MAP'),
        React.createElement('h1', { className: 'whg-map-heading' }, '深海工坊'),
        React.createElement('p', { className: 'whg-map-sub' }, '海风经过回廊，她们的日常也在继续。'),
      ),
      React.createElement('div', { className: 'whg-map-head-actions' },
        React.createElement('button', { className: 'whg-map-control', type: 'button', 'aria-pressed': zoom, disabled: !canExplore, onClick: () => setZoom(!zoom), title: '放大地图后可滚动查看' }, zoom ? '缩小地图' : '放大地图'),
        React.createElement('button', { className: 'whg-map-control', type: 'button', 'aria-pressed': paused || reducedMotion, disabled: reducedMotion || !canExplore, onClick: () => setPaused(!paused), title: reducedMotion ? '已跟随系统减少动态效果' : '仅暂停地图动画，工作状态继续同步' }, reducedMotion ? '静态显示' : paused ? '继续散步' : '暂停散步'),
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
        React.createElement('div', { className: 'whg-map-viewport', tabIndex: 0, role: 'region', 'aria-label': '像素平面图，可滚动查看；也可从角色名单进入对话' },
          React.createElement('div', { ref: floorRef, className: 'whg-map-floor', 'data-zoom': zoom, style: { aspectRatio: layout.width + '/' + layout.height } },
            React.createElement('canvas', { ref: sceneRef, className: 'whg-map-scene', width: layout.width * 2, height: layout.height * 2, role: 'img', 'aria-label': `深海工坊庄园俯视图：${people.length} 间已接入模型的宿舍，工作室、茶水休息室与海底观景室。` }),
            people.map((resident) => React.createElement('button', {
              key: resident.id, type: 'button', className: 'whg-map-person', 'data-character': resident.id, 'data-status': resident.status,
              'data-at-desk': resident.status !== 'idle' && resident.route.length === 0 && resident.node === 'work-' + resident.id,
              style: { left: resident.x / layout.width * 100 + '%', top: resident.y / layout.height * 100 + '%' },
              disabled: !!entering, onClick: () => void enter(resident),
              'aria-label': '与' + resident.name + '对话，' + statusText(resident),
              title: resident.name + ' · ' + statusText(resident) + ' · 点击对话',
            }, React.createElement(PixelAvatar, { resident, frame, images: images! }), React.createElement('span', { className: 'whg-map-name' }, entering === resident.id ? '进入中…' : resident.name))),
          ),
        ),
        React.createElement('aside', { className: 'whg-map-roster', 'aria-label': '工坊角色名单' },
          React.createElement('h2', null, '庄园里的她们'),
          React.createElement('p', { className: 'whg-map-roster-note' }, '点击像素小人或名字，和她聊一会儿。'),
          catalogError ? React.createElement('p', { className: 'whg-map-catalog-note', role: 'status' }, '模型目录暂时无法更新，先保留已接入的角色。') : null,
          people.map((resident) => React.createElement('button', {
            key: resident.id, type: 'button', className: 'whg-map-resident', 'data-status': resident.status,
            disabled: !!entering, onClick: () => void enter(resident), 'aria-label': '与' + resident.name + '对话，' + statusText(resident),
          },
            React.createElement(PixelAvatar, { resident, frame: 0, images: images!, small: true }),
            React.createElement('span', { className: 'whg-map-resident-meta' },
              React.createElement('span', { className: 'whg-map-resident-name' }, resident.name),
              React.createElement('span', { className: 'whg-map-resident-status' }, React.createElement('i', { className: 'whg-map-presence-dot', 'aria-hidden': true }), statusText(resident), resident.activeSessions > 1 ? ' · ' + resident.activeSessions + ' 个任务' : ''),
            ),
            React.createElement('span', { className: 'whg-map-resident-arrow', 'aria-hidden': true }, '↗'),
          )),
          React.createElement('div', { className: 'whg-map-legend' },
            React.createElement('span', null, React.createElement('i', { className: 'running' }), '工作'),
            React.createElement('span', null, React.createElement('i', { className: 'waiting' }), '等待确认'),
            React.createElement('span', null, React.createElement('i'), '空闲'),
          ),
        ),
      ),
    React.createElement('footer', { className: 'whg-map-foot' },
      React.createElement('span', null, people.length && updatedAt && !syncError ? `${working} 位在工位忙碌 · ${people.length - working} 位自由活动 · 可滚动查看地图` : '房间与角色跟随已接入的模型'),
      React.createElement('span', { className: 'whg-map-sync', role: 'status' }, syncError ? '状态同步中断，正在重试' : updatedAt ? '已同步 ' + new Date(updatedAt).toLocaleTimeString('zh-CN', { hour12: false }) : '连接工坊中…'),
    ),
    error ? React.createElement('p', { className: 'whg-map-message', role: 'alert' }, error) : null,
  )
}
