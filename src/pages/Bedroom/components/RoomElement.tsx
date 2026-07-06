import { useCallback, useEffect, useState } from 'react'
import { useLatestRef } from '../../../hooks/useLatestRef'
import { ROOM_H, ROOM_W, clamp, clampToRoom, maxLenFromEnd } from '../geometry'
import { type DragDelta, useRoomDrag } from '../useRoomDrag'
import { RotateIcon } from './icons'

const STORAGE_KEY = 'bedroom_wardrobe_state'
const THICKNESS = 60
const DEFAULT_LEN = 260
const MIN_LEN = 60

export interface RoomElementItem {
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
  value?: RoomElementItem
  onChange?: (value: RoomElementItem) => void
  isManual?: boolean
  deleteMode?: boolean
  onDeleteClick?: () => void
}

function normalizeState(state: RoomElementItem): RoomElementItem {
  const len = Math.max(MIN_LEN, state.len || MIN_LEN)
  const rotation = state.rotation || 0
  const clamped = clampToRoom(state.x, state.y, len, THICKNESS, rotation)
  return { ...state, ...clamped, len, rotation }
}

function loadState(): RoomElementItem {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return normalizeState(JSON.parse(saved))
  } catch { /* localStorage 不可用或数据损坏时回退默认值 */ }
  const len = DEFAULT_LEN
  const x = (ROOM_W - len) / 2
  const y = ROOM_H - THICKNESS - 20
  return { x, y, len, rotation: 0 }
}

/** 一次长度调整拖拽开始时的快照：固定端坐标、朝向、最大长度 */
interface ResizeStart {
  cos: number
  sin: number
  /** 固定不动的那一端（另一端跟随指针） */
  endX: number
  endY: number
  origLen: number
  maxLen: number
  /** +1：右侧手柄（固定左端，向右生长）；-1：左侧手柄（固定右端，向左生长） */
  sign: 1 | -1
}

function resizeStart(s: RoomElementItem, sign: 1 | -1): ResizeStart {
  const rad = (s.rotation * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const cx0 = s.x + s.len / 2
  const cy0 = s.y + THICKNESS / 2
  // 固定端在 -sign 方向：右侧手柄固定左端，左侧手柄固定右端
  const endX = cx0 - sign * (s.len / 2) * cos
  const endY = cy0 - sign * (s.len / 2) * sin
  const maxLen = maxLenFromEnd(endX, endY, s.rotation, THICKNESS, MIN_LEN, sign)
  return { cos, sin, endX, endY, origLen: s.len, maxLen, sign }
}

function resizeApply(local: { dx: number; dy: number }, st: ResizeStart): Pick<RoomElementItem, 'x' | 'y' | 'len'> {
  const delta = st.sign * (local.dx * st.cos + local.dy * st.sin)
  const newLen = clamp(st.origLen + delta, MIN_LEN, st.maxLen)
  const newCx = st.endX + st.sign * (newLen / 2) * st.cos
  const newCy = st.endY + st.sign * (newLen / 2) * st.sin
  return { x: newCx - newLen / 2, y: newCy - THICKNESS / 2, len: newLen }
}

export default function RoomElement({ roomRotation, effectiveScale, value, onChange, isManual = false, deleteMode = false, onDeleteClick }: Props) {
  const [internalState, setInternalState] = useState<RoomElementItem>(loadState)
  const state = value ? normalizeState(value) : internalState
  const stateRef = useLatestRef(state)

  const updateState = useCallback((updater: (prev: RoomElementItem) => RoomElementItem) => {
    const next = normalizeState(updater(stateRef.current))
    if (value && onChange) onChange(next)
    else setInternalState(next)
  }, [onChange, value, stateRef])

  useEffect(() => {
    if (!value) localStorage.setItem(STORAGE_KEY, JSON.stringify(internalState))
  }, [internalState, value])

  // 拖拽移动
  const onDragStart = useCallback(() => ({ ...stateRef.current }), [stateRef])
  const onDrag = useCallback(({ local }: DragDelta, start: RoomElementItem) => {
    const clamped = clampToRoom(start.x + local.dx, start.y + local.dy, start.len, THICKNESS, start.rotation)
    updateState(prev => ({ ...prev, ...clamped }))
  }, [updateState])
  const onBodyPointerDown = useRoomDrag({
    roomRotation,
    effectiveScale,
    ignoreSelector: '[data-rotate-handle],[data-resize-handle],[data-delete-handle]',
    onStart: onDragStart,
    onDrag,
  })

  // 旋转
  const onRotateClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    updateState(prev => ({ ...prev, rotation: prev.rotation + 90 }))
  }, [updateState])

  // 长度调整：右侧手柄固定左端、左侧手柄固定右端
  const onResize = useCallback(({ local }: DragDelta, st: ResizeStart) => {
    updateState(prev => ({ ...prev, ...resizeApply(local, st) }))
  }, [updateState])
  const onResizeRightStart = useCallback(() => resizeStart(stateRef.current, 1), [stateRef])
  const onResizeLeftStart = useCallback(() => resizeStart(stateRef.current, -1), [stateRef])
  const onResizeRightPointerDown = useRoomDrag({ roomRotation, effectiveScale, onStart: onResizeRightStart, onDrag: onResize })
  const onResizeLeftPointerDown = useRoomDrag({ roomRotation, effectiveScale, onStart: onResizeLeftStart, onDrag: onResize })

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
        touchAction: 'none',
      }}
      onPointerDown={onBodyPointerDown}
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
          aria-label={name ? `删除元素 ${name}` : '删除元素'}
          style={{ position: 'absolute', top: -9, right: -9, zIndex: 20, transform: `rotate(${-rotation}deg)` }}
          className="grid size-5 place-items-center rounded-full border border-white/70 bg-red-500 text-sm font-bold leading-none text-white shadow-md shadow-black/30 transition-transform hover:scale-110 active:scale-95"
          onPointerDown={e => e.stopPropagation()}
          onClick={e => { e.preventDefault(); e.stopPropagation(); onDeleteClick?.() }}
        >
          <span className="-mt-px block leading-none">−</span>
        </button>
      )}

      {/* 旋转按钮 */}
      <button
        data-rotate-handle
        type="button"
        title="点击旋转 90°"
        aria-label="旋转 90°"
        style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}
        className="grid size-7 cursor-pointer place-items-center rounded-full border border-amber-100/40 bg-amber-300 p-0 text-slate-900 shadow-md shadow-black/30 transition-transform hover:scale-110 active:scale-95"
        onClick={onRotateClick}
      >
        <RotateIcon />
      </button>

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
          touchAction: 'none',
        }}
        className="flex items-center justify-center rounded-sm border border-amber-200/50 bg-slate-600/80 hover:bg-amber-300/60"
        onPointerDown={onResizeLeftPointerDown}
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
          touchAction: 'none',
        }}
        className="flex items-center justify-center rounded-sm border border-amber-200/50 bg-slate-600/80 hover:bg-amber-300/60"
        onPointerDown={onResizeRightPointerDown}
      >
        <div className="flex gap-0.5">
          <div className="h-3 w-px rounded-full bg-amber-200/70" />
          <div className="h-3 w-px rounded-full bg-amber-200/70" />
        </div>
      </div>
    </div>
  )
}
