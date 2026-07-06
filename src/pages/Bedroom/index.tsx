import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AddElementDialog from './components/AddElementDialog'
import BathroomDoor from './components/BathroomDoor'
import Bed from './components/Bed'
import ConfirmDeleteDialog from './components/ConfirmDeleteDialog'
import RoomElement, { type RoomElementItem } from './components/RoomElement'
import Toolbar from './components/Toolbar'
import { DOOR_W, loadDoorX } from './doorPosition'
import { ROOM_H, ROOM_W } from './geometry'
import { ENTRY_DOOR, NORTH_WINDOW, WEST_WINDOW } from './roomLayout'
import { useAutoScale } from './useAutoScale'

const MANUAL_ELEMENTS_KEY = 'bedroom_manual_wardrobes_state'
const ELEMENT_THICKNESS = 60
const MANUAL_DEFAULT_LEN = 100

function loadManualElements(): RoomElementItem[] {
  try {
    const saved = localStorage.getItem(MANUAL_ELEMENTS_KEY)
    if (!saved) return []
    const parsed = JSON.parse(saved)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(item => typeof item?.id === 'string' && typeof item?.name === 'string')
  } catch {
    return []
  }
}

function createManualElement(name: string, count: number): RoomElementItem {
  const offset = (count % 6) * 14
  const x = Math.min(ROOM_W - MANUAL_DEFAULT_LEN - 16, 24 + offset)
  const y = Math.min(ROOM_H - ELEMENT_THICKNESS - 16, 24 + offset)
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
  const { cardRef, naturalSize, autoScale } = useAutoScale()
  const [userZoom, setUserZoom] = useState(1)
  const [roomRotation, setRoomRotation] = useState(0)
  const [manualElements, setManualElements] = useState<RoomElementItem[]>(loadManualElements)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [deleteMode, setDeleteMode] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const effectiveScale = autoScale * userZoom
  const isRotated90 = roomRotation % 180 !== 0
  const visualW = naturalSize.w ? (isRotated90 ? naturalSize.h : naturalSize.w) * effectiveScale : undefined
  const visualH = naturalSize.w ? (isRotated90 ? naturalSize.w : naturalSize.h) * effectiveScale : undefined
  const pendingDeleteName = manualElements.find(item => item.id === pendingDeleteId)?.name

  useEffect(() => {
    localStorage.setItem(MANUAL_ELEMENTS_KEY, JSON.stringify(manualElements))
  }, [manualElements])

  const addManualElement = (name: string) => {
    setManualElements(prev => [...prev, createManualElement(name, prev.length)])
    setIsAddDialogOpen(false)
  }

  const updateManualElement = (id: string | undefined, next: RoomElementItem) => {
    if (!id) return
    setManualElements(prev => prev.map(item => (item.id === id ? { ...next, id, name: item.name } : item)))
  }

  const confirmDelete = () => {
    if (!pendingDeleteId) return
    setManualElements(prev => prev.filter(item => item.id !== pendingDeleteId))
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
        <Toolbar
          onZoomIn={() => setUserZoom(z => Math.min(2.5, +(z + 0.15).toFixed(2)))}
          onZoomOut={() => setUserZoom(z => Math.max(0.3, +(z - 0.15).toFixed(2)))}
          onRotate={() => setRoomRotation(r => r + 90)}
          onReset={() => { setUserZoom(1); setRoomRotation(0) }}
        />

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
                  {/* 西墙窗户（贴在上方墙外，居中） */}
                  <div
                    style={{ position: 'absolute', top: -WEST_WINDOW.thickness, left: WEST_WINDOW.left, width: WEST_WINDOW.width, height: WEST_WINDOW.thickness }}
                    className="overflow-hidden rounded-t-sm"
                  >
                    <div className="flex h-full items-stretch gap-1 px-2">
                      <div className="flex-1 rounded-t-sm bg-cyan-300/50" />
                      <div className="flex-1 rounded-t-sm bg-cyan-100/30" />
                      <div className="flex-1 rounded-t-sm bg-cyan-300/50" />
                    </div>
                  </div>

                  {/* 北墙窗户（贴在右侧墙外，居中） */}
                  <div
                    style={{ position: 'absolute', right: -NORTH_WINDOW.thickness, top: NORTH_WINDOW.top, width: NORTH_WINDOW.thickness, height: NORTH_WINDOW.height }}
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
                    <RoomElement roomRotation={roomRotation} effectiveScale={effectiveScale} />
                    {manualElements.map(item => (
                      <RoomElement
                        key={item.id}
                        value={item}
                        isManual
                        deleteMode={deleteMode}
                        roomRotation={roomRotation}
                        effectiveScale={effectiveScale}
                        onChange={next => updateManualElement(item.id, next)}
                        onDeleteClick={() => setPendingDeleteId(item.id ?? null)}
                      />
                    ))}
                    <BathroomDoor x={doorX} onXChange={setDoorX} roomRotation={roomRotation} effectiveScale={effectiveScale} />

                    {/* 东墙门口（下方，左侧）铰链在左端（靠南墙），门扇向室内逆时针展开，开后靠南墙 */}
                    {/* 门洞覆盖层：遮住该段虚线边框 */}
                    <div style={{ position: 'absolute', left: ENTRY_DOOR.left, bottom: 0, width: ENTRY_DOOR.width, height: 6 }} className="bg-indigo-950/80" />
                    {/* 门扇（左侧竖线，开启位置靠南墙）+ 开合弧（圆心=铰链=左下角，从左上逆时针扫到右下） */}
                    <div
                      style={{
                        position: 'absolute', left: ENTRY_DOOR.left, bottom: 0, width: ENTRY_DOOR.width, height: ENTRY_DOOR.width,
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
            onClick={() => setIsAddDialogOpen(true)}
            className="rounded-full bg-amber-300 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 active:scale-95"
          >
            新增元素
          </button>
          <button
            type="button"
            onClick={() => setDeleteMode(mode => !mode)}
            disabled={manualElements.length === 0}
            className="rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-slate-100 transition hover:border-red-300/70 hover:bg-red-400/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-45"
          >
            删除元素
          </button>
        </div>
      </section>

      {isAddDialogOpen && (
        <AddElementDialog onSubmit={addManualElement} onClose={() => setIsAddDialogOpen(false)} />
      )}

      {pendingDeleteId && (
        <ConfirmDeleteDialog
          name={pendingDeleteName}
          onConfirm={confirmDelete}
          onClose={() => setPendingDeleteId(null)}
        />
      )}
    </main>
  )
}
