import { type FormEvent, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import BathroomDoor from './components/BathroomDoor'
import Bed from './components/Bed'
import Wardrobe, { type WardrobeItem } from './components/Wardrobe'
import { DOOR_W, loadDoorX } from './doorPosition'
import { ROOM_H, ROOM_W } from './geometry'

const MANUAL_WARDROBES_KEY = 'bedroom_manual_wardrobes_state'
const WARDROBE_THICKNESS = 60
const MANUAL_DEFAULT_LEN = 100

function loadManualWardrobes(): WardrobeItem[] {
  try {
    const saved = localStorage.getItem(MANUAL_WARDROBES_KEY)
    if (!saved) return []
    const parsed = JSON.parse(saved)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(item => typeof item?.id === 'string' && typeof item?.name === 'string')
  } catch {
    return []
  }
}

function createManualWardrobe(name: string, count: number): WardrobeItem {
  const offset = (count % 6) * 14
  const x = Math.min(ROOM_W - MANUAL_DEFAULT_LEN - 16, 24 + offset)
  const y = Math.min(ROOM_H - WARDROBE_THICKNESS - 16, 24 + offset)
  return {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    x,
    y,
    len: MANUAL_DEFAULT_LEN,
    rotation: 0,
  }
}

export default function BedroomPage() {
  const [doorX, setDoorX] = useState(loadDoorX)
  const cardRef = useRef<HTMLDivElement>(null)
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 })
  const [autoScale, setAutoScale] = useState(1)
  const [userZoom, setUserZoom] = useState(1)
  const [roomRotation, setRoomRotation] = useState(0)
  const [manualWardrobes, setManualWardrobes] = useState<WardrobeItem[]>(loadManualWardrobes)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newElementName, setNewElementName] = useState('')
  const [deleteMode, setDeleteMode] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const effectiveScale = autoScale * userZoom
  const isRotated90 = roomRotation % 180 !== 0
  const visualW = naturalSize.w ? (isRotated90 ? naturalSize.h : naturalSize.w) * effectiveScale : undefined
  const visualH = naturalSize.w ? (isRotated90 ? naturalSize.w : naturalSize.h) * effectiveScale : undefined
  const pendingDeleteName = manualWardrobes.find(item => item.id === pendingDeleteId)?.name

  useEffect(() => {
    const update = () => {
      const card = cardRef.current
      if (!card) return
      const nw = card.scrollWidth
      const nh = card.scrollHeight
      setNaturalSize({ w: nw, h: nh })
      // main px-6 = 48px; reserve ~200px for nav + padding + toolbar
      const availW = window.innerWidth - 48
      const availH = window.innerHeight - 200
      setAutoScale(Math.min(1, availW / nw, availH / nh))
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    localStorage.setItem(MANUAL_WARDROBES_KEY, JSON.stringify(manualWardrobes))
  }, [manualWardrobes])

  const openAddDialog = () => {
    setNewElementName('')
    setIsAddDialogOpen(true)
  }

  const addManualWardrobe = (e: FormEvent) => {
    e.preventDefault()
    const name = newElementName.trim()
    if (!name) return
    setManualWardrobes(prev => [...prev, createManualWardrobe(name, prev.length)])
    setIsAddDialogOpen(false)
    setNewElementName('')
  }

  const updateManualWardrobe = (id: string | undefined, next: WardrobeItem) => {
    if (!id) return
    setManualWardrobes(prev => prev.map(item => (item.id === id ? { ...next, id, name: item.name } : item)))
  }

  const confirmDeleteManualWardrobe = () => {
    if (!pendingDeleteId) return
    setManualWardrobes(prev => prev.filter(item => item.id !== pendingDeleteId))
    setPendingDeleteId(null)
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.2),transparent_28%),linear-gradient(135deg,#111827_0%,#312e81_52%,#0f172a_100%)] px-6 py-8 text-slate-100 sm:px-10 lg:px-16">
      <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/10 bg-white/10 px-5 py-3 backdrop-blur">
        <Link to="/" className="flex items-center gap-3 text-sm font-semibold tracking-wide">
          <span className="grid size-9 place-items-center rounded-full bg-amber-300 text-slate-950">B</span>
          Bedroom
        </Link>
        <Link
          to="/"
          className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:border-amber-200/70 hover:bg-white/10"
        >
          返回首页
        </Link>
      </nav>

      <section className="mx-auto flex max-w-6xl flex-col items-center py-4 lg:py-10">
        {/* 工具栏 */}
        <div className="mb-4 inline-flex items-center gap-0.5 rounded-full border border-white/15 bg-white/10 p-1 backdrop-blur shadow-lg shadow-black/20">
          {/* 放大 */}
          <button
            onClick={() => setUserZoom(z => Math.min(2.5, +(z + 0.15).toFixed(2)))}
            title="放大"
            className="grid size-9 place-items-center rounded-full text-slate-200 transition hover:bg-white/15 active:scale-90"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>

          {/* 缩小 */}
          <button
            onClick={() => setUserZoom(z => Math.max(0.3, +(z - 0.15).toFixed(2)))}
            title="缩小"
            className="grid size-9 place-items-center rounded-full text-slate-200 transition hover:bg-white/15 active:scale-90"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>

          <div className="h-4 w-px bg-white/25 mx-0.5" />

          {/* 旋转 */}
          <button
            onClick={() => setRoomRotation(r => r + 90)}
            title="旋转 90°"
            className="grid size-9 place-items-center rounded-full text-slate-200 transition hover:bg-white/15 active:scale-90"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2v6h-6" />
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
            </svg>
          </button>

          <div className="h-4 w-px bg-white/25 mx-0.5" />

          {/* 重置 */}
          <button
            onClick={() => { setUserZoom(1); setRoomRotation(0) }}
            title="重置"
            className="grid size-9 place-items-center rounded-full text-slate-400 transition hover:bg-white/15 hover:text-slate-200 active:scale-90"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>
        </div>

        {/* 缩放/旋转包装层：transform 不影响布局，需手动指定 visual 尺寸 */}
        <div
          style={
            visualW
              ? { position: 'relative', width: visualW, height: visualH }
              : {}
          }
        >
          <div
            ref={cardRef}
            style={
              naturalSize.w
                ? {
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transformOrigin: 'center center',
                    transform: `translate(-50%, -50%) scale(${effectiveScale}) rotate(${roomRotation}deg)`,
                  }
                : {}
            }
            className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl"
          >
            <div className="rounded-[1.5rem] bg-slate-950/60 p-6">
              {/* 房间平面图：grid 布局，方向标注完全在房间外 */}
              <div
                className="inline-grid"
                style={{ gridTemplateColumns: `auto ${ROOM_W}px auto`, gridTemplateRows: `auto ${ROOM_H}px auto` }}
              >
                {/* 西 - 上方居中 */}
                <div className="col-start-2 row-start-1 flex flex-col items-center gap-1 pb-2">
                  <span className="select-none text-[11px] font-bold tracking-[0.25em] text-amber-200/80">西</span>
                  <div className="h-3 w-px bg-amber-300/35" />
                </div>

                {/* 南 - 左侧居中 */}
                <div className="col-start-1 row-start-2 flex items-center gap-1 pr-2">
                  <span className="select-none text-[11px] font-bold tracking-[0.25em] text-amber-200/80">南</span>
                  <div className="h-px w-3 bg-amber-300/35" />
                </div>

                {/* 房间区域：外层 relative 包裹，窗户放在墙外；内层 overflow-hidden 裁剪床 */}
                <div className="relative col-start-2 row-start-2">
                  {/* 厕所门 标注（墙外，随门位置移动） */}
                  <div
                    style={{ position: 'absolute', top: -22, left: doorX + DOOR_W / 2, transform: 'translateX(-50%)', pointerEvents: 'none', whiteSpace: 'nowrap' }}
                    className="select-none flex items-center rounded-full border border-amber-200/25 bg-indigo-950/55 px-2.5 py-0.5 backdrop-blur-sm"
                  >
                    <span className="text-[9px] font-bold tracking-widest text-amber-200/65">厕所门</span>
                  </div>
                  {/* 西墙窗户（贴在上方墙外，宽130，居中） */}
                  <div
                    style={{ position: 'absolute', top: -8, left: 163, width: 130, height: 8 }}
                    className="overflow-hidden rounded-t-sm"
                  >
                    <div className="flex h-full items-stretch gap-1 px-2">
                      <div className="flex-1 rounded-t-sm bg-cyan-300/50" />
                      <div className="flex-1 rounded-t-sm bg-cyan-100/30" />
                      <div className="flex-1 rounded-t-sm bg-cyan-300/50" />
                    </div>
                  </div>

                  {/* 北墙窗户（贴在右侧墙外，高150，居中） */}
                  <div
                    style={{ position: 'absolute', right: -8, top: 108, width: 8, height: 150 }}
                    className="overflow-hidden rounded-r-sm"
                  >
                    <div className="flex h-full flex-col items-stretch gap-1 py-2">
                      <div className="flex-1 rounded-r-sm bg-cyan-300/50" />
                      <div className="flex-1 rounded-r-sm bg-cyan-100/30" />
                      <div className="flex-1 rounded-r-sm bg-cyan-300/50" />
                    </div>
                  </div>

                  {/* 房间平面图容器（overflow-hidden 裁剪床） */}
                  <div className="isolate size-full overflow-hidden rounded-2xl border-2 border-dashed border-amber-300/40 bg-indigo-950/60">
                    <Bed roomRotation={roomRotation} effectiveScale={effectiveScale} />
                    <Wardrobe roomRotation={roomRotation} effectiveScale={effectiveScale} />
                    {manualWardrobes.map(item => (
                      <Wardrobe
                        key={item.id}
                        value={item}
                        isManual
                        deleteMode={deleteMode}
                        roomRotation={roomRotation}
                        effectiveScale={effectiveScale}
                        onChange={next => updateManualWardrobe(item.id, next)}
                        onDeleteClick={() => setPendingDeleteId(item.id ?? null)}
                      />
                    ))}
                    <BathroomDoor x={doorX} onXChange={setDoorX} roomRotation={roomRotation} effectiveScale={effectiveScale} />

                    {/* 东墙门口（下方，左侧，宽85）铰链在左端（靠南墙），门扇向室内逆时针展开，开后靠南墙 */}
                    {/* 门洞覆盖层：遮住该段虚线边框 */}
                    <div style={{ position: 'absolute', left: 30, bottom: 0, width: 85, height: 6 }} className="bg-indigo-950/80" />
                    {/* 门扇（左侧竖线，开启位置靠南墙）+ 开合弧（圆心=铰链=左下角，从左上逆时针扫到右下） */}
                    <div
                      style={{
                        position: 'absolute', left: 30, bottom: 0, width: 85, height: 85,
                        borderLeft: '2px solid rgba(251,191,36,0.7)',
                        borderTop: '1.5px dashed rgba(251,191,36,0.45)',
                        borderRight: '1.5px dashed rgba(251,191,36,0.45)',
                        borderTopRightRadius: '100%',
                        pointerEvents: 'none',
                      }}
                    />
                  </div>

                  {/* 房门 标注 */}
                  <div
                    style={{ position: 'absolute', bottom: 12, left: 14, pointerEvents: 'none' }}
                    className="select-none flex items-center gap-1 rounded-full border border-amber-200/25 bg-indigo-950/55 px-2.5 py-0.5 backdrop-blur-sm"
                  >
                    <span className="text-[9px] font-bold tracking-widest text-amber-200/65">房门</span>
                  </div>
                </div>

                {/* 北 - 右侧居中 */}
                <div className="col-start-3 row-start-2 flex items-center gap-1 pl-2">
                  <div className="h-px w-3 bg-amber-300/35" />
                  <span className="select-none text-[11px] font-bold tracking-[0.25em] text-amber-200/80">北</span>
                </div>

                {/* 东 - 下方居中 */}
                <div className="col-start-2 row-start-3 flex flex-col items-center gap-1 pt-2">
                  <div className="h-3 w-px bg-amber-300/35" />
                  <span className="select-none text-[11px] font-bold tracking-[0.25em] text-amber-200/80">东</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-full border border-white/10 bg-white/10 p-1.5 shadow-lg shadow-black/20 backdrop-blur">
          <button
            type="button"
            onClick={openAddDialog}
            className="rounded-full bg-amber-300 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 active:scale-95"
          >
            新增元素
          </button>
          <button
            type="button"
            onClick={() => setDeleteMode(mode => !mode)}
            disabled={manualWardrobes.length === 0}
            className="rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-slate-100 transition hover:border-red-300/70 hover:bg-red-400/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-45"
          >
            删除元素
          </button>
        </div>
      </section>

      {isAddDialogOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/65 px-6 backdrop-blur-sm">
          <form onSubmit={addManualWardrobe} className="w-full max-w-sm rounded-3xl border border-white/15 bg-slate-900/95 p-6 shadow-2xl shadow-black/50">
            <h2 className="text-lg font-semibold text-amber-100">新增元素</h2>
            <p className="mt-2 text-sm text-slate-300">请输入元素名称，确认后会添加到房间中。</p>
            <input
              autoFocus
              value={newElementName}
              onChange={e => setNewElementName(e.target.value)}
              placeholder="请输入名称"
              className="mt-5 w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-amber-200/70"
            />
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAddDialogOpen(false)}
                className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={!newElementName.trim()}
                className="rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                确认
              </button>
            </div>
          </form>
        </div>
      )}

      {pendingDeleteId && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/65 px-6 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-slate-900/95 p-6 shadow-2xl shadow-black/50">
            <h2 className="text-lg font-semibold text-red-100">确认删除</h2>
            <p className="mt-2 text-sm text-slate-300">确认删除「{pendingDeleteName}」吗？该操作不可恢复。</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingDeleteId(null)}
                className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
              >
                取消
              </button>
              <button
                type="button"
                onClick={confirmDeleteManualWardrobe}
                className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-400"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
