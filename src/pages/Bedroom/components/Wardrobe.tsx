import { useCallback, useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'bedroom_wardrobe_state'
const THICKNESS = 60
const DEFAULT_LEN = 260
const MIN_LEN = 60
const ROOM_W = 460
const ROOM_H = 370
const WALL_BUFFER = 2

export interface WardrobeItem {
  id?: string
  name?: string
  x: number
  y: number
  len: number
  rotation: number
}

interface Props {
  roomRotation: number
  effectiveScale: number
  value?: WardrobeItem
  onChange?: (value: WardrobeItem) => void
  isManual?: boolean
  deleteMode?: boolean
  onDeleteClick?: () => void
}

/** 将屏幕坐标增量转换为房间本地坐标增量 */
function screenToRoom(dx: number, dy: number, roomRotation: number, scale: number) {
  const angle = -(roomRotation * Math.PI) / 180
  const sx = dx / scale, sy = dy / scale
  return {
    dx: sx * Math.cos(angle) - sy * Math.sin(angle),
    dy: sx * Math.sin(angle) + sy * Math.cos(angle),
  }
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

/** 从左端点出发（右侧拖拽），计算在房间内能放下的最大柜子长度 */
function maxLenFromLeft(lx: number, ly: number, rotation: number): number {
  const rad = (rotation * Math.PI) / 180
  const cos = Math.cos(rad), sin = Math.sin(rad)
  const cosA = Math.abs(cos), sinA = Math.abs(sin)
  const fits = (L: number) => {
    const cx = lx + (L / 2) * cos
    const cy = ly + (L / 2) * sin
    const rw = L * cosA + THICKNESS * sinA
    const rh = L * sinA + THICKNESS * cosA
    return cx - rw / 2 >= WALL_BUFFER && cx + rw / 2 <= ROOM_W - WALL_BUFFER
        && cy - rh / 2 >= WALL_BUFFER && cy + rh / 2 <= ROOM_H - WALL_BUFFER
  }
  if (!fits(MIN_LEN)) return MIN_LEN
  let lo = MIN_LEN, hi = ROOM_W
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2
    if (fits(mid)) lo = mid; else hi = mid
  }
  return lo
}

/** 从右端点出发（左侧拖拽），计算在房间内能放下的最大柜子长度 */
function maxLenFromRight(rx: number, ry: number, rotation: number): number {
  const rad = (rotation * Math.PI) / 180
  const cos = Math.cos(rad), sin = Math.sin(rad)
  const cosA = Math.abs(cos), sinA = Math.abs(sin)
  const fits = (L: number) => {
    const cx = rx - (L / 2) * cos
    const cy = ry - (L / 2) * sin
    const rw = L * cosA + THICKNESS * sinA
    const rh = L * sinA + THICKNESS * cosA
    return cx - rw / 2 >= WALL_BUFFER && cx + rw / 2 <= ROOM_W - WALL_BUFFER
        && cy - rh / 2 >= WALL_BUFFER && cy + rh / 2 <= ROOM_H - WALL_BUFFER
  }
  if (!fits(MIN_LEN)) return MIN_LEN
  let lo = MIN_LEN, hi = ROOM_W
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2
    if (fits(mid)) lo = mid; else hi = mid
  }
  return lo
}

/** 根据旋转角计算旋转后包围盒并约束位置（宽=len, 高=THICKNESS） */
function clampToRoom(x: number, y: number, len: number, rotation: number) {
  const rad = (rotation * Math.PI) / 180
  const cosR = Math.abs(Math.cos(rad))
  const sinR = Math.abs(Math.sin(rad))
  const rw = len * cosR + THICKNESS * sinR
  const rh = len * sinR + THICKNESS * cosR
  const xMin = rw / 2 - len / 2 + WALL_BUFFER
  const xMax = ROOM_W - rw / 2 - len / 2 - WALL_BUFFER
  const yMin = rh / 2 - THICKNESS / 2 + WALL_BUFFER
  const yMax = ROOM_H - rh / 2 - THICKNESS / 2 - WALL_BUFFER
  return {
    x: clamp(x, xMin, Math.max(xMin, xMax)),
    y: clamp(y, yMin, Math.max(yMin, yMax)),
  }
}

