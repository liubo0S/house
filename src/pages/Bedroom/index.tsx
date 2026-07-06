import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePersistentState } from '../../hooks/usePersistentState'
import AddElementDialog from './components/AddElementDialog'
import ConfirmDeleteDialog from './components/ConfirmDeleteDialog'
import RoomFloorPlan from './components/RoomFloorPlan'
import Toolbar from './components/Toolbar'
import { loadDoorX } from './model/doorPosition'
import { type Furniture, createManualElement } from './model/furniture'
import { FURNITURE_STORAGE_KEY, loadFurniture } from './model/furnitureStore'
import { useAutoScale } from './hooks/useAutoScale'

export default function BedroomPage() {
  const [doorX, setDoorX] = useState(loadDoorX)
  const { cardRef, naturalSize, autoScale } = useAutoScale()
  const [userZoom, setUserZoom] = useState(1)
  const [roomRotation, setRoomRotation] = useState(0)
  const [furniture, setFurniture] = usePersistentState(FURNITURE_STORAGE_KEY, loadFurniture)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [deleteMode, setDeleteMode] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const effectiveScale = autoScale * userZoom
  const isRotated90 = roomRotation % 180 !== 0
  const visualW = naturalSize.w ? (isRotated90 ? naturalSize.h : naturalSize.w) * effectiveScale : undefined
  const visualH = naturalSize.w ? (isRotated90 ? naturalSize.w : naturalSize.h) * effectiveScale : undefined
  const removableCount = furniture.filter(f => f.removable).length
  const pendingDeleteName = furniture.find(f => f.id === pendingDeleteId)?.name

  const addManualElement = (name: string) => {
    setFurniture(prev => [...prev, createManualElement(name, prev.filter(f => f.removable).length)])
    setIsAddDialogOpen(false)
  }

  const updateFurniture = (id: string, next: Furniture) => {
    setFurniture(prev => prev.map(f => (f.id === id ? next : f)))
  }

  const confirmDelete = () => {
    if (!pendingDeleteId) return
    setFurniture(prev => prev.filter(f => f.id !== pendingDeleteId))
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
              <RoomFloorPlan
                furniture={furniture}
                roomRotation={roomRotation}
                effectiveScale={effectiveScale}
                deleteMode={deleteMode}
                doorX={doorX}
                onDoorXChange={setDoorX}
                onFurnitureChange={updateFurniture}
                onDeleteRequest={setPendingDeleteId}
              />
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
            disabled={removableCount === 0}
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