function normalizeState(state: WardrobeItem): WardrobeItem {
  const len = Math.max(MIN_LEN, state.len || MIN_LEN)
  const rotation = state.rotation || 0
  const clamped = clampToRoom(state.x, state.y, len, rotation)
  return { ...state, ...clamped, len, rotation }
}

function loadState(): WardrobeItem {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return normalizeState(JSON.parse(saved))
  } catch {}
  const len = DEFAULT_LEN
  const x = (ROOM_W - len) / 2
  const y = ROOM_H - THICKNESS - 20
  return { x, y, len, rotation: 0 }
}

export default function Wardrobe({ roomRotation, effectiveScale, value, onChange, isManual = false, deleteMode = false, onDeleteClick }: Props) {
  const [internalState, setInternalState] = useState<WardrobeItem>(loadState)
  const state = value ? normalizeState(value) : internalState
  const stateRef = useRef(state)
  stateRef.current = state

  const updateState = useCallback((updater: (prev: WardrobeItem) => WardrobeItem) => {
    const next = normalizeState(updater(stateRef.current))
    if (value && onChange) onChange(next)
    else setInternalState(next)
  }, [onChange, value])

  useEffect(() => {
    if (!value) localStorage.setItem(STORAGE_KEY, JSON.stringify(internalState))
  }, [internalState, value])

  // 拖拽移动
  const onDragMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-rotate-handle],[data-resize-handle],[data-delete-handle]')) return
    e.preventDefault()
    const startX = e.clientX
    const startY = e.clientY
    const origX = stateRef.current.x
    const origY = stateRef.current.y
    const snapRoomRotation = roomRotation
    const snapScale = effectiveScale
    const onMove = (ev: MouseEvent) => {
      const { len, rotation } = stateRef.current
      const local = screenToRoom(ev.clientX - startX, ev.clientY - startY, snapRoomRotation, snapScale)
      const clamped = clampToRoom(origX + local.dx, origY + local.dy, len, rotation)
      updateState(prev => ({ ...prev, ...clamped }))
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [roomRotation, effectiveScale, updateState])

  const onDragTouchStart = useCallback((e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('[data-rotate-handle],[data-resize-handle],[data-delete-handle]')) return
    e.preventDefault()
    const touch = e.touches[0]
    const startX = touch.clientX
    const startY = touch.clientY
    const origX = stateRef.current.x
    const origY = stateRef.current.y
    const snapRoomRotation = roomRotation
    const snapScale = effectiveScale
    const onMove = (ev: TouchEvent) => {
      ev.preventDefault()
      const t = ev.touches[0]
      const { len, rotation } = stateRef.current
      const local = screenToRoom(t.clientX - startX, t.clientY - startY, snapRoomRotation, snapScale)
      const clamped = clampToRoom(origX + local.dx, origY + local.dy, len, rotation)
      updateState(prev => ({ ...prev, ...clamped }))
    }
    const onUp = () => {
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
    }
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onUp)
  }, [roomRotation, effectiveScale, updateState])

  // 旋转
  const onRotateClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    updateState(prev => ({ ...prev, rotation: prev.rotation + 90 }))
  }, [updateState])

  // 右侧 handle：固定左端，改 len 并反推 x/y
  const onResizeRightMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startY = e.clientY
    const { x: origX, y: origY, len: origLen, rotation: origRot } = stateRef.current
    const snapRoomRotation = roomRotation
    const snapScale = effectiveScale
    const rad = (origRot * Math.PI) / 180
    const cos = Math.cos(rad), sin = Math.sin(rad)
    // 固定左端绝对坐标
    const cx0 = origX + origLen / 2, cy0 = origY + THICKNESS / 2
    const leftEndX = cx0 - (origLen / 2) * cos
    const leftEndY = cy0 - (origLen / 2) * sin
    const maxLen = maxLenFromLeft(leftEndX, leftEndY, origRot)
    const onMove = (ev: MouseEvent) => {
      const local = screenToRoom(ev.clientX - startX, ev.clientY - startY, snapRoomRotation, snapScale)
      const delta = local.dx * cos + local.dy * sin
      const newLen = clamp(origLen + delta, MIN_LEN, maxLen)
      const newCx = leftEndX + (newLen / 2) * cos
      const newCy = leftEndY + (newLen / 2) * sin
      updateState(prev => ({ ...prev, x: newCx - newLen / 2, y: newCy - THICKNESS / 2, len: newLen }))
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [roomRotation, effectiveScale, updateState])

  const onResizeRightTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const touch = e.touches[0]
    const startX = touch.clientX
    const startY = touch.clientY
    const { x: origX, y: origY, len: origLen, rotation: origRot } = stateRef.current
    const snapRoomRotation = roomRotation
    const snapScale = effectiveScale
    const rad = (origRot * Math.PI) / 180
    const cos = Math.cos(rad), sin = Math.sin(rad)
    const cx0 = origX + origLen / 2, cy0 = origY + THICKNESS / 2
    const leftEndX = cx0 - (origLen / 2) * cos
    const leftEndY = cy0 - (origLen / 2) * sin
    const maxLen = maxLenFromLeft(leftEndX, leftEndY, origRot)
    const onMove = (ev: TouchEvent) => {
      ev.preventDefault()
      const t = ev.touches[0]
      const local = screenToRoom(t.clientX - startX, t.clientY - startY, snapRoomRotation, snapScale)
      const delta = local.dx * cos + local.dy * sin
      const newLen = clamp(origLen + delta, MIN_LEN, maxLen)
      const newCx = leftEndX + (newLen / 2) * cos
      const newCy = leftEndY + (newLen / 2) * sin
      updateState(prev => ({ ...prev, x: newCx - newLen / 2, y: newCy - THICKNESS / 2, len: newLen }))
    }
    const onUp = () => {
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
    }
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onUp)
  }, [roomRotation, effectiveScale, updateState])

  // 左侧 handle：固定右端，改 len 并反推 x/y
  const onResizeLeftMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startY = e.clientY
    const { x: origX, y: origY, len: origLen, rotation: origRot } = stateRef.current
    const snapRoomRotation = roomRotation
    const snapScale = effectiveScale
    const rad = (origRot * Math.PI) / 180
    const cos = Math.cos(rad), sin = Math.sin(rad)
    // 固定右端绝对坐标
    const cx0 = origX + origLen / 2, cy0 = origY + THICKNESS / 2
    const rightEndX = cx0 + (origLen / 2) * cos
    const rightEndY = cy0 + (origLen / 2) * sin
    const maxLen = maxLenFromRight(rightEndX, rightEndY, origRot)
    const onMove = (ev: MouseEvent) => {
      const local = screenToRoom(ev.clientX - startX, ev.clientY - startY, snapRoomRotation, snapScale)
      const delta = -(local.dx * cos + local.dy * sin)
      const newLen = clamp(origLen + delta, MIN_LEN, maxLen)
      const newCx = rightEndX - (newLen / 2) * cos
      const newCy = rightEndY - (newLen / 2) * sin
      updateState(prev => ({ ...prev, x: newCx - newLen / 2, y: newCy - THICKNESS / 2, len: newLen }))
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [roomRotation, effectiveScale, updateState])

  const onResizeLeftTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const touch = e.touches[0]
    const startX = touch.clientX
    const startY = touch.clientY
    const { x: origX, y: origY, len: origLen, rotation: origRot } = stateRef.current
    const snapRoomRotation = roomRotation
    const snapScale = effectiveScale
    const rad = (origRot * Math.PI) / 180
    const cos = Math.cos(rad), sin = Math.sin(rad)
    const cx0 = origX + origLen / 2, cy0 = origY + THICKNESS / 2
    const rightEndX = cx0 + (origLen / 2) * cos
    const rightEndY = cy0 + (origLen / 2) * sin
    const maxLen = maxLenFromRight(rightEndX, rightEndY, origRot)
    const onMove = (ev: TouchEvent) => {
      ev.preventDefault()
      const t = ev.touches[0]
      const local = screenToRoom(t.clientX - startX, t.clientY - startY, snapRoomRotation, snapScale)
      const delta = -(local.dx * cos + local.dy * sin)
      const newLen = clamp(origLen + delta, MIN_LEN, maxLen)
      const newCx = rightEndX - (newLen / 2) * cos
      const newCy = rightEndY - (newLen / 2) * sin
      updateState(prev => ({ ...prev, x: newCx - newLen / 2, y: newCy - THICKNESS / 2, len: newLen }))
    }
    const onUp = () => {
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
    }
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onUp)
  }, [roomRotation, effectiveScale, updateState])

  const { x, y, len, rotation, name } = state

  // 柜门数量（每扇约65px宽）
  const doorCount = Math.max(2, Math.round(len / 65))

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: len,
        height: THICKNESS,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: 'center',
        cursor: 'grab',
        userSelect: 'none',
      }}
      onMouseDown={onDragMouseDown}
      onTouchStart={onDragTouchStart}
    >
      {/* 柜体 */}
      <div className="relative size-full overflow-hidden rounded-lg border border-amber-200/30 bg-gradient-to-b from-slate-700/80 to-slate-800/70 shadow-lg shadow-black/40">
        {/* 顶部装饰线 */}
        <div className="absolute inset-x-0 top-0 h-2 rounded-t-lg bg-slate-600/60 border-b border-amber-100/10" />
        {/* 柜门分隔 */}
        <div className="absolute inset-x-2 bottom-2 top-3 flex gap-1">
          {Array.from({ length: doorCount }).map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm border border-slate-500/50 bg-slate-700/50 flex items-center justify-center"
            >
              <div className="h-3 w-1 rounded-full bg-amber-200/40" />
            </div>
          ))}
        </div>
        {name && (
          <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center px-2">
            <span className="max-w-full truncate rounded-full bg-slate-950/45 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-amber-100 shadow-sm">
              {name}
            </span>
          </div>
        )}
      </div>

      {isManual && deleteMode && (
        <button
          data-delete-handle
          type="button"
          title="删除元素"
          style={{ position: 'absolute', top: -9, right: -9, zIndex: 20, transform: `rotate(${-rotation}deg)` }}
          className="grid size-5 place-items-center rounded-full border border-white/70 bg-red-500 text-sm font-bold leading-none text-white shadow-md shadow-black/30 transition-transform hover:scale-110 active:scale-95"
          onMouseDown={e => { e.preventDefault(); e.stopPropagation() }}
          onTouchStart={e => { e.preventDefault(); e.stopPropagation() }}
          onClick={e => { e.preventDefault(); e.stopPropagation(); onDeleteClick?.() }}
        >
          <span className="-mt-px block leading-none">−</span>
        </button>
      )}

      {/* 旋转按钮 */}
      <div
        data-rotate-handle
        title="点击旋转 90°"
        style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}
        className="grid size-7 cursor-pointer place-items-center rounded-full border border-amber-100/40 bg-amber-300 shadow-md shadow-black/30 transition-transform hover:scale-110 active:scale-95"
        onClick={onRotateClick}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-900">
          <path d="M21 2v6h-6" />
          <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
        </svg>
      </div>

      {/* 左侧长度调整 handle */}
      <div
        data-resize-handle
        title="拖拽调整长度"
        style={{
          position: 'absolute',
          left: -6,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 10,
          width: 12,
          height: 28,
          cursor: 'ew-resize',
        }}
        className="flex items-center justify-center rounded-sm border border-amber-200/50 bg-slate-600/80 hover:bg-amber-300/60"
        onMouseDown={onResizeLeftMouseDown}
        onTouchStart={onResizeLeftTouchStart}
      >
        <div className="flex gap-0.5">
          <div className="h-3 w-px rounded-full bg-amber-200/70" />
          <div className="h-3 w-px rounded-full bg-amber-200/70" />
        </div>
      </div>

      {/* 右侧长度调整 handle */}
      <div
        data-resize-handle
        title="拖拽调整长度"
        style={{
          position: 'absolute',
          right: -6,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 10,
          width: 12,
          height: 28,
          cursor: 'ew-resize',
        }}
        className="flex items-center justify-center rounded-sm border border-amber-200/50 bg-slate-600/80 hover:bg-amber-300/60"
        onMouseDown={onResizeRightMouseDown}
        onTouchStart={onResizeRightTouchStart}
      >
        <div className="flex gap-0.5">
          <div className="h-3 w-px rounded-full bg-amber-200/70" />
          <div className="h-3 w-px rounded-full bg-amber-200/70" />
        </div>
      </div>
    </div>
  )
}
